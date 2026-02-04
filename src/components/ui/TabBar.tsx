import { motion } from 'framer-motion';
import { Bookmark, Sparkles, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { TabType } from '../../types';

const tabs: { id: TabType; icon: typeof Bookmark; label: string }[] = [
  { id: 'bookmark', icon: Bookmark, label: '收藏' },
  { id: 'ai', icon: Sparkles, label: '问AI' },
  { id: 'schedule', icon: Calendar, label: '日程' },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-colors"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Icon
                  size={24}
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-[#B5EAD7]' : 'text-[#718096]'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isActive ? 'text-[#2D3748]' : 'text-[#718096]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#B5EAD7]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      {/* 安全区域占位 */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
