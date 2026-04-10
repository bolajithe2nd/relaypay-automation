import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VapiImport from "@vapi-ai/web";

const ASSISTANT_ID =
  import.meta.env.VITE_VAPI_ASSISTANT_ID ||
  "ad2629e8-42ff-4f55-a196-a62be73a0da5";
const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const isPlaceholderKey = !PUBLIC_KEY || PUBLIC_KEY === "your_key_here";
const hasAssistantId = Boolean(
  ASSISTANT_ID && ASSISTANT_ID !== "your_assistant_id_here",
);

/** Daily / Vapi may emit this on normal hang-up; it is not a user-facing failure. */
function isBenignCallEndError(payload) {
  if (payload == null || typeof payload !== "object") return false;
  const root = payload;
  const inner =
    root.error != null && typeof root.error === "object" ? root.error : root;
  if (inner.type === "ejected") return true;
  if (typeof inner.msg === "string" && /meeting has ended/i.test(inner.msg)) {
    return true;
  }
  return false;
}

/** Vapi / HTTP layers sometimes pass nested objects; React can only render strings (or elements). */
function toUserErrorString(value, fallback = "A VAPI error occurred.") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (value instanceof Error) return value.message || fallback;
  if (typeof value === "object") {
    const msg = value.message;
    const dailyMsg = value.msg;
    const err = value.error;
    const code = value.statusCode;
    if (typeof dailyMsg === "string" && dailyMsg.trim()) return dailyMsg;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err === "string" && err.trim()) return err;
    if (err != null && typeof err === "object") {
      const inner = toUserErrorString(err, "");
      if (inner) return inner;
    }
    if (msg != null && typeof msg === "object") {
      const inner = toUserErrorString(msg, "");
      if (inner) return inner;
    }
    if (typeof code === "number") {
      const hint =
        typeof err === "string"
          ? err
          : typeof msg === "string"
            ? msg
            : "Request failed";
      return `${hint} (HTTP ${code})`;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function vapiErrorMessage(payload) {
  if (payload == null) return "A VAPI error occurred.";
  if (typeof payload === "string") return payload;
  if (payload.error !== undefined) {
    const fromError = toUserErrorString(payload.error, "");
    if (fromError) return fromError;
  }
  return toUserErrorString(payload);
}

export function useVapi() {
  const VapiClient = VapiImport?.default ?? VapiImport;
  const hasPublicKey = !isPlaceholderKey && hasAssistantId;
  const vapiRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState(() => {
    if (isPlaceholderKey) {
      return "Missing VAPI key. Set VITE_VAPI_PUBLIC_KEY in .env.";
    }
    if (!hasAssistantId) {
      return "Missing assistant ID. Set VITE_VAPI_ASSISTANT_ID in .env.";
    }
    return "";
  });

  useEffect(() => {
    const publicKey = PUBLIC_KEY;

    if (!hasPublicKey || !hasAssistantId) return undefined;

    const vapi = new VapiClient(publicKey);
    vapiRef.current = vapi;

    const onCallStart = () => {
      setError("");
      setIsCallActive(true);
      setStatus("Connected");
    };

    const onCallEnd = () => {
      setError("");
      setIsCallActive(false);
      setIsSpeaking(false);
      setIsMuted(false);
      setStatus("Call ended");
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
      setStatus("Agent speaking");
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
      setStatus("Listening");
    };

    const onError = (eventError) => {
      if (isBenignCallEndError(eventError)) {
        setError("");
        return;
      }
      setError(vapiErrorMessage(eventError));
      setStatus("Error");
    };

    const onCallStartFailed = (event) => {
      const message =
        typeof event?.error === "string"
          ? event.error
          : toUserErrorString(event?.error, vapiErrorMessage(event));
      setError(message);
      setStatus("Error");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    vapi.on("call-start-failed", onCallStartFailed);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      vapi.off("call-start-failed", onCallStartFailed);
      vapi.stop();
      vapiRef.current = null;
    };
  }, [VapiClient, hasPublicKey]);

  const startCall = useCallback(
    async ({ customer_name, customer_email, issue_type }) => {
      if (!vapiRef.current) {
        setError(
          "VAPI is not initialized. Check VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID.",
        );
        return false;
      }

      setError("");
      setStatus("Connecting...");

      try {
        // @vapi-ai/web resolves with `null` on failure (after emitting error / call-start-failed); it does not always throw.
        const call = await vapiRef.current.start(ASSISTANT_ID, {
          variableValues: {
            customer_name,
            customer_first_name: customer_name.split(" ")[0],
            customer_email,
            issue_type,
          },
        });
        if (call == null) {
          setStatus("Error");
          setError(
            (prev) =>
              prev ||
              "Could not start the call. A 403 on POST /call/web usually means an auth or access issue: use the Public key from your Vapi dashboard (not the private key), and ensure this assistant belongs to the same Vapi account.",
          );
          return false;
        }
        return true;
      } catch (startError) {
        setStatus("Error");
        setError(toUserErrorString(startError, "Unable to start call."));
        return false;
      }
    },
    [],
  );

  const endCall = useCallback(() => {
    if (!vapiRef.current) return;
    vapiRef.current.stop();
  }, []);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;

    if (isMuted) {
      vapiRef.current.setMuted(false);
      setIsMuted(false);
      setStatus("Unmuted");
    } else {
      vapiRef.current.setMuted(true);
      setIsMuted(true);
      setStatus("Muted");
    }
  }, [isMuted]);

  return useMemo(
    () => ({
      isCallActive,
      isSpeaking,
      isMuted,
      status,
      error,
      startCall,
      endCall,
      toggleMute,
    }),
    [
      isCallActive,
      isSpeaking,
      isMuted,
      status,
      error,
      startCall,
      endCall,
      toggleMute,
    ],
  );
}
