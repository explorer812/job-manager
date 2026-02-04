import { motion } from 'framer-motion';

interface CountdownRingProps {
  days: number;
  size?: number;
  strokeWidth?: number;
}

export function CountdownRing({ days, size = 48, strokeWidth = 4 }: CountdownRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // 计算颜色
  let color = '#B5EAD7'; // mint - >7天
  let isUrgent = false;
  if (days <= 3) {
    color = '#FFB7B2'; // coral - <3天
    isUrgent = true;
  } else if (days <= 7) {
    color = '#FFDAC1'; // peach - 3-7天
  }

  // 计算进度 (假设最大14天)
  const maxDays = 14;
  const progress = Math.max(0, Math.min(1, days / maxDays));
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 背景圆环 */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* 天数显示 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={days}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-sm font-bold ${isUrgent ? 'text-[#FFB7B2]' : 'text-[#2D3748]'}`}
        >
          {days > 99 ? '99+' : Math.max(0, days)}
        </motion.span>
        <span className="text-[8px] text-[#718096]">天</span>
      </div>

      {/* 紧急脉冲动画 */}
      {isUrgent && days >= 0 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#FFB7B2]"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </div>
  );
}
