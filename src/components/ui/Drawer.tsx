import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  position?: 'right' | 'bottom';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = 'w-[85vw] max-w-lg',
  position = 'right',
}: DrawerProps) {
  // 锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  const isRight = position === 'right';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{
              opacity: 0,
              x: isRight ? '100%' : 0,
              y: isRight ? 0 : '100%',
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              x: isRight ? '100%' : 0,
              y: isRight ? 0 : '100%',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed z-[70] bg-white shadow-2xl border border-[#EFECE6] overflow-hidden ${
              isRight
                ? `right-0 top-0 bottom-0 ${width} rounded-l-3xl`
                : `bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl`
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFECE6] sticky top-0 bg-white z-10">
              {title ? (
                <h2 className="text-xl font-black text-[#2D2D2D] tracking-tight">{title}</h2>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[#F9F7F2] transition-colors"
              >
                <X size={20} className="text-[#8C837A]" strokeWidth={2.5} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-64px)]">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
