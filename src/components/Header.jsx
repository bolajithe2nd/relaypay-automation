import relayPayLogo from '../assets/relaypay-logo.png';

export default function Header() {
  return (
    <header className="border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-page)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <img src={relayPayLogo} alt="RelayPay logo" className="h-10 w-auto object-contain" />
        <nav className="ui-text-secondary hidden items-center gap-8 text-sm md:flex">
          <span>Voice Support</span>
          <span>Security</span>
          <span>Compliance</span>
        </nav>
      </div>
    </header>
  );
}
