import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea({ label, error, className = '', ...props }, ref) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-sayo-creamMuted mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`input-field min-h-[100px] resize-y ${error ? 'border-red-500' : ''}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
