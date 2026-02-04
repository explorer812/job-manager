"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function UserMenu() {
  const { user, setIsLoginModalOpen, logout, addToast, setIsSettingsModalOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    addToast({
      message: '已退出登录',
      type: 'info',
    });
  };

  // 生成头像背景色
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-[#B5EAD7] to-[#C7CEEA]',
      'from-[#FFD1DC] to-[#FFB6A3]',
      'from-[#C7CEEA] to-[#B5EAD7]',
      'from-[#FFB6A3] to-[#FFD1DC]',
      'from-[#B5EAD7] to-[#FFD1DC]',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // 获取昵称首字母
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 未登录状态
  if (!user) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsLoginModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B5EAD7]/20 to-[#C7CEEA]/20 hover:from-[#B5EAD7]/30 hover:to-[#C7CEEA]/30 rounded-full transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B5EAD7] to-[#C7CEEA] flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <span className="text-sm font-medium text-[#2D3748]">登录 / 注册</span>
      </motion.button>
    );
  }

  // 已登录状态
  return (
    <div ref={menuRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-full transition-all border border-gray-100"
      >
        {/* 头像 */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.nickname}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(
              user.nickname
            )} flex items-center justify-center`}
          >
            <span className="text-white font-medium text-sm">
              {getInitial(user.nickname)}
            </span>
          </div>
        )}

        {/* 昵称 */}
        <span className="text-sm font-medium text-[#2D3748] max-w-[80px] truncate hidden sm:block">
          {user.nickname}
        </span>

        {/* 下拉箭头 */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[#718096]" />
        </motion.div>
      </motion.button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            {/* 用户信息 */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#B5EAD7]/10 to-[#C7CEEA]/10 border-b border-gray-100">
              <p className="text-sm font-medium text-[#2D3748]">{user.nickname}</p>
              <p className="text-xs text-[#718096] truncate">{user.email}</p>
            </div>

            {/* 菜单项 */}
            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#2D3748] hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Settings size={16} className="text-[#718096]" />
                账号设置
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
