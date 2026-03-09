export function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
