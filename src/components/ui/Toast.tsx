import { useState, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: AlertCircle,
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  info: 'bg-[#5a7a8a]/10 border-[#5a7a8a]/30 text-[#5a7a8a]',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  info: 'text-[#5a7a8a]',
  error: 'text-red-400',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Date.now().toString();
    setToasts(prev => [{ id, message, type, duration }, ...prev].slice(0, 6));
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const warning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, warning, info, error }}>
      {children}
      <div className="fixed top-20 right-6 z-[9999] space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto px-4 py-3 rounded-lg shadow-xl border backdrop-blur-sm animate-slide-in-right ${toastStyles[toast.type]}`}
              onClick={() => removeToast(toast.id)}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`} />
                <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                  className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
