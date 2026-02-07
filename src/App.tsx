import { useState, useRef, useEffect } from 'react';
import { useStore } from './store/useStore';
import { TabBar } from './components/ui/TabBar';
import { ToastContainer } from './components/ui/Toast';
import { PageTransition } from './components/PageTransition';
import { BookmarkTab } from './components/tabs/BookmarkTab';
import { AITab } from './components/tabs/AITab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { LoginModal } from './components/auth/LoginModal';
import { SettingsModal } from './components/auth/SettingsModal';
import { motion } from 'framer-motion';
import { Briefcase, User, LogOut, Settings, ChevronDown } from 'lucide-react';

function App() {
  const { activeTab } = useStore();

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex">
      {/* 左侧导航栏 - 桌面端显示 */}
      <aside className="hidden lg:flex flex-col w-72 bg-white h-screen sticky top-0 border-r border-[#EFECE6] flex-shrink-0 overflow-hidden">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#2D2D2D] flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black text-[#2D2D2D] tracking-tight">求职助手</h1>
        </motion.div>

        {/* 统计卡片 */}
        <div className="px-6 pb-6 space-y-4">
          <StatCard />
          <ScheduleStatCard />
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-4 py-4 space-y-2 pb-6">
          <p className="px-4 text-[10px] font-black text-[#8C837A] tracking-widest uppercase mb-4">
            导航
          </p>
          {[
            { id: 'bookmark', label: '收藏', icon: 'bookmark' },
            { id: 'ai', label: '问AI', icon: 'sparkles' },
            { id: 'schedule', label: '日程', icon: 'calendar' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => useStore.getState().setActiveTab(tab.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#2D2D2D] text-white'
                  : 'text-[#8C837A] hover:bg-[#F9F7F2] hover:text-[#2D2D2D]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <NavIcon name={tab.icon} active={activeTab === tab.id} />
              {tab.label}
            </motion.button>
          ))}
        </nav>

        {/* 底部用户区域 */}
        <SidebarUserSection />

      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* 顶部导航栏 - 最小化设计 */}
        <header className="flex items-center justify-end px-6 py-3 bg-[#F9F7F2] sticky top-0 z-40 flex-shrink-0">
        </header>

        {/* 页面内容 */}
        <div className="flex-1 px-6 pb-6 overflow-hidden relative">
          <PageTransition tab="bookmark">
            <BookmarkTab />
          </PageTransition>

          <PageTransition tab="ai">
            <AITab />
          </PageTransition>

          <PageTransition tab="schedule">
            <ScheduleTab />
          </PageTransition>
        </div>
      </main>

      {/* 底部 Tab Bar - 移动端显示 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <TabBar />
      </div>

      {/* Toast 通知 */}
      <ToastContainer />

      {/* 登录/注册弹窗 */}
      <LoginModal />
      {/* 账号设置弹窗 */}
      <SettingsModal />
    </div>
  );
}

// 统计卡片组件 - 已收藏职位
function StatCard() {
  const { jobs } = useStore();
  const totalJobs = jobs.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="stat-card p-6 relative overflow-hidden rounded-3xl bg-[#F2EAE4]"
    >
      <p className="text-[10px] font-black text-[#8C837A] tracking-widest uppercase mb-2">
        已收藏职位
      </p>
      <p className="text-7xl font-black text-[#2D2D2D] tracking-tighter leading-none">
        {totalJobs}
      </p>
      <div className="absolute bottom-4 right-4 opacity-5">
        <Briefcase className="w-24 h-24" strokeWidth={1} />
      </div>
    </motion.div>
  );
}

// 统计卡片组件 - 日程数
function ScheduleStatCard() {
  const { jobs } = useStore();
  // 计算有提醒且未归档的职位数量
  const scheduleCount = jobs.filter((job) => job.hasReminder && !job.isArchived).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="stat-card p-6 relative overflow-hidden rounded-3xl bg-[#EAF4F4]"
    >
      <p className="text-[10px] font-black text-[#8C837A] tracking-widest uppercase mb-2">
        待办日程
      </p>
      <p className="text-7xl font-black text-[#2D2D2D] tracking-tighter leading-none">
        {scheduleCount}
      </p>
      <div className="absolute bottom-4 right-4 opacity-5">
        <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </motion.div>
  );
}

// 导航图标组件
function NavIcon({ name, active }: { name: string; active: boolean }) {
  const colorClass = active ? 'text-white' : 'text-[#8C837A]';

  switch (name) {
    case 'bookmark':
      return (
        <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    default:
      return null;
  }
}

// 侧边栏用户区域组件
function SidebarUserSection() {
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
      <div className="px-6 py-4 border-t border-[#EFECE6]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F9F7F2] hover:bg-[#F2EAE4] transition-all border border-dashed border-[#8C837A]/30"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <User size={18} className="text-[#8C837A]" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black text-[#2D2D2D] tracking-tight">登录 / 注册</span>
        </motion.button>
      </div>
    );
  }

  // 已登录状态
  return (
    <div ref={menuRef} className="px-6 py-4 border-t border-[#EFECE6] relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F9F7F2] hover:bg-[#F2EAE4] transition-all"
      >
        {/* 头像 */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.nickname}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
              user.nickname
            )} flex items-center justify-center`}
          >
            <span className="text-white font-black text-sm">
              {getInitial(user.nickname)}
            </span>
          </div>
        )}

        {/* 昵称 */}
        <div className="flex-1 text-left">
          <span className="text-sm font-black text-[#2D2D2D] block truncate tracking-tight">
            {user.nickname}
          </span>
          <span className="text-xs text-[#8C837A]">已登录</span>
        </div>

        <ChevronDown size={16} className={`text-[#8C837A] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* 下拉菜单 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-6 right-6 mb-2 bg-white rounded-2xl shadow-lg border border-[#EFECE6] overflow-hidden z-50"
        >
          <button
            onClick={() => {
              setIsSettingsModalOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-[#2D2D2D] hover:bg-[#F9F7F2] transition-colors"
          >
            <Settings size={16} className="text-[#8C837A]" />
            账号设置
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-[#2D2D2D] hover:bg-[#FDE2E4]/50 transition-colors border-t border-[#EFECE6]"
          >
            <LogOut size={16} className="text-[#8C837A]" />
            退出登录
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default App;
