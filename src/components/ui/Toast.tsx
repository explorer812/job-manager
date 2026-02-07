import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertCircle, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  success: 'bg-[#EAF4F4] text-[#2D2D2D] border border-[#EAF4F4]',
  info: 'bg-[#E2EAFC] text-[#2D2D2D] border border-[#E2EAFC]',
  warning: 'bg-[#FFEDD8] text-[#2D2D2D] border border-[#FFEDD8]',
  error: 'bg-[#FDE2E4] text-[#2D2D2D] border border-[#FDE2E4]',
};

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`pointer-events-auto mx-auto max-w-sm w-full ${colorMap[toast.type]} rounded-2xl shadow-lg`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon size={20} className="flex-shrink-0" strokeWidth={2.5} />
                <p className="flex-1 text-sm font-black">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="text-sm font-black underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-full hover:bg-black/10 transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
