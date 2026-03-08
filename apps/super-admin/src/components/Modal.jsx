import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {Object} actions - { primary: { label, onClick, loading }, secondary: { label, onClick } }
 * @param {string} size - Modal size: 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions = {},
  size = 'md',
}) {
  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const { primary, secondary } = actions;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50" role="presentation">
        <div
          className={`bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full mx-4 ${sizeClasses[size]}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 id="modal-title" className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          {(primary || secondary) && (
            <div className="flex gap-3 p-6 border-t border-slate-700 justify-end">
              {secondary && (
                <button
                  onClick={secondary.onClick}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  {secondary.label}
                </button>
              )}
              {primary && (
                <button
                  onClick={primary.onClick}
                  disabled={primary.loading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    primary.loading
                      ? 'bg-blue-500/50 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {primary.loading ? 'Loading...' : primary.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
