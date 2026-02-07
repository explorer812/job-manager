import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { TabType } from '../types';

interface PageTransitionProps {
  children: React.ReactNode;
  tab: TabType;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export function PageTransition({ children, tab }: PageTransitionProps) {
  const { activeTab, slideDirection } = useStore();
  const isActive = activeTab === tab;

  // 根据滑动方向确定动画方向
  const direction = slideDirection === 'left' ? 1 : slideDirection === 'right' ? -1 : 0;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {isActive && (
        <motion.div
          key={tab}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="h-full w-full overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
