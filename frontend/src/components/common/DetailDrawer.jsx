import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-2xl'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className={`w-screen ${width} transform bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col`}>
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
