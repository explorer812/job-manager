import { motion } from 'framer-motion';

interface AIAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  isTyping?: boolean;
}

export function AIAvatar({ size = 'md', isTyping = false }: AIAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const eyeSize = size === 'sm' ? 2 : size === 'md' ? 2.5 : 3;

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* 背景圆形 */}
      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#B5EAD7] via-[#C7CEEA] to-[#FFB6A3] p-[2px]">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {/* 机器人脸 */}
          <svg
            viewBox="0 0 40 40"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 脸部底色 */}
            <circle cx="20" cy="20" r="18" fill="#F8F9FA" />
            
            {/* 左耳/天线 */}
            <motion.circle
              cx="8"
              cy="12"
              r="3"
              fill="#B5EAD7"
              animate={isTyping ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            
            {/* 右耳/天线 */}
            <motion.circle
              cx="32"
              cy="12"
              r="3"
              fill="#C7CEEA"
              animate={isTyping ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
            />
            
            {/* 左眼 */}
            <motion.ellipse
              cx="14"
              cy="18"
              rx={eyeSize}
              ry={eyeSize}
              fill="#2D3748"
              animate={isTyping ? { ry: [eyeSize, 0.5, eyeSize] } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            
            {/* 右眼 */}
            <motion.ellipse
              cx="26"
              cy="18"
              rx={eyeSize}
              ry={eyeSize}
              fill="#2D3748"
              animate={isTyping ? { ry: [eyeSize, 0.5, eyeSize] } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            
            {/* 腮红 - 左 */}
            <circle cx="10" cy="24" r="2.5" fill="#FFB6A3" opacity="0.6" />
            
            {/* 腮红 - 右 */}
            <circle cx="30" cy="24" r="2.5" fill="#FFB6A3" opacity="0.6" />
            
            {/* 嘴巴 */}
            <motion.path
              d="M 16 26 Q 20 29 24 26"
              stroke="#2D3748"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={isTyping ? { d: ['M 16 26 Q 20 29 24 26', 'M 16 27 Q 20 30 24 27', 'M 16 26 Q 20 29 24 26'] } : {}}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </svg>
        </div>
      </div>
      
      {/* 在线状态指示器 */}
      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#B5EAD7] rounded-full border-2 border-white" />
    </div>
  );
}
