import { motion } from 'framer-motion';
import { Folder, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Modal } from '../ui/Modal';
import { colorMap } from '../../utils/mockData';

interface PathPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string) => void;
}

export function PathPickerModal({ isOpen, onClose, onSelect }: PathPickerModalProps) {
  const { folders, jobs } = useStore();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders[0]?.id || null);

  // 实时计算每个文件夹的实际职位数量
  const folderJobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach((folder) => {
      counts[folder.id] = jobs.filter((job) => job.folderId === folder.id && !job.isArchived).length;
    });
    return counts;
  }, [folders, jobs]);

  const handleConfirm = () => {
    if (selectedFolderId) {
      onSelect(selectedFolderId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="选择收藏位置"
      maxWidth="max-w-sm"
    >
      <div className="space-y-3">
        {folders.map((folder) => {
          const colors = colorMap[folder.color];
          const isSelected = selectedFolderId === folder.id;
          const actualCount = folderJobCounts[folder.id] || 0;

          return (
            <motion.button
              key={folder.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`
                w-full flex items-center gap-3 p-4 rounded-xl transition-all
                ${isSelected ? colors.light + ' ring-2 ' + colors.border : 'bg-gray-50 hover:bg-gray-100'}
              `}
            >
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                <Folder size={20} className="text-[#2D3748]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-[#2D3748]">{folder.name}</p>
                <p className="text-sm text-[#718096]">{actualCount} 个职位</p>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}
                >
                  <Check size={14} className="text-[#2D3748]" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-[#718096] font-medium hover:bg-gray-200 transition-colors"
        >
          取消
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={!selectedFolderId}
          className="flex-1 px-4 py-3 rounded-xl bg-[#B5EAD7] text-[#2D3748] font-medium hover:bg-[#a5e0c9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          确认添加
        </motion.button>
      </div>
    </Modal>
  );
}
