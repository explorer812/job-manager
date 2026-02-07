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
      'from-[#FDE2E4] to-[#FDE2E4]',
      'from-[#FFEDD8] to-[#FFEDD8]',
      'from-[#E2EAFC] to-[#E2EAFC]',
      'from-[#EAF4F4] to-[#EAF4F4]',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // 获取昵称首字母
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 未登录状态 - 奶油风设计
  if (!user) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsLoginModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#EFECE6] shadow-sm hover:shadow-md transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-[#F9F7F2] flex items-center justify-center">
          <User size={16} className="text-[#8C837A]" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-black text-[#2D2D2D] tracking-tight">登录 / 注册</span>
      </motion.button>
    );
  }

  // 已登录状态 - 奶油风设计
  return (
    <div ref={menuRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#F9F7F2] rounded-full transition-all border border-[#EFECE6] shadow-sm"
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
        <span className="text-sm font-black text-[#2D2D2D] max-w-[80px] truncate hidden sm:block tracking-tight">
          {user.nickname}
        </span>

        {/* 下拉箭头 */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[#8C837A]" strokeWidth={2.5} />
        </motion.div>
      </motion.button>

      {/* 下拉菜单 - 奶油风设计 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[#EFECE6] overflow-hidden z-50"
          >
            {/* 用户信息 */}
            <div className="px-4 py-3 bg-[#F9F7F2] border-b border-[#EFECE6]">
              <p className="text-sm font-black text-[#2D2D2D] tracking-tight">{user.nickname}</p>
              <p className="text-xs text-[#8C837A] truncate font-medium">{user.email}</p>
            </div>

            {/* 菜单项 */}
            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#2D2D2D] hover:bg-[#F9F7F2] rounded-xl transition-colors font-black"
              >
                <Settings size={16} className="text-[#8C837A]" strokeWidth={2.5} />
                账号设置
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#2D2D2D] hover:bg-[#FDE2E4]/50 rounded-xl transition-colors font-black"
              >
                <LogOut size={16} className="text-[#8C837A]" strokeWidth={2.5} />
                退出登录
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
