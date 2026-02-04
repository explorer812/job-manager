import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
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
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Modal } from '../ui/Modal';
import { StatusSelector } from '../ui/StatusBadge';
import { CompanyTag } from '../ui/CompanyTag';
import { useStore, selectSelectedJob } from '../../store/useStore';
import type { JobStatus, ReminderEvent } from '../../types';
import { reminderEventMap } from '../../utils/mockData';

const reminderEvents: ReminderEvent[] = ['toApply', 'writtenTest', 'interview', 'toOffer'];

export function JobDetailDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const job = selectSelectedJob(useStore.getState());
  const { updateJob, updateJobStatus, deleteJob, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'responsibilities' | 'requirements'>('responsibilities');
  const [expandedSuggestions, setExpandedSuggestions] = useState<string[]>(['resume']);
  const [isEditing, setIsEditing] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ReminderEvent>('toApply');
  const [editedJob, setEditedJob] = useState(job);

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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B5EAD7]/30 to-[#C7CEEA]/30 flex items-center justify-center flex-shrink-0">
                <Building2 size={32} className="text-[#718096]" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <label className="text-xs text-[#718096]">公司名称</label>
                    <input
                      type="text"
                      value={editedJob?.company.name}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                company: { ...prev.company, name: e.target.value },
                              }
                            : null
                        )
                      }
                      className="w-full text-xl font-bold text-[#2D3748] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#B5EAD7] outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#2D3748]">{job.company.name}</h2>
                    {/* 提醒事件标签 */}
                    {job.hasReminder && job.reminderEvent && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${reminderEventMap[job.reminderEvent].bg} ${reminderEventMap[job.reminderEvent].color}`}>
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
                <Briefcase size={18} className="text-[#718096]" />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs text-[#718096] block mb-1">职位名称</label>
                    <input
                      type="text"
                      value={editedJob?.position.title}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { ...prev.position, title: e.target.value },
                              }
                            : null
                        )
                      }
                      className="w-full text-[#2D3748] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#B5EAD7] outline-none"
                    />
                  </div>
                ) : (
                  <span className="font-medium text-[#2D3748]">{job.position.title}</span>
                )}
              </div>

              {/* 薪资 */}
              <div className="flex items-center gap-3">
                <Banknote size={18} className="text-[#B5EAD7]" />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs text-[#718096] block mb-1">薪资范围</label>
                    <input
                      type="text"
                      value={editedJob?.position.salary}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { ...prev.position, salary: e.target.value },
                              }
                            : null
                        )
                      }
                      className="w-full text-[#2D3748] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#B5EAD7] outline-none"
                    />
                  </div>
                ) : (
                  <span className="font-medium text-[#2D3748]">{job.position.salary}</span>
                )}
              </div>

              {/* 地点 */}
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#718096]" />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs text-[#718096] block mb-1">工作地点</label>
                    <input
                      type="text"
                      value={editedJob?.position.location}
                      onChange={(e) =>
                        setEditedJob((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { ...prev.position, location: e.target.value },
                              }
                            : null
                        )
                      }
                      className="w-full text-[#2D3748] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#B5EAD7] outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[#718096]">{job.position.location}</span>
                )}
              </div>

              {/* 学历 */}
              <div className="flex items-center gap-3">
                <GraduationCap size={18} className="text-[#C7CEEA]" />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs text-[#718096] block mb-1">学历要求</label>
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
                            : null
                        )
                      }
                      placeholder="如：本科及以上"
                      className="w-full text-[#2D3748] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#B5EAD7] outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[#718096]">{job.position.education || '未设置'}</span>
                )}
              </div>

              {/* 任职年限 */}
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#FFDAC1]" />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs text-[#718096] block mb-1">任职年限</label>
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
                            : null
                        )
                      }
                      placeholder="如：3-5年"
                      className="w-full text-[#2D3748] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#B5EAD7] outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[#718096]">{job.position.experience || '未设置'}</span>
                )}
              </div>

              {/* 投递/面试链接 */}
              <div className="flex items-center gap-3">
                <Link size={18} className="text-[#C7CEEA]" />
                {isEditing ? (
                  <div className="flex-1">
                    <label className="text-xs text-[#718096] block mb-1">相关链接（投递/面试等）</label>
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
                            : null
                        )
                      }
                      placeholder="https://..."
                      className="w-full text-[#2D3748] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#B5EAD7] outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2">
                    {job.applyLink ? (
                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B5EAD7] hover:text-[#8fd9c0] hover:underline truncate flex items-center gap-1"
                      >
                        访问链接
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-[#718096]">未设置</span>
                    )}
                  </div>
                )}
              </div>

              {/* 截止日期 - 仅当有提醒时显示 */}
              {hasDeadline && daysUntil !== null && (
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-[#FFDAC1]" />
                  <div className="flex items-center gap-2">
                    <span className="text-[#718096]">
                      截止：{new Date(job.position.deadline!).toLocaleDateString('zh-CN')}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        daysUntil <= 3 ? 'text-[#FFB7B2]' : daysUntil <= 7 ? 'text-[#FFDAC1]' : 'text-[#B5EAD7]'
                      }`}
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
                      className="px-4 py-2 rounded-xl bg-gray-100 text-[#718096] text-sm font-medium"
                    >
                      取消
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveEdit}
                      className="px-4 py-2 rounded-xl bg-[#B5EAD7] text-[#2D3748] text-sm font-medium"
                    >
                      保存
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-[#718096] text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    编辑信息
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsReminderModalOpen(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                    job.hasReminder
                      ? 'bg-[#FFDAC1]/30 text-[#2D3748]'
                      : 'bg-[#FFDAC1]/20 text-[#2D3748]'
                  }`}
                >
                  <Bell size={16} className={job.hasReminder ? 'text-[#FF9AA2]' : ''} />
                  设置提醒
                </motion.button>
                {job.hasReminder && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelReminder}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-[#718096] text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    取消提醒
                  </motion.button>
                )}
                {/* 删除按钮 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition-colors ml-auto"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  删除
                </motion.button>
              </div>
            </div>
          </section>

          {/* AI 提炼区 */}
          <section className="border-l-4 border-[#B5EAD7] pl-4 py-2">
            <h3 className="text-lg font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#B5EAD7]/20 flex items-center justify-center">
                <span className="text-xs">AI</span>
              </span>
              智能分析
            </h3>

            {/* Tab 切换 */}
            <div className="flex gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('responsibilities')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'responsibilities'
                    ? 'bg-[#B5EAD7] text-[#2D3748]'
                    : 'bg-gray-100 text-[#718096]'
                }`}
              >
                岗位职责
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('requirements')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'requirements'
                    ? 'bg-[#B5EAD7] text-[#2D3748]'
                    : 'bg-gray-100 text-[#718096]'
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5EAD7] mt-2 flex-shrink-0" />
                    <span className="text-[#2D3748] leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* 求职建议区 */}
          <section className="border-l-4 border-[#E2F0CB] pl-4 py-2">
            <h3 className="text-lg font-semibold text-[#2D3748] mb-4">求职建议</h3>

            <div className="space-y-3">
              {suggestionSections.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSuggestions.includes(section.key);

                return (
                  <motion.div
                    key={section.key}
                    initial={false}
                    className="bg-gray-50 rounded-xl overflow-hidden"
                  >
                    <motion.button
                      onClick={() => toggleSuggestion(section.key)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                          <Icon size={18} className="text-[#718096]" />
                        </div>
                        <span className="font-medium text-[#2D3748]">{section.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={20} className="text-[#718096]" />
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
                            <p className="text-sm text-[#718096] leading-relaxed pl-11">
                              {section.content}
                            </p>
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
          <section className="sticky bottom-0 bg-white/80 backdrop-blur-md -mx-6 -mb-6 p-6 border-t border-gray-100">
            <div className="space-y-4">
              {/* 状态选择器 */}
              <div>
                <label className="block text-sm font-medium text-[#718096] mb-2">求职状态</label>
                <StatusSelector currentStatus={job.position.status} onChange={handleStatusChange} />
              </div>

              {/* 投递按钮 */}
              {job.applyLink && (
                <motion.a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#B5EAD7] text-[#2D3748] font-semibold hover:bg-[#a5e0c9] transition-colors"
                >
                  <ExternalLink size={18} />
                  去投递
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
            <label className="block text-sm font-medium text-[#2D3748] mb-2">事件类型</label>
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
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? `${config.bg} ${config.color} shadow-sm`
                        : 'bg-gray-100 text-[#718096] hover:bg-gray-200'
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
            <label className="block text-sm font-medium text-[#2D3748] mb-2">截止日期</label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#B5EAD7] focus:ring-2 focus:ring-[#B5EAD7]/20 outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsReminderModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-[#718096] font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSetReminder}
              disabled={!reminderDate}
              className="flex-1 px-4 py-3 rounded-xl bg-[#B5EAD7] text-[#2D3748] font-medium hover:bg-[#a5e0c9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="text-[#718096]">
            确定要删除「{job.company.name} - {job.position.title}」吗？
            <br />
            此操作不可撤销。
          </p>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-[#718096] font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteJob}
              className="flex-1 px-4 py-3 rounded-xl bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors"
            >
              删除
            </motion.button>
          </div>
        </div>
      </Modal>
    </>
  );
}
