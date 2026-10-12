import React from 'react';
import { useStore } from '../../store';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-white shadow-lg transition-all transform duration-200 animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'border-emerald-200 shadow-emerald-500/5'
                : isError
                ? 'border-red-200 shadow-red-500/5'
                : isWarning
                ? 'border-amber-200 shadow-amber-500/5'
                : 'border-stone-200 shadow-stone-500/5'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-teal-600" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <div className="text-sm font-semibold text-stone-900 leading-tight">
                  {toast.title}
                </div>
              )}
              <div className="text-xs text-stone-600 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
