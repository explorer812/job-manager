import { motion } from 'framer-motion';
import type { JobStatus } from '../../types';
import { statusMap } from '../../utils/mockData';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
  onClick?: () => void;
  clickable?: boolean;
}

export function StatusBadge({ status, size = 'sm', onClick, clickable = false }: StatusBadgeProps) {
  const config = statusMap[status];
  const sizeClasses = size === 'sm' 
    ? 'px-3 py-1.5 text-xs' 
    : 'px-4 py-2 text-sm';

  return (
    <motion.span
      whileHover={clickable ? { scale: 1.05 } : undefined}
      whileTap={clickable ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bg} ${config.color}
        ${sizeClasses}
        ${clickable ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}
      `}
    >
      {config.label}
    </motion.span>
  );
}

// 状态选择器
interface StatusSelectorProps {
  currentStatus: JobStatus;
  onChange: (status: JobStatus) => void;
}

const statuses: JobStatus[] = ['new', 'inProgress', 'offer', 'rejected'];

export function StatusSelector({ currentStatus, onChange }: StatusSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const config = statusMap[status];
        const isActive = currentStatus === status;

        return (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(status)}
            className={`
              px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300
              ${isActive ? config.bg + ' ' + config.color + ' shadow-sm' : 'bg-white/60 text-[#6B7280] hover:bg-white'}
            `}
          >
            {isActive && (
              <motion.span
                layoutId="statusCheck"
                className="inline-block mr-1.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                ✓
              </motion.span>
            )}
            {config.label}
          </motion.button>
        );
      })}
    </div>
  );
}
