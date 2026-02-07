import { motion } from 'framer-motion';
import { MapPin, Banknote, GraduationCap, Briefcase, Trash2, Monitor, Rocket } from 'lucide-react';
import { useState } from 'react';
import type { JobCard as JobCardType } from '../../types';
import { CountdownRing } from '../ui/CountdownRing';
import { StatusBadge } from '../ui/StatusBadge';
import { CompanyTag } from '../ui/CompanyTag';
import { Modal } from '../ui/Modal';
import { reminderEventMap } from '../../utils/mockData';
import { useStore } from '../../store/useStore';

interface JobCardProps {
  job: JobCardType;
  index: number;
  onClick: () => void;
}

// 根据职位类型分配奶油风背景色
const getCardBgColor = (index: number): string => {
  const colors = [
    'bg-[#FDE2E4]', // 豆沙粉
    'bg-[#FFEDD8]', // 夕阳橙
    'bg-[#E2EAFC]', // 静谧蓝
    'bg-[#EAF4F4]', // 薄荷绿
  ];
  return colors[index % colors.length];
};

// 根据 job id 获取图标（确保卡片和详情页一致）
const getCardIcon = (jobId: string) => {
  // 使用 job id 的哈希值来确定图标，保证一致性
  const hash = jobId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const icons = [
    <Monitor key="monitor" size={28} className="text-[#2D2D2D]" strokeWidth={2.5} />,
    <Briefcase key="briefcase" size={28} className="text-[#2D2D2D]" strokeWidth={2.5} />,
    <Rocket key="rocket" size={28} className="text-[#2D2D2D]" strokeWidth={2.5} />,
  ];
  return icons[hash % icons.length];
};

export function JobCard({ job, index, onClick }: JobCardProps) {
  const { deleteJob, addToast } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 只有在设置了提醒且有截止日期时才显示倒计时
  const hasDeadline = job.hasReminder && job.position.deadline;
  const daysUntil = hasDeadline
    ? Math.ceil(
        (new Date(job.position.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteJob(job.id);
    addToast({
      message: '职位已删除',
      type: 'info',
    });
    setShowDeleteConfirm(false);
  };

  const cardBgColor = getCardBgColor(index);
  const cardIcon = getCardIcon(job.id);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)' }}
        onClick={onClick}
        className={`relative p-8 rounded-[3rem] cursor-pointer ${cardBgColor} border border-white/40 shadow-sm transition-all duration-300 group overflow-hidden`}
      >
        {/* 背景氛围灯 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/30 rounded-full blur-3xl pointer-events-none" />
        
        {/* 删除按钮 - 悬浮显示在右下角 */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white text-[#8C837A] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:text-red-400"
          title="删除职位"
        >
          <Trash2 size={18} strokeWidth={2.5} />
        </motion.button>

        {/* 倒计时环 - 仅当有提醒时显示 */}
        {hasDeadline && daysUntil !== null && (
          <div className="absolute top-8 right-8">
            <CountdownRing days={daysUntil} size={48} />
          </div>
        )}

        {/* 图标和公司信息 */}
        <div className="flex items-start gap-5 mb-6">
          {/* 具象图标 */}
          <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            {cardIcon}
          </div>
          <div className={`flex-1 min-w-0 ${hasDeadline ? 'pr-14' : ''}`}>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h3 className="font-black text-[#2D2D2D] truncate text-2xl tracking-tight">{job.company.name}</h3>
              {/* 提醒事件标签 */}
              {job.hasReminder && job.reminderEvent && (
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full flex-shrink-0 tracking-widest uppercase ${reminderEventMap[job.reminderEvent].bg} ${reminderEventMap[job.reminderEvent].color}`}>
                  {reminderEventMap[job.reminderEvent].label}
                </span>
              )}
            </div>
            <CompanyTag type={job.company.type} size="sm" />
          </div>
        </div>

        {/* 职位信息 */}
        <div className="space-y-4">
          <h4 className="text-3xl font-black text-[#2D2D2D] line-clamp-1 tracking-tight">
            {job.position.title}
          </h4>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#8C837A]">
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-[#2D2D2D]" strokeWidth={2.5} />
              <span className="font-black text-[#2D2D2D]">{job.position.salary}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#8C837A]" strokeWidth={2.5} />
              <span className="font-medium">{job.position.location}</span>
            </div>
          </div>

          {/* 学历和任职年限 */}
          {(job.position.education || job.position.experience) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {job.position.education && (
                <div className="flex items-center gap-2 text-xs font-black text-[#8C837A] bg-white/70 px-4 py-2 rounded-full">
                  <GraduationCap size={14} strokeWidth={2.5} />
                  <span>{job.position.education}</span>
                </div>
              )}
              {job.position.experience && (
                <div className="flex items-center gap-2 text-xs font-black text-[#8C837A] bg-white/70 px-4 py-2 rounded-full">
                  <Briefcase size={14} strokeWidth={2.5} />
                  <span>{job.position.experience}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部状态 */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/40">
          <StatusBadge status={job.position.status} size="sm" />
          <span className="text-xs font-black text-[#8C837A] tracking-wider">
            {new Date(job.createdAt).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })} 收藏
          </span>
        </div>

        {/* 逾期标记 */}
        {hasDeadline && daysUntil !== null && daysUntil < 0 && (
          <div className="absolute inset-0 rounded-[3rem] bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-6 py-3 bg-white text-[#8C837A] rounded-full text-sm font-black shadow-sm tracking-wider">
              已截止
            </span>
          </div>
        )}
      </motion.div>

      {/* 删除确认 Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="删除职位"
      >
        <div className="space-y-4">
          <p className="text-[#8C837A]">
            确定要删除「{job.company.name} - {job.position.title}」吗？
            <br />
            此操作不可撤销。
          </p>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F9F7F2] text-[#8C837A] font-black hover:bg-[#EFECE6] transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={confirmDelete}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#FDE2E4] text-[#2D2D2D] font-black hover:bg-[#FFD4D8] transition-colors"
            >
              删除
            </motion.button>
          </div>
        </div>
      </Modal>
    </>
  );
}
