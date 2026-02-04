import { useStore } from './store/useStore';
import { TabBar } from './components/ui/TabBar';
import { ToastContainer } from './components/ui/Toast';
import { PageTransition } from './components/PageTransition';
import { BookmarkTab } from './components/tabs/BookmarkTab';
import { AITab } from './components/tabs/AITab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { LoginModal } from './components/auth/LoginModal';
import { SettingsModal } from './components/auth/SettingsModal';
import { UserMenu } from './components/auth/UserMenu';
import { motion } from 'framer-motion';

function App() {
  const { activeTab } = useStore();

  return (
    <div className="min-h-screen bg-[#F8F6F3] flex flex-col">
      {/* 顶部标题栏 - 桌面端显示 */}
      <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white sticky top-0 z-40 border-b border-gray-200/60 shadow-sm">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFD1DC] to-[#FFB6A3] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">J</span>
          </div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">求职助手</h1>
        </motion.div>

        {/* 桌面端 Tab 切换 - Pill 风格 */}
        <nav className="flex items-center gap-1 bg-[#F8F6F3] rounded-full p-1.5">
          {[
            { id: 'bookmark', label: '收藏' },
            { id: 'ai', label: '问AI' },
            { id: 'schedule', label: '日程' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => useStore.getState().setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-[#1A1A2E] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </nav>

        {/* 用户入口 */}
        <UserMenu />
      </header>

      {/* 移动端标题 */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFD1DC] to-[#FFB6A3] flex items-center justify-center">
            <span className="text-white font-bold">J</span>
          </div>
          <h1 className="text-lg font-bold text-[#1A1A2E]">求职助手</h1>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 relative overflow-hidden">
        <PageTransition tab="bookmark">
          <BookmarkTab />
        </PageTransition>

        <PageTransition tab="ai">
          <AITab />
        </PageTransition>

        <PageTransition tab="schedule">
          <ScheduleTab />
        </PageTransition>
      </main>

      {/* 底部 Tab Bar - 移动端显示 */}
      <div className="lg:hidden">
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

export default App;
