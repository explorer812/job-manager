import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Trash2, Pencil } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Modal } from '../ui/Modal';
import { JobCard } from './JobCard';
import { JobDetailDrawer } from './JobDetailDrawer';
import { colorMap } from '../../utils/mockData';
import type { FolderColor } from '../../types';

const folderColors: FolderColor[] = ['mint', 'peach', 'blue', 'lavender', 'coral'];

export function BookmarkTab() {
  const {
    folders,
    selectedFolderId,
    setSelectedFolderId,
    isFolderModalOpen,
    setIsFolderModalOpen,
    addFolder,
    deleteFolder,
    updateFolderName,
    addToast,
    isDetailDrawerOpen,
    setIsDetailDrawerOpen,
    setSelectedJobId,
    jobs,
  } = useStore();

  const filteredJobs = useMemo(() => {
    if (!selectedFolderId) return jobs;
    return jobs.filter((job) => job.folderId === selectedFolderId && !job.isArchived);
  }, [jobs, selectedFolderId]);

  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState<FolderColor>('mint');
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  
  // 编辑文件夹名称状态
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // 实时计算每个文件夹的实际职位数量
  const folderJobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach((folder) => {
      counts[folder.id] = jobs.filter((job) => job.folderId === folder.id && !job.isArchived).length;
    });
    return counts;
  }, [folders, jobs]);

  // 计算总职位数
  const totalJobs = useMemo(() => {
    return jobs.filter((job) => !job.isArchived).length;
  }, [jobs]);

  // 自动聚焦编辑输入框
  useEffect(() => {
    if (editingFolderId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingFolderId]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim(), selectedColor);
      setNewFolderName('');
      setIsFolderModalOpen(false);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      deleteFolder(folderId);
      addToast({
        message: `文件夹「${folder.name}」已删除`,
        type: 'info',
      });
    }
    setFolderToDelete(null);
  };

  const handleStartEdit = (folder: { id: string; name: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const handleSaveEdit = () => {
    if (editingFolderId && editingName.trim()) {
      updateFolderName(editingFolderId, editingName.trim());
      addToast({
        message: '文件夹名称已更新',
        type: 'success',
      });
    }
    setEditingFolderId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsDetailDrawerOpen(true);
  };

  return (
    <div className="h-full flex bg-[#F8F6F3]">
      {/* 桌面端侧边栏 - 参考UI风格 */}
      <aside className="hidden lg:flex flex-col w-72 p-6 bg-white rounded-r-3xl shadow-sm">
        {/* 统计卡片 */}
        <div className="bg-gradient-to-br from-[#FFD1DC]/30 to-[#E6E6FA]/30 rounded-2xl p-4 mb-6">
          <p className="text-sm text-[#6B7280] mb-1">已收藏职位</p>
          <p className="text-3xl font-bold text-[#1A1A2E]">{totalJobs}</p>
        </div>

        {/* 文件夹标题 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">文件夹</h2>
        </div>

        {/* 文件夹列表 */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {folders.map((folder) => {
            const colors = colorMap[folder.color];
            const isSelected = selectedFolderId === folder.id;
            const actualCount = folderJobCounts[folder.id] || 0;
            const isEditing = editingFolderId === folder.id;

            return (
              <motion.div
                key={folder.id}
                whileHover={{ x: 4 }}
                className={`
                  group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300
                  ${isSelected ? colors.light + ' ring-1 ' + colors.border : 'hover:bg-[#F8F6F3]'}
                `}
              >
                <div className={`w-3 h-3 rounded-full ${colors.bg} flex-shrink-0`} />
                
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-white rounded-lg px-2 py-1 text-sm outline-none ring-2 ring-[#FFD1DC]"
                  />
                ) : (
                  <button
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex-1 text-left font-medium ${isSelected ? 'text-[#1A1A2E]' : 'text-[#6B7280]'}`}
                  >
                    {folder.name}
                  </button>
                )}
                
                <span className="text-xs text-[#9CA3AF] bg-white/60 px-2.5 py-1 rounded-full flex-shrink-0">
                  {actualCount}
                </span>
                
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleStartEdit(folder, e)}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#FFD1DC]/30 hover:text-[#1A1A2E] transition-colors"
                      title="重命名"
                    >
                      <Pencil size={14} />
                    </motion.button>
                    {folders.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderToDelete(folder.id);
                        }}
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-red-50 hover:text-red-400 transition-colors"
                        title="删除文件夹"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 新建文件夹按钮 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFolderModalOpen(true)}
          className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-[#E5E7EB] flex items-center justify-center gap-2 text-[#9CA3AF] hover:text-[#1A1A2E] hover:border-[#FFD1DC] transition-colors"
        >
          <Plus size={18} />
          <span className="font-medium text-sm">新建文件夹</span>
        </motion.button>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* 移动端文件夹选择器 */}
        <div className="lg:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {folders.map((folder) => {
              const colors = colorMap[folder.color];
              const isSelected = selectedFolderId === folder.id;
              const actualCount = folderJobCounts[folder.id] || 0;

              return (
                <motion.button
                  key={folder.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap
                    ${isSelected ? colors.bg + ' ' + colors.text : 'bg-white text-[#6B7280]'}
                    transition-all duration-300 shadow-sm
                  `}
                >
                  {folder.name} ({actualCount})
                </motion.button>
              );
            })}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFolderModalOpen(true)}
              className="flex-shrink-0 p-2.5 rounded-full bg-white text-[#6B7280] shadow-sm"
            >
              <Plus size={18} />
            </motion.button>
          </div>
        </div>

        {/* 标题区 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">
            {folders.find(f => f.id === selectedFolderId)?.name || '全部职位'}
          </h2>
          <p className="text-[#6B7280]">
            共 {filteredJobs.length} 个职位
          </p>
        </div>

        {/* 职位卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                onClick={() => handleJobClick(job.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 空状态 */}
        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-[#FFD1DC]/30 flex items-center justify-center mb-4">
              <Folder size={40} className="text-[#FFB6A3]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">暂无职位</h3>
            <p className="text-[#9CA3AF]">该文件夹还没有收藏任何职位</p>
          </motion.div>
        )}
      </main>

      {/* 新建文件夹 Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="新建文件夹"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">文件夹名称</label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="输入文件夹名称"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#F8F6F3] border border-transparent focus:border-[#FFD1DC] focus:ring-2 focus:ring-[#FFD1DC]/20 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-3">选择颜色</label>
            <div className="flex gap-3">
              {folderColors.map((color) => {
                const colors = colorMap[color];
                const isSelected = selectedColor === color;

                return (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(color)}
                    className={`
                      w-12 h-12 rounded-2xl ${colors.bg}
                      ${isSelected ? 'ring-2 ring-offset-2 ring-[#1A1A2E]' : ''}
                      transition-all
                    `}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFolderModalOpen(false)}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-[#F8F6F3] text-[#6B7280] font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-[#1A1A2E] text-white font-medium hover:bg-[#2D2D44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              创建
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* 删除文件夹确认 Modal */}
      <Modal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        title="删除文件夹"
      >
        <div className="space-y-4">
          <p className="text-[#6B7280]">
            确定要删除文件夹「{folders.find((f) => f.id === folderToDelete)?.name}」吗？
            <br />
            其中的职位将被移动到默认文件夹。
          </p>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFolderToDelete(null)}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-[#F8F6F3] text-[#6B7280] font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => folderToDelete && handleDeleteFolder(folderToDelete)}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-red-100 text-red-500 font-medium hover:bg-red-200 transition-colors"
            >
              删除
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* 职位详情 Drawer */}
      <JobDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      />
    </div>
  );
}
