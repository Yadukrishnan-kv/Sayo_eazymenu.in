import { forwardRef } from 'react';

export const Select = forwardRef(function Select({ label, error, options = [], className = '', ...props }, ref) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-sayo-creamMuted mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`input-field ${error ? 'border-red-500' : ''}`}
        aria-invalid={!!error}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
