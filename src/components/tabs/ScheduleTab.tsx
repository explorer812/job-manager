import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, MapPin, Banknote, ChevronLeft, ChevronRight, ExternalLink, Link2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../ui/StatusBadge';
import { CompanyTag } from '../ui/CompanyTag';
import { reminderEventMap } from '../../utils/mockData';
import type { JobCard, ScheduleFilter, ReminderEvent } from '../../types';

const filters: { key: ScheduleFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'urgent', label: '即将截止' },
  { key: 'week', label: '本周' },
  { key: 'overdue', label: '已逾期' },
];

// 统计类型
interface ScheduleStats {
  urgent: number;
  week: number;
  overdue: number;
  all: number;
}

export function ScheduleTab() {
  const { 
    scheduleFilter, 
    setScheduleFilter, 
    updateJob,
    addToast, 
    jobs,
  } = useStore();
  const [undoJob, setUndoJob] = useState<{ id: string; timeoutId: number; originalHasReminder: boolean; originalReminderEvent?: ReminderEvent; originalDeadline?: string } | null>(null);
  
  // 日历状态
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 直接在组件内部计算日程职位
  const getScheduleJobs = () => {
    const now = new Date();

    // 只显示有提醒且未归档的职位
    const jobsWithReminder = jobs.filter((job) => job.hasReminder && !job.isArchived);

    return jobsWithReminder
      .filter((job) => {
        if (!job.position.deadline) return false;
        const deadline = new Date(job.position.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        switch (scheduleFilter) {
          case 'urgent':
            return daysUntil <= 3 && daysUntil >= 0;
          case 'week':
            return daysUntil <= 7 && daysUntil >= 0;
          case 'overdue':
            return daysUntil < 0;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (!a.position.deadline || !b.position.deadline) return 0;
        return new Date(a.position.deadline).getTime() - new Date(b.position.deadline).getTime();
      });
  };

  const visibleJobs = getScheduleJobs();

  // 计算统计数据
  const stats: ScheduleStats = useMemo(() => {
    const now = new Date();
    const jobsWithReminder = jobs.filter((job) => job.hasReminder && !job.isArchived);
    
    return {
      urgent: jobsWithReminder.filter(job => {
        if (!job.position.deadline) return false;
        const daysUntil = Math.ceil((new Date(job.position.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 3 && daysUntil >= 0;
      }).length,
      week: jobsWithReminder.filter(job => {
        if (!job.position.deadline) return false;
        const daysUntil = Math.ceil((new Date(job.position.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7 && daysUntil >= 0;
      }).length,
      overdue: jobsWithReminder.filter(job => {
        if (!job.position.deadline) return false;
        const daysUntil = Math.ceil((new Date(job.position.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil < 0;
      }).length,
      all: jobsWithReminder.length,
    };
  }, [jobs]);

  // 日历数据
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: { date: number; hasEvent: boolean; isToday: boolean }[] = [];
    
    // 填充月初空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: 0, hasEvent: false, isToday: false });
    }
    
    // 填充日期
    const today = new Date();
    const jobsWithReminder = jobs.filter((job) => job.hasReminder && !job.isArchived && job.position.deadline);
    
    for (let date = 1; date <= daysInMonth; date++) {
      const hasEvent = jobsWithReminder.some(job => {
        const deadline = new Date(job.position.deadline!);
        return deadline.getDate() === date && deadline.getMonth() === month && deadline.getFullYear() === year;
      });
      const isToday = today.getDate() === date && today.getMonth() === month && today.getFullYear() === year;
      
      days.push({ date, hasEvent, isToday });
    }
    
    return days;
  }, [currentMonth, jobs]);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getDaysUntil = (deadline?: string) => {
    if (!deadline) return 0;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'bg-gray-200';
    if (days <= 3) return 'bg-[#FFB7B2]';
    if (days <= 7) return 'bg-[#FFDAC1]';
    return 'bg-[#B5EAD7]';
  };

  const handleArchive = (job: JobCard) => {
    // 清除之前的撤销
    if (undoJob) {
      clearTimeout(undoJob.timeoutId);
    }

    // 只取消提醒，不标记为已归档
    updateJob(job.id, {
      hasReminder: false,
      reminderEvent: undefined,
      position: {
        ...job.position,
        deadline: undefined,
      },
    });

    const timeoutId = window.setTimeout(() => {
      setUndoJob(null);
    }, 3000);

    setUndoJob({ id: job.id, timeoutId, originalHasReminder: job.hasReminder ?? false, originalReminderEvent: job.reminderEvent, originalDeadline: job.position.deadline });

    addToast({
      message: '提醒已取消',
      type: 'info',
      action: {
        label: '撤销',
        onClick: () => {
          clearTimeout(timeoutId);
          // 恢复提醒
          updateJob(job.id, {
            hasReminder: undoJob?.originalHasReminder || false,
            reminderEvent: undoJob?.originalReminderEvent,
            position: {
              ...job.position,
              deadline: undoJob?.originalDeadline,
            },
          });
          setUndoJob(null);
        },
      },
      duration: 3000,
    });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 直方图数据
  const barData = [
    { key: 'urgent', label: '即将截止', value: stats.urgent, color: 'bg-[#FFB7B2]' },
    { key: 'week', label: '本周', value: stats.week, color: 'bg-[#FFDAC1]' },
    { key: 'overdue', label: '已逾期', value: stats.overdue, color: 'bg-gray-300' },
    { key: 'all', label: '全部', value: stats.all, color: 'bg-[#B5EAD7]' },
  ];

  const maxValue = Math.max(...barData.map(d => d.value), 1);

  return (
    <div className="h-full flex bg-[#F8F6F3]">
      {/* 左侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 头部筛选 */}
        <div className="p-4 lg:p-6 border-b border-gray-100/50 bg-white/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1A1A2E] flex items-center gap-2">
              <Calendar size={20} className="text-[#FFB6A3]" />
              求职日程
            </h2>
            <span className="text-sm text-[#6B7280]">{visibleJobs.length} 个职位</span>
          </div>

          {/* 筛选按钮 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setScheduleFilter(filter.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  scheduleFilter === filter.key
                    ? 'bg-[#FFD1DC] text-[#1A1A2E]'
                    : 'bg-white text-[#6B7280] hover:bg-[#FFD1DC]/30'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 职位列表 */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {visibleJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-[#FFD1DC]/30 flex items-center justify-center mb-4">
                <Calendar size={40} className="text-[#FFB6A3]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">暂无紧急日程</h3>
              <p className="text-[#9CA3AF]">当前筛选条件下没有职位</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {visibleJobs.map((job, index) => {
                const daysUntil = getDaysUntil(job.position.deadline);
                const urgencyColor = getUrgencyColor(daysUntil);

                return (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* 时间轴线条 */}
                    {index < visibleJobs.length - 1 && (
                      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-100" />
                    )}

                    <div className="flex gap-4">
                      {/* 时间轴节点 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full ${urgencyColor} flex items-center justify-center flex-shrink-0`}
                        >
                          <span className="text-sm font-bold text-[#1A1A2E]">
                            {daysUntil >= 0 ? daysUntil : '!'}
                          </span>
                        </div>
                        <span className="text-xs text-[#6B7280] mt-1">
                          {daysUntil >= 0 ? '天后' : '逾期'}
                        </span>
                      </div>

                      {/* 卡片内容 */}
                      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                        {/* 头部 */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-[#1A1A2E]">{job.company.name}</h3>
                                <CompanyTag type={job.company.type} size="sm" />
                                {/* 提醒事件标签 */}
                                {job.reminderEvent && reminderEventMap[job.reminderEvent] && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${reminderEventMap[job.reminderEvent].bg} ${reminderEventMap[job.reminderEvent].color}`}>
                                    {reminderEventMap[job.reminderEvent].label}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#6B7280]">{job.position.title}</p>
                            </div>
                          </div>
                          
                          {/* 取消提醒按钮 */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleArchive(job)}
                            className="p-2 rounded-full bg-[#B5EAD7]/20 text-[#1A1A2E] hover:bg-[#B5EAD7]/40 transition-colors flex-shrink-0"
                            title="取消提醒"
                          >
                            <CheckCircle2 size={20} />
                          </motion.button>
                        </div>

                        {/* 职位信息 */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280] mb-3">
                          <div className="flex items-center gap-1">
                            <Banknote size={14} className="text-[#B5EAD7]" />
                            <span className="font-medium text-[#1A1A2E]">{job.position.salary}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{job.position.location}</span>
                          </div>
                          {job.position.deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>截止：{new Date(job.position.deadline).toLocaleDateString('zh-CN')}</span>
                            </div>
                          )}
                        </div>

                        {/* 链接区域 */}
                        {job.applyLink && (
                          <div className="mb-3">
                            <motion.a
                              href={job.applyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F6F3] text-[#1A1A2E] text-sm hover:bg-[#FFD1DC]/30 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link2 size={14} className="text-[#FFB6A3]" />
                              <span className="truncate max-w-[200px]">
                                {job.reminderEvent === 'interview' ? '面试链接' : 
                                 job.reminderEvent === 'writtenTest' ? '笔试链接' : 
                                 job.reminderEvent === 'toOffer' ? 'offer链接' : '投递链接'}
                              </span>
                              <ExternalLink size={12} className="text-[#9CA3AF]" />
                            </motion.a>
                          </div>
                        )}

                        {/* 底部状态 */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <StatusBadge status={job.position.status} size="sm" />
                          <span className="text-xs text-[#9CA3AF]">
                            {new Date(job.createdAt).toLocaleDateString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                            })} 收藏
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 右侧边栏 - 日历和统计 */}
      <aside className="hidden xl:flex flex-col w-72 p-5 bg-white border-l border-gray-100/50 overflow-y-auto flex-shrink-0">
        {/* 日历组件 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A2E]">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            <div className="flex gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-[#F8F6F3] text-[#6B7280]"
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-[#F8F6F3] text-[#6B7280]"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
          
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs text-[#9CA3AF] py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-xl relative
                  ${day.date === 0 ? '' : 'cursor-pointer hover:bg-[#F8F6F3]'}
                  ${day.isToday ? 'bg-[#FFD1DC] text-[#1A1A2E] font-semibold' : ''}
                  ${day.date !== 0 && !day.isToday ? 'text-[#1A1A2E]' : ''}
                `}
              >
                {day.date !== 0 && day.date}
                {day.hasEvent && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#FFB6A3]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 直方图统计 */}
        <div>
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-4">待办统计</h3>
          <div className="space-y-4">
            {barData.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">{item.label}</span>
                  <span className="font-semibold text-[#1A1A2E]">{item.value}</span>
                </div>
                <div className="h-2 bg-[#F8F6F3] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / maxValue) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
