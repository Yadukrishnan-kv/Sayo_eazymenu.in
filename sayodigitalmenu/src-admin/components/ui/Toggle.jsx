export function Toggle({ checked, onChange, disabled, 'aria-label': ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sayo-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sayo-bg)] disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-green-500/80' : 'bg-sayo-muted/40'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
        aria-hidden
      />
    </button>
  );
}
