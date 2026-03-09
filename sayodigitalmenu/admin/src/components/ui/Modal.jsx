import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && ref.current) ref.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-lg',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        tabIndex={-1}
        className={`relative h-full ${widthClasses[size]} bg-sayo-surface border-l border-sayo-border shadow-2xl flex flex-col animate-drawer-in overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-sayo-border shrink-0">
          <h2 id="modal-title" className="text-xl font-display font-semibold text-sayo-accent">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-2 rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
