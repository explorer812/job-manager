import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Banknote,
  Calendar,
  ExternalLink,
  Bell,
  ChevronDown,
  FileText,
  MessageSquare,
  DollarSign,
  Briefcase,
  GraduationCap,
  Clock,
  Trash2,
  Link,
  Monitor,
  Rocket,
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Modal } from '../ui/Modal';
import { StatusSelector } from '../ui/StatusBadge';
import { CompanyTag } from '../ui/CompanyTag';
import { useStore } from '../../store/useStore';
import type { JobStatus, ReminderEvent } from '../../types';
import { reminderEventMap } from '../../utils/mockData';

const reminderEvents: ReminderEvent[] = ['toApply', 'writtenTest', 'interview', 'toOffer'];

export function JobDetailDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { jobs, selectedJobId, updateJob, updateJobStatus, deleteJob, addToast } = useStore();
  const job = jobs.find(j => j.id === selectedJobId);
  const [activeTab, setActiveTab] = useState<'responsibilities' | 'requirements'>('responsibilities');
  const [expandedSuggestions, setExpandedSuggestions] = useState<string[]>(['resume']);
  const [isEditing, setIsEditing] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ReminderEvent>('toApply');
  const [editedJob, setEditedJob] = useState<typeof job>(job);

  // 当 job 变化时更新 editedJob
  useEffect(() => {
    setEditedJob(job);
    if (job?.position.deadline) {
      setReminderDate(job.position.deadline.split('T')[0]);
    }
    if (job?.reminderEvent) {
      setSelectedEvent(job.reminderEvent);
    }
  }, [job]);

  if (!job) return null;

  // 获取图标（与 JobCard 保持一致，使用 job id 哈希值）
  const getDetailIcon = (jobId: string) => {
    const hash = jobId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const icons = [
      <Monitor key="monitor" size={32} className="text-[#2D2D2D]" strokeWidth={2.5} />,
      <Briefcase key="briefcase" size={32} className="text-[#2D2D2D]" strokeWidth={2.5} />,
      <Rocket key="rocket" size={32} className="text-[#2D2D2D]" strokeWidth={2.5} />,
    ];
    return icons[hash % icons.length];
  };

  // 只有在设置了提醒且有截止日期时才显示倒计时
  const hasDeadline = job.hasReminder && job.position.deadline;
  const daysUntil = hasDeadline
    ? Math.ceil(
        (new Date(job.position.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const handleStatusChange = (status: JobStatus) => {
    updateJobStatus(job.id, status);
  };

  const toggleSuggestion = (key: string) => {
    setExpandedSuggestions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSaveEdit = () => {
    if (editedJob) {
      updateJob(job.id, editedJob);
      setIsEditing(false);
      addToast({
        message: '职位信息已更新',
        type: 'success',
      });
    }
  };

  const handleSetReminder = () => {
    if (reminderDate) {
      updateJob(job.id, {
        hasReminder: true,
        reminderEvent: selectedEvent,
        isArchived: false,
        position: {
          ...job.position,
          deadline: reminderDate,
        },
      });
      setIsReminderModalOpen(false);
      addToast({
        message: '提醒设置成功',
        type: 'success',
      });
    }
  };

  const handleCancelReminder = () => {
    updateJob(job.id, {
      hasReminder: false,
      reminderEvent: undefined,
      position: {
        ...job.position,
        deadline: undefined,
      },
    });
    addToast({
      message: '提醒已取消',
      type: 'info',
    });
  };

  const handleDeleteJob = () => {
    deleteJob(job.id);
    setIsDeleteModalOpen(false);
    onClose();
    addToast({
      message: '职位已删除',
      type: 'info',
    });
  };

  const suggestionSections = [
    { key: 'resume', icon: FileText, title: '简历建议', content: job.aiAnalysis.suggestions.resume },
    { key: 'interview', icon: MessageSquare, title: '面试准备', content: job.aiAnalysis.suggestions.interview },
    { key: 'negotiation', icon: DollarSign, title: '薪资谈判', content: job.aiAnalysis.suggestions.negotiation },
  ];

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} position="right" width="w-[90vw] lg:w-[600px]">
        <div className="p-6 space-y-6">
          {/* 头部信息栏 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[#F9F7F2] flex items-center justify-center flex-shrink-0">
                {getDetailIcon(job.id)}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#8C837A] tracking-widest uppercase">公司名称</label>
                    <input
                      type="text"
                      value={editedJob?.company.name || ''}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                company: { ...prev.company, name: e.target.value },
                              }
                            : prev
                        )
                      }
                      className="w-full text-xl font-black text-[#2D2D2D] bg-[#F9F7F2] border border-[#EFECE6] rounded-2xl px-4 py-3 focus:border-[#2D2D2D] outline-none tracking-tight"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-black text-[#2D2D2D] tracking-tight">{job.company.name}</h2>
                    {/* 提醒事件标签 */}
                    {job.hasReminder && job.reminderEvent && (
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase ${reminderEventMap[job.reminderEvent].bg} ${reminderEventMap[job.reminderEvent].color}`}>
                        {reminderEventMap[job.reminderEvent].label}
                      </span>
                    )}
                  </div>
                )}
                <CompanyTag type={job.company.type} />
              </div>
            </div>

            <div className="space-y-3">
              {/* 职位 */}
              <div className="flex items-center gap-3">
                <Briefcase size={18} className="text-[#8C837A]" strokeWidth={2.5} />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs font-black text-[#8C837A] tracking-widest uppercase block mb-1">职位名称</label>
                    <input
                      type="text"
                      value={editedJob?.position.title || ''}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { ...prev.position, title: e.target.value },
                              }
                            : prev
                        )
                      }
                      className="w-full text-[#2D2D2D] font-black bg-[#F9F7F2] border border-[#EFECE6] rounded-2xl px-4 py-2 focus:border-[#2D2D2D] outline-none"
                    />
                  </div>
                ) : (
                  <span className="font-black text-[#2D2D2D]">{job.position.title}</span>
                )}
              </div>

              {/* 薪资 */}
              <div className="flex items-center gap-3">
                <Banknote size={18} className="text-[#2D2D2D]" strokeWidth={2.5} />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs font-black text-[#8C837A] tracking-widest uppercase block mb-1">薪资范围</label>
                    <input
                      type="text"
                      value={editedJob?.position.salary || ''}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { ...prev.position, salary: e.target.value },
                              }
                            : prev
                        )
                      }
                      className="w-full text-[#2D2D2D] font-black bg-[#F9F7F2] border border-[#EFECE6] rounded-2xl px-4 py-2 focus:border-[#2D2D2D] outline-none"
                    />
                  </div>
                ) : (
                  <span className="font-black text-[#2D2D2D]">{job.position.salary}</span>
                )}
              </div>

              {/* 地点 */}
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#8C837A]" strokeWidth={2.5} />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs font-black text-[#8C837A] tracking-widest uppercase block mb-1">工作地点</label>
                    <input
                      type="text"
                      value={editedJob?.position.location || ''}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { ...prev.position, location: e.target.value },
                              }
                            : prev
                        )
                      }
                      className="w-full text-[#2D2D2D] font-black bg-[#F9F7F2] border border-[#EFECE6] rounded-2xl px-4 py-2 focus:border-[#2D2D2D] outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[#8C837A] font-medium">{job.position.location}</span>
                )}
              </div>

              {/* 学历 */}
              <div className="flex items-center gap-3">
                <GraduationCap size={18} className="text-[#8C837A]" strokeWidth={2.5} />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs font-black text-[#8C837A] tracking-widest uppercase block mb-1">学历要求</label>
                    <input
                      type="text"
                      value={editedJob?.position.education || ''}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { ...prev.position, education: e.target.value },
                              }
                            : prev
                        )
                      }
                      placeholder="如：本科及以上"
                      className="w-full text-[#2D2D2D] font-black bg-[#F9F7F2] border border-[#EFECE6] rounded-2xl px-4 py-2 focus:border-[#2D2D2D] outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[#8C837A] font-medium">{job.position.education || '未设置'}</span>
                )}
              </div>

              {/* 任职年限 */}
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#8C837A]" strokeWidth={2.5} />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs font-black text-[#8C837A] tracking-widest uppercase block mb-1">任职年限</label>
                    <input
                      type="text"
                      value={editedJob?.position.experience || ''}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { ...prev.position, experience: e.target.value },
                              }
                            : prev
                        )
                      }
                      placeholder="如：3-5年"
                      className="w-full text-[#2D2D2D] font-black bg-[#F9F7F2] border border-[#EFECE6] rounded-2xl px-4 py-2 focus:border-[#2D2D2D] outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[#8C837A] font-medium">{job.position.experience || '未设置'}</span>
                )}
              </div>

              {/* 投递/面试链接 - 仅在编辑模式显示 */}
              {isEditing && (
                <div className="flex items-center gap-3">
                  <Link size={18} className="text-[#8C837A]" strokeWidth={2.5} />
                  <div className="flex-1">
                    <label className="text-xs font-black text-[#8C837A] tracking-widest uppercase block mb-1">官方链接（投递/面试等）</label>
                    <input
                      type="text"
                      value={editedJob?.applyLink || ''}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                applyLink: e.target.value,
                              }
                            : prev
                        )
                      }
                      placeholder="https://..."
                      className="w-full text-[#2D2D2D] font-black bg-[#F9F7F2] border border-[#EFECE6] rounded-2xl px-4 py-2 focus:border-[#2D2D2D] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 截止日期 - 仅当有提醒时显示 */}
              {hasDeadline && daysUntil !== null && (
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-[#8C837A]" strokeWidth={2.5} />
                  <div className="flex items-center gap-2">
                    <span className="text-[#8C837A] font-medium">
                      截止：{new Date(job.position.deadline!).toLocaleDateString('zh-CN')}
                    </span>
                    <span
                      className="text-sm font-black"
                      style={{ color: '#2D2D2D' }}
                    >
                      ({daysUntil >= 0 ? `还剩${daysUntil}天` : `已逾期${Math.abs(daysUntil)}天`})
                    </span>
                  </div>
                </div>
              )}

              {/* 编辑/保存按钮 */}
              <div className="flex gap-2 pt-2">
                {isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsEditing(false);
                        setEditedJob(job);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#F9F7F2] text-[#8C837A] text-sm font-black"
                    >
                      取消
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveEdit}
                      className="px-4 py-2 rounded-xl bg-[#2D2D2D] text-white text-sm font-black"
                    >
                      保存
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-[#F9F7F2] text-[#8C837A] text-sm font-black hover:bg-[#EFECE6] transition-colors"
                  >
                    编辑信息
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsReminderModalOpen(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-colors ${
                    job.hasReminder
                      ? 'bg-[#FFEDD8] text-[#2D2D2D]'
                      : 'bg-[#F9F7F2] text-[#8C837A]'
                  }`}
                >
                  <Bell size={16} className={job.hasReminder ? 'text-[#2D2D2D]' : ''} strokeWidth={2.5} />
                  设置提醒
                </motion.button>
                {job.hasReminder && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelReminder}
                    className="px-4 py-2 rounded-xl bg-[#F9F7F2] text-[#8C837A] text-sm font-black hover:bg-[#EFECE6] transition-colors"
                  >
                    取消提醒
                  </motion.button>
                )}
                {/* 删除按钮 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#FDE2E4] text-[#2D2D2D] text-sm font-black hover:bg-[#FDE2E4]/80 transition-colors ml-auto"
                >
                  <Trash2 size={16} className="inline mr-1" strokeWidth={2.5} />
                  删除
                </motion.button>
              </div>
            </div>
          </section>

          {/* AI 提炼区 */}
          <section className="border-l-4 border-[#EAF4F4] pl-4 py-2">
            <h3 className="text-lg font-black text-[#2D2D2D] mb-4 flex items-center gap-2 tracking-tight">
              <span className="w-6 h-6 rounded-full bg-[#EAF4F4] flex items-center justify-center text-xs font-black">
                AI
              </span>
              智能分析
            </h3>

            {/* Tab 切换 */}
            <div className="flex gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('responsibilities')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors tracking-wider uppercase ${
                  activeTab === 'responsibilities'
                    ? 'bg-[#2D2D2D] text-white'
                    : 'bg-[#F9F7F2] text-[#8C837A]'
                }`}
              >
                岗位职责
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('requirements')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors tracking-wider uppercase ${
                  activeTab === 'requirements'
                    ? 'bg-[#2D2D2D] text-white'
                    : 'bg-[#F9F7F2] text-[#8C837A]'
                }`}
              >
                岗位要求
              </motion.button>
            </div>

            {/* 内容 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {(activeTab === 'responsibilities'
                  ? job.aiAnalysis.responsibilities
                  : job.aiAnalysis.requirements
                ).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D2D2D] mt-2 flex-shrink-0" />
                    <span className="text-[#2D2D2D] leading-relaxed font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* 求职建议区 */}
          <section className="border-l-4 border-[#FFEDD8] pl-4 py-2">
            <h3 className="text-lg font-black text-[#2D2D2D] mb-4 tracking-tight">求职建议</h3>

            <div className="space-y-3">
              {suggestionSections.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSuggestions.includes(section.key);

                return (
                  <motion.div
                    key={section.key}
                    initial={false}
                    className="bg-[#F9F7F2] rounded-2xl overflow-hidden"
                  >
                    <motion.button
                      onClick={() => toggleSuggestion(section.key)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
                          <Icon size={18} className="text-[#2D2D2D]" strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-[#2D2D2D] tracking-tight">{section.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={20} className="text-[#8C837A]" strokeWidth={2.5} />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4">
                            <div className="text-sm text-[#8C837A] leading-relaxed space-y-2 font-medium">
                              {section.content.split('\n').map((line, idx) => (
                                line.trim() && (
                                  <p key={idx} className={line.startsWith('•') ? '' : 'pl-3'}>
                                    {line}
                                  </p>
                                )
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* 底部操作栏 */}
          <section className="sticky bottom-0 bg-white -mx-6 -mb-6 p-6 border-t border-[#EFECE6]">
            <div className="space-y-4">
              {/* 状态选择器 */}
              <div>
                <label className="block text-xs font-black text-[#8C837A] tracking-widest uppercase mb-2">求职状态</label>
                <StatusSelector currentStatus={job.position.status} onChange={handleStatusChange} />
              </div>

              {/* 去官方按钮 */}
              {job.applyLink && (
                <motion.a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#2D2D2D] text-white font-black hover:bg-[#2D2D2D]/90 transition-colors"
                >
                  <ExternalLink size={18} strokeWidth={2.5} />
                  去官方
                </motion.a>
              )}
            </div>
          </section>
        </div>
      </Drawer>

      {/* 设置提醒 Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="设置提醒"
      >
        <div className="space-y-4">
          {/* 事件选择 */}
          <div>
            <label className="block text-xs font-black text-[#8C837A] tracking-widest uppercase mb-2">事件类型</label>
            <div className="grid grid-cols-2 gap-2">
              {reminderEvents.map((event) => {
                const config = reminderEventMap[event];
                const isSelected = selectedEvent === event;
                return (
                  <motion.button
                    key={event}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedEvent(event)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all tracking-wider uppercase ${
                      isSelected
                        ? `${config.bg} ${config.color} shadow-sm`
                        : 'bg-[#F9F7F2] text-[#8C837A] hover:bg-[#EFECE6]'
                    }`}
                  >
                    {config.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 截止日期选择 */}
          <div>
            <label className="block text-xs font-black text-[#8C837A] tracking-widest uppercase mb-2">截止日期</label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#F9F7F2] border border-[#EFECE6] focus:border-[#2D2D2D] focus:ring-2 focus:ring-[#2D2D2D]/10 outline-none transition-all font-black text-[#2D2D2D]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsReminderModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F9F7F2] text-[#8C837A] font-black hover:bg-[#EFECE6] transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSetReminder}
              disabled={!reminderDate}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#2D2D2D] text-white font-black hover:bg-[#2D2D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              设置提醒
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* 删除确认 Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="删除职位"
      >
        <div className="space-y-4">
          <p className="text-[#8C837A] font-medium">
            确定要删除「{job.company.name} - {job.position.title}」吗？
            <br />
            此操作不可撤销。
          </p>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F9F7F2] text-[#8C837A] font-black hover:bg-[#EFECE6] transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteJob}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#FDE2E4] text-[#2D2D2D] font-black hover:bg-[#FDE2E4]/80 transition-colors"
            >
              删除
            </motion.button>
          </div>
        </div>
      </Modal>
    </>
  );
}
