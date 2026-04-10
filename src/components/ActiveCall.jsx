export default function ActiveCall({
  caller,
  isSpeaking,
  isMuted,
  status,
  error,
  onToggleMute,
  onEndCall
}) {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)] p-8">
      <p className="text-xs font-medium uppercase tracking-wider text-[color:var(--accent-bright)]">
        Active voice support
      </p>
      <h1 className="ui-text-heading mt-2 text-2xl font-semibold">RelayPay Assistant</h1>
      <p className="ui-text-secondary mt-2 text-sm">
        {caller.fullName} ({caller.email})
      </p>

      <div className="mt-8 flex items-center gap-5">
        <div className="relative h-20 w-20 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-inset)]">
          <div
            className={`absolute inset-4 rounded-full bg-[color:var(--accent-primary)] transition ${
              isSpeaking ? 'scale-110 opacity-100' : 'scale-90 opacity-60'
            }`}
          />
          <div
            className={`absolute inset-1 rounded-full border border-[color:var(--accent-primary)] opacity-50 ${
              isSpeaking ? 'animate-ping' : ''
            }`}
          />
        </div>

        <div>
          <p className="ui-text-muted text-sm">Call status</p>
          <p className="ui-text-heading text-lg font-medium">{status || 'Connected'}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className="ui-text-body rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-inset)] px-5 py-3 text-sm font-medium transition hover:border-[color:var(--border-subtle)]"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          type="button"
          onClick={onEndCall}
          className="rounded-xl bg-[color:var(--btn-connect-bg)] px-5 py-3 text-sm font-semibold text-[color:var(--btn-connect-fg)] transition hover:bg-[color:var(--btn-connect-hover-bg)]"
        >
          End Call
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </section>
  );
}
