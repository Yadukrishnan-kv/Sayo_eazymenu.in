import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-sayo-creamMuted mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
