import { motion } from 'framer-motion';
import { Building2, MapPin, Banknote, GraduationCap, Briefcase, Trash2 } from 'lucide-react';
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

// 根据职位类型分配柔和的背景色
const getCardBgColor = (index: number): string => {
  const colors = [
    'bg-[#FFD1DC]/30', // 柔和粉
    'bg-[#FFD4B3]/30', // 柔和桃
    'bg-[#E6E6FA]/40', // 柔和紫
    'bg-[#B8E6D3]/30', // 柔和薄荷
    'bg-[#FFF8E7]/60', // 柔和奶油
    'bg-[#FFB6A3]/30', // 柔和珊瑚
  ];
  return colors[index % colors.length];
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

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        onClick={onClick}
        className={`relative p-6 rounded-3xl cursor-pointer ${cardBgColor} border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 group`}
      >
        {/* 删除按钮 - 悬浮显示在右下角 */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white text-red-400 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="删除职位"
        >
          <Trash2 size={16} />
        </motion.button>

        {/* 倒计时环 - 仅当有提醒时显示 */}
        {hasDeadline && daysUntil !== null && (
          <div className="absolute top-5 right-5">
            <CountdownRing days={daysUntil} size={44} />
          </div>
        )}

        {/* 公司 Logo 占位 */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Building2 size={26} className="text-[#6B7280]" />
          </div>
          <div className={`flex-1 min-w-0 ${hasDeadline ? 'pr-12' : ''}`}>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-[#1A1A2E] truncate text-lg">{job.company.name}</h3>
              {/* 提醒事件标签 */}
              {job.hasReminder && job.reminderEvent && (
                <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 bg-white/70 ${reminderEventMap[job.reminderEvent].color}`}>
                  {reminderEventMap[job.reminderEvent].label}
                </span>
              )}
            </div>
            <CompanyTag type={job.company.type} size="sm" />
          </div>
        </div>

        {/* 职位信息 */}
        <div className="space-y-3">
          <h4 className="text-xl font-bold text-[#1A1A2E] line-clamp-1">
            {job.position.title}
          </h4>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <Banknote size={15} className="text-[#FFB6A3]" />
              <span className="font-medium text-[#1A1A2E]">{job.position.salary}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={15} />
              <span>{job.position.location}</span>
            </div>
          </div>

          {/* 学历和任职年限 */}
          {(job.position.education || job.position.experience) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {job.position.education && (
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280] bg-white/60 px-3 py-1.5 rounded-full">
                  <GraduationCap size={12} />
                  <span>{job.position.education}</span>
                </div>
              )}
              {job.position.experience && (
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280] bg-white/60 px-3 py-1.5 rounded-full">
                  <Briefcase size={12} />
                  <span>{job.position.experience}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部状态 */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/40">
          <StatusBadge status={job.position.status} size="sm" />
          <span className="text-xs text-[#9CA3AF]">
            {new Date(job.createdAt).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })} 收藏
          </span>
        </div>

        {/* 逾期标记 */}
        {hasDeadline && daysUntil !== null && daysUntil < 0 && (
          <div className="absolute inset-0 rounded-3xl bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-5 py-2.5 bg-white text-[#9CA3AF] rounded-full text-sm font-medium shadow-sm">
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
          <p className="text-[#6B7280]">
            确定要删除「{job.company.name} - {job.position.title}」吗？
            <br />
            此操作不可撤销。
          </p>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-[#6B7280] font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={confirmDelete}
              className="flex-1 px-4 py-3 rounded-2xl bg-red-100 text-red-500 font-medium hover:bg-red-200 transition-colors"
            >
              删除
            </motion.button>
          </div>
        </div>
      </Modal>
    </>
  );
}
