import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  isLoading = false
}) {
  if (!isOpen) return null;

  const typeConfig = {
    warning: { icon: AlertTriangle, iconColor: 'text-amber-600 bg-amber-50 border-amber-200', btnColor: 'bg-amber-600 hover:bg-amber-700 text-white' },
    danger: { icon: AlertTriangle, iconColor: 'text-rose-600 bg-rose-50 border-rose-200', btnColor: 'bg-rose-600 hover:bg-rose-700 text-white' },
    info: { icon: Info, iconColor: 'text-sky-600 bg-sky-50 border-sky-200', btnColor: 'bg-sky-600 hover:bg-sky-700 text-white' },
    success: { icon: CheckCircle2, iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200', btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white' }
  };

  const { icon: Icon, iconColor, btnColor } = typeConfig[type] || typeConfig.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${iconColor}`}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{message}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 ${btnColor}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
