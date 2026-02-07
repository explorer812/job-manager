import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, MapPin, Banknote, ChevronLeft, ChevronRight, ExternalLink, Link2, Edit2, Search, ChevronDown, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../ui/StatusBadge';
import { CompanyTag } from '../ui/CompanyTag';
import { reminderEventMap } from '../../utils/mockData';
import type { JobCard, EventTypeFilter, UrgencyFilter, ReminderEvent } from '../../types';

// 事件类型筛选选项
const eventTypeOptions: { key: EventTypeFilter; label: string }[] = [
  { key: 'all', label: '全部事件' },
  { key: 'toApply', label: '待投递' },
  { key: 'writtenTest', label: '待笔试' },
  { key: 'interview', label: '待面试' },
  { key: 'toOffer', label: '待接受' },
];

// 紧急程度筛选选项
const urgencyOptions: { key: UrgencyFilter; label: string }[] = [
  { key: 'all', label: '全部时间' },
  { key: 'urgent', label: '即将截止 (3天内)' },
  { key: 'week', label: '本周 (7天内)' },
  { key: 'overdue', label: '已逾期' },
];

// 统计类型
interface ScheduleStats {
  urgent: number;
  week: number;
  overdue: number;
  all: number;
  toApply: number;
  writtenTest: number;
  interview: number;
  toOffer: number;
}

export function ScheduleTab() {
  const { 
    eventTypeFilter,
    setEventTypeFilter,
    urgencyFilter,
    setUrgencyFilter,
    updateJob,
    addToast, 
    jobs,
  } = useStore();
  const [undoJob, setUndoJob] = useState<{ id: string; timeoutId: number; originalHasReminder: boolean; originalReminderEvent?: ReminderEvent; originalDeadline?: string } | null>(null);
  
  // 下拉菜单状态
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  
  // 日历状态
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 链接编辑状态
  const [editingLinkJob, setEditingLinkJob] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState('');
  
  // 选中日期筛选
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');

  // 直接在组件内部计算日程职位
  const getScheduleJobs = () => {
    const now = new Date();

    // 只显示有提醒且未归档的职位
    let jobsWithReminder = jobs.filter((job) => job.hasReminder && !job.isArchived);

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      jobsWithReminder = jobsWithReminder.filter((job) => 
        job.company.name.toLowerCase().includes(query) ||
        job.position.title.toLowerCase().includes(query) ||
        job.position.location.toLowerCase().includes(query)
      );
    }

    // 如果选中了日期，筛选该日期的职位
    if (selectedDate) {
      return jobsWithReminder.filter((job) => {
        if (!job.position.deadline) return false;
        const deadline = new Date(job.position.deadline);
        return deadline.getDate() === selectedDate.getDate() && 
               deadline.getMonth() === selectedDate.getMonth() && 
               deadline.getFullYear() === selectedDate.getFullYear();
      }).sort((a, b) => {
        if (!a.position.deadline || !b.position.deadline) return 0;
        return new Date(a.position.deadline).getTime() - new Date(b.position.deadline).getTime();
      });
    }

    // 按事件类型筛选
    if (eventTypeFilter !== 'all') {
      jobsWithReminder = jobsWithReminder.filter((job) => job.reminderEvent === eventTypeFilter);
    }

    // 按紧急程度筛选
    if (urgencyFilter !== 'all') {
      jobsWithReminder = jobsWithReminder.filter((job) => {
        if (!job.position.deadline) return false;
        const deadline = new Date(job.position.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        switch (urgencyFilter) {
          case 'urgent':
            return daysUntil <= 3 && daysUntil >= 0;
          case 'week':
            return daysUntil <= 7 && daysUntil >= 0;
          case 'overdue':
            return daysUntil < 0;
          default:
            return true;
        }
      });
    }

    return jobsWithReminder.sort((a, b) => {
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
      toApply: jobsWithReminder.filter(job => job.reminderEvent === 'toApply').length,
      writtenTest: jobsWithReminder.filter(job => job.reminderEvent === 'writtenTest').length,
      interview: jobsWithReminder.filter(job => job.reminderEvent === 'interview').length,
      toOffer: jobsWithReminder.filter(job => job.reminderEvent === 'toOffer').length,
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
    if (days < 0) return 'bg-[#EFECE6]';
    if (days <= 3) return 'bg-[#FDE2E4]';
    if (days <= 7) return 'bg-[#FFEDD8]';
    return 'bg-[#EAF4F4]';
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

  // 保存链接
  const handleSaveLink = () => {
    if (!editingLinkJob || !linkInput.trim()) return;
    
    updateJob(editingLinkJob, {
      scheduleLink: linkInput.trim(),
    });
    
    setEditingLinkJob(null);
    setLinkInput('');
    
    addToast({
      message: '链接已保存',
      type: 'success',
    });
  };

  // 取消编辑链接
  const handleCancelEditLink = () => {
    setEditingLinkJob(null);
    setLinkInput('');
  };

  // 开始编辑链接
  const handleEditLink = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setEditingLinkJob(jobId);
      setLinkInput(job.scheduleLink || '');
    }
  };

  // 点击日期筛选
  const handleDateClick = (date: number) => {
    if (date === 0) return;
    
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
    setSelectedDate(clickedDate);
    
    // 筛选该日期的职位
    const jobsOnDate = jobs.filter(job => {
      if (!job.hasReminder || job.isArchived || !job.position.deadline) return false;
      const deadline = new Date(job.position.deadline);
      return deadline.getDate() === date && 
             deadline.getMonth() === currentMonth.getMonth() && 
             deadline.getFullYear() === currentMonth.getFullYear();
    });
    
    // 如果有职位，显示该日期的职位
    if (jobsOnDate.length > 0) {
      // 临时显示该日期的职位
      setScheduleFilter('all');
    }
  };

  // 直方图数据 - 统一使用主题色调
  const barData = [
    { key: 'toApply', label: '待投递', value: stats.toApply, color: 'bg-[#2D2D2D]' },
    { key: 'writtenTest', label: '待笔试', value: stats.writtenTest, color: 'bg-[#4A4A4A]' },
    { key: 'interview', label: '待面试', value: stats.interview, color: 'bg-[#5C5C5C]' },
    { key: 'toOffer', label: '待接受', value: stats.toOffer, color: 'bg-[#6E6E6E]' },
    { key: 'urgent', label: '即将截止', value: stats.urgent, color: 'bg-[#2D2D2D]' },
    { key: 'week', label: '本周', value: stats.week, color: 'bg-[#4A4A4A]' },
    { key: 'overdue', label: '已逾期', value: stats.overdue, color: 'bg-[#8C837A]' },
    { key: 'all', label: '全部', value: stats.all, color: 'bg-[#2D2D2D]' },
  ];

  const maxValue = Math.max(...barData.map(d => d.value), 1);

  return (
    <div className="h-full flex">
      {/* 左侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 头部筛选 - 奶油风设计 */}
        <div className="p-4 lg:p-6 border-b border-[#EFECE6] flex-shrink-0">
          <div className="flex items-baseline gap-4 mb-6 flex-wrap">
            <h2 className="text-5xl font-black text-[#2D2D2D] tracking-tighter leading-none">
              求职日程
            </h2>
            <span className="text-lg font-black text-[#8C837A]">
              {visibleJobs.length} 个职位
            </span>
          </div>

          {/* 筛选下拉框和搜索框 */}
          <div className="flex items-center gap-3">
            {/* 事件类型下拉框 */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsEventTypeOpen(!isEventTypeOpen);
                  setIsUrgencyOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[#EFECE6] text-sm font-black text-[#2D2D2D] hover:border-[#2D2D2D] transition-all"
              >
                <span>{eventTypeOptions.find(o => o.key === eventTypeFilter)?.label}</span>
                <ChevronDown size={16} className={`text-[#8C837A] transition-transform ${isEventTypeOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isEventTypeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl border border-[#EFECE6] shadow-lg z-20 overflow-hidden"
                  >
                    {eventTypeOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => {
                          setEventTypeFilter(option.key);
                          setIsEventTypeOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-black transition-all ${
                          eventTypeFilter === option.key
                            ? 'bg-[#F9F7F2] text-[#2D2D2D]'
                            : 'text-[#8C837A] hover:bg-[#F9F7F2]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 紧急程度下拉框 */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUrgencyOpen(!isUrgencyOpen);
                  setIsEventTypeOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[#EFECE6] text-sm font-black text-[#2D2D2D] hover:border-[#2D2D2D] transition-all"
              >
                <span>{urgencyOptions.find(o => o.key === urgencyFilter)?.label}</span>
                <ChevronDown size={16} className={`text-[#8C837A] transition-transform ${isUrgencyOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isUrgencyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl border border-[#EFECE6] shadow-lg z-20 overflow-hidden"
                  >
                    {urgencyOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => {
                          setUrgencyFilter(option.key);
                          setIsUrgencyOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-black transition-all ${
                          urgencyFilter === option.key
                            ? 'bg-[#F9F7F2] text-[#2D2D2D]'
                            : 'text-[#8C837A] hover:bg-[#F9F7F2]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 清除筛选按钮 */}
            {(eventTypeFilter !== 'all' || urgencyFilter !== 'all') && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setEventTypeFilter('all');
                  setUrgencyFilter('all');
                }}
                className="flex items-center gap-1 px-3 py-2.5 text-sm font-black text-[#8C837A] hover:text-[#2D2D2D] transition-colors"
              >
                <X size={14} />
                清除筛选
              </motion.button>
            )}

            <div className="flex-1" />

            {/* 搜索框 - 位于最右侧 */}
            <div className="w-64 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C837A]" strokeWidth={2.5} />
                <input
                  type="text"
                  placeholder="搜索职位..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#EFECE6] text-sm text-[#2D2D2D] placeholder-[#A8A29E] font-medium focus:outline-none focus:border-[#2D2D2D] transition-all"
                />
              </div>
            </div>
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
              <div className="w-24 h-24 rounded-3xl bg-[#FDE2E4] flex items-center justify-center mb-4">
                <Calendar size={40} className="text-[#2D2D2D]" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-black text-[#2D2D2D] mb-2">暂无紧急日程</h3>
              <p className="text-[#8C837A]">当前筛选条件下没有职位</p>
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
                      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-[#EFECE6]" />
                    )}

                    <div className="flex gap-4">
                      {/* 时间轴节点 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full ${urgencyColor} flex items-center justify-center flex-shrink-0`}
                        >
                          <span className="text-sm font-black text-[#2D2D2D]">
                            {daysUntil >= 0 ? daysUntil : '!'}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#8C837A] mt-1">
                          {daysUntil >= 0 ? '天后' : '逾期'}
                        </span>
                      </div>

                      {/* 卡片内容 */}
                      <div className="flex-1 bg-white rounded-3xl p-5 shadow-sm">
                        {/* 头部 */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-[#2D2D2D] text-xl tracking-tight">{job.company.name}</h3>
                                <CompanyTag type={job.company.type} size="sm" />
                                {/* 提醒事件标签 */}
                                {job.reminderEvent && reminderEventMap[job.reminderEvent] && (
                                  <span className={`text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase ${reminderEventMap[job.reminderEvent].bg} ${reminderEventMap[job.reminderEvent].color}`}>
                                    {reminderEventMap[job.reminderEvent].label}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#8C837A] font-medium">{job.position.title}</p>
                            </div>
                          </div>
                          
                          {/* 取消提醒按钮 */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleArchive(job)}
                            className="p-2 rounded-full bg-[#EAF4F4] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white transition-colors flex-shrink-0"
                            title="取消提醒"
                          >
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                          </motion.button>
                        </div>

                        {/* 职位信息 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#8C837A] mb-3">
                          <div className="flex items-center gap-2">
                            <Banknote size={16} className="text-[#2D2D2D]" strokeWidth={2.5} />
                            <span className="font-black text-[#2D2D2D]">{job.position.salary}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#8C837A]" strokeWidth={2.5} />
                            <span className="font-medium">{job.position.location}</span>
                          </div>
                          {job.position.deadline && (
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-[#8C837A]" strokeWidth={2.5} />
                              <span className="font-medium">截止：{new Date(job.position.deadline).toLocaleDateString('zh-CN')}</span>
                            </div>
                          )}
                        </div>

                        {/* 链接区域 */}
                        <div className="mb-3">
                          {editingLinkJob === job.id ? (
                            // 编辑模式
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                placeholder="输入链接（如面试链接）"
                                className="flex-1 px-4 py-2 rounded-xl border border-[#EFECE6] text-sm focus:border-[#2D2D2D] focus:outline-none"
                                autoFocus
                              />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSaveLink}
                                className="px-4 py-2 rounded-xl bg-[#2D2D2D] text-white text-sm font-black"
                              >
                                保存
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCancelEditLink}
                                className="px-4 py-2 rounded-xl bg-[#F9F7F2] text-[#8C837A] text-sm font-black"
                              >
                                取消
                              </motion.button>
                            </div>
                          ) : job.scheduleLink ? (
                            // 显示链接
                            <div className="flex items-center gap-2">
                              <motion.a
                                href={job.scheduleLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F9F7F2] text-[#2D2D2D] text-sm hover:bg-[#FDE2E4]/30 transition-colors font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link2 size={14} className="text-[#2D2D2D]" strokeWidth={2.5} />
                                <span className="truncate max-w-[200px]">
                                  {job.reminderEvent === 'interview' ? '面试链接' : 
                                   job.reminderEvent === 'writtenTest' ? '笔试链接' : 
                                   job.reminderEvent === 'toOffer' ? 'offer链接' : '投递链接'}
                                </span>
                                <ExternalLink size={12} className="text-[#8C837A]" strokeWidth={2.5} />
                              </motion.a>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditLink(job.id)}
                                className="p-2 rounded-lg hover:bg-[#F9F7F2] text-[#8C837A] transition-colors"
                                title="修改链接"
                              >
                                <Edit2 size={14} strokeWidth={2.5} />
                              </motion.button>
                            </div>
                          ) : (
                            // 添加链接按钮
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleEditLink(job.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F9F7F2]/50 text-[#8C837A] text-sm hover:bg-[#F9F7F2] transition-colors border border-dashed border-[#EFECE6] font-medium"
                            >
                              <Link2 size={14} className="text-[#8C837A]" strokeWidth={2.5} />
                              <span>添加链接</span>
                            </motion.button>
                          )}
                        </div>

                        {/* 底部状态 */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#EFECE6]">
                          <StatusBadge status={job.position.status} size="sm" />
                          <span className="text-xs font-black text-[#8C837A] tracking-wider">
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
      <aside className="hidden xl:flex flex-col w-72 p-5 bg-white rounded-3xl h-[calc(100vh-8rem)] overflow-y-auto flex-shrink-0 ml-6">
        {/* 日历组件 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-[#2D2D2D] tracking-tight">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            <div className="flex gap-2">
               {selectedDate && (
                 <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => setSelectedDate(null)}
                   className="p-1.5 rounded-lg hover:bg-[#F9F7F2] text-[#8C837A] text-xs font-black"
                   title="清除日期筛选"
                 >
                   清除
                 </motion.button>
               )}
               <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-[#F9F7F2] text-[#8C837A]"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-[#F9F7F2] text-[#8C837A]"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
          
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-black text-[#8C837A] tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: day.date !== 0 ? 1.05 : 1 }}
                whileTap={{ scale: day.date !== 0 ? 0.95 : 1 }}
                onClick={() => handleDateClick(day.date)}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-xl relative font-black
                  ${day.date === 0 ? '' : 'cursor-pointer hover:bg-[#F9F7F2]'}
                  ${day.isToday ? 'bg-[#2D2D2D] text-white' : ''}
                  ${day.date !== 0 && !day.isToday ? 'text-[#2D2D2D]' : ''}
                  ${selectedDate && selectedDate.getDate() === day.date && 
                    selectedDate.getMonth() === currentMonth.getMonth() && 
                    selectedDate.getFullYear() === currentMonth.getFullYear() ? 
                    'ring-2 ring-[#2D2D2D] ring-inset' : ''}
                `}
              >
                {day.date !== 0 && day.date}
                {day.hasEvent && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#FDE2E4]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 直方图统计 */}
        <div>
          <h3 className="text-lg font-black text-[#2D2D2D] mb-6 tracking-tight">待办统计</h3>
          <div className="space-y-5">
            {barData.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8C837A] font-black">{item.label}</span>
                  <span className="font-black text-[#2D2D2D] text-lg">{item.value}</span>
                </div>
                <div className="h-3 bg-[#F9F7F2] rounded-full overflow-hidden">
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
