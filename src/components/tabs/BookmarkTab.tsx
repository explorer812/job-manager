import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Trash2, Pencil, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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

  // 搜索状态 - 必须在useMemo之前声明
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredJobs = useMemo(() => {
    let result = jobs;
    
    // 按收藏夹筛选
    if (selectedFolderId) {
      result = result.filter((job) => job.folderId === selectedFolderId && !job.isArchived);
    }
    
    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((job) => 
        job.company.name.toLowerCase().includes(query) ||
        job.position.title.toLowerCase().includes(query) ||
        job.position.location.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [jobs, selectedFolderId, searchQuery]);

  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState<FolderColor>('mint');
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  
  // 编辑收藏夹名称状态
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // 侧边栏折叠状态
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 实时计算每个收藏夹的实际职位数量
  const folderJobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach((folder) => {
      counts[folder.id] = jobs.filter((job) => job.folderId === folder.id && !job.isArchived).length;
    });
    return counts;
  }, [folders, jobs]);

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
        message: `收藏夹「${folder.name}」已删除`,
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
        message: '收藏夹名称已更新',
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

  const currentFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <div className="h-full flex">
      {/* 桌面端收藏夹侧边栏 - 奶油风设计 */}
      <aside 
        className={`hidden lg:flex flex-col bg-white h-[calc(100vh-8rem)] rounded-3xl mr-6 transition-all duration-300 ease-in-out relative flex-shrink-0 ${
          isSidebarCollapsed ? 'w-16 p-3' : 'w-64 p-5'
        }`}
      >
        {/* 折叠/展开按钮 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-[#8C837A] hover:text-[#2D2D2D] z-10 border border-[#EFECE6]"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>

        {/* 收藏夹标题 */}
        {!isSidebarCollapsed && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-[#8C837A] tracking-widest uppercase">
              收藏夹
            </p>
          </div>
        )}

        {/* 收藏夹列表 */}
        <div className="space-y-1 flex-1 overflow-y-auto">
          {folders.map((folder) => {
            const colors = colorMap[folder.color];
            const isSelected = selectedFolderId === folder.id;
            const actualCount = folderJobCounts[folder.id] || 0;
            const isEditing = editingFolderId === folder.id;

            return (
              <motion.div
                key={folder.id}
                whileHover={{ x: isSidebarCollapsed ? 0 : 4 }}
                className={`
                  group w-full flex items-center rounded-xl transition-all duration-300 cursor-pointer
                  ${isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'}
                  ${isSelected ? 'bg-[#2D2D2D]' : 'hover:bg-[#F9F7F2]'}
                `}
                onClick={() => setSelectedFolderId(folder.id)}
                title={isSidebarCollapsed ? folder.name : undefined}
              >
                <div className={`rounded-full flex-shrink-0 ${isSidebarCollapsed ? 'w-3 h-3' : 'w-2.5 h-2.5'} ${colors.bg}`} />
                
                {!isSidebarCollapsed && (
                  <>
                    {isEditing ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-white rounded-lg px-2 py-1 text-sm outline-none ring-2 ring-[#FDE2E4]"
                      />
                    ) : (
                      <button
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`flex-1 text-left font-black truncate text-sm ${isSelected ? 'text-white' : 'text-[#2D2D2D]'}`}
                      >
                        {folder.name}
                      </button>
                    )}
                    
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-[#F9F7F2] text-[#8C837A]'}`}>
                      {actualCount}
                    </span>
                    
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleStartEdit(folder, e)}
                          className={`p-1 rounded-lg transition-colors ${isSelected ? 'text-white/60 hover:text-white' : 'text-[#8C837A] hover:bg-[#FDE2E4]/50'}`}
                          title="重命名"
                        >
                          <Pencil size={12} />
                        </motion.button>
                        {folders.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderToDelete(folder.id);
                            }}
                            className={`p-1 rounded-lg transition-colors ${isSelected ? 'text-white/60 hover:text-white' : 'text-[#8C837A] hover:bg-red-50 hover:text-red-400'}`}
                            title="删除收藏夹"
                          >
                            <Trash2 size={12} />
                          </motion.button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 新建收藏夹按钮 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFolderModalOpen(true)}
          className={`w-full mt-4 rounded-xl border-2 border-dashed border-[#EFECE6] flex items-center justify-center text-[#8C837A] hover:text-[#2D2D2D] hover:border-[#2D2D2D] transition-colors ${
            isSidebarCollapsed ? 'p-2' : 'p-3 gap-2'
          }`}
          title={isSidebarCollapsed ? '新建收藏夹' : undefined}
        >
          <Plus size={isSidebarCollapsed ? 18 : 16} strokeWidth={3} />
          {!isSidebarCollapsed && <span className="font-black text-xs">新建收藏夹</span>}
        </motion.button>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* 移动端收藏夹选择器 */}
        <div className="lg:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {folders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              const actualCount = folderJobCounts[folder.id] || 0;

              return (
                <motion.button
                  key={folder.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-black whitespace-nowrap
                    ${isSelected ? 'bg-[#2D2D2D] text-white' : 'bg-white text-[#8C837A]'}
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
              className="flex-shrink-0 p-2.5 rounded-full bg-white text-[#8C837A] shadow-sm"
            >
              <Plus size={18} strokeWidth={3} />
            </motion.button>
          </div>
        </div>

        {/* 标题区 - 奶油风大标题 */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-baseline gap-4 flex-wrap">
              <h2 className="text-5xl font-black text-[#2D2D2D] tracking-tighter leading-none">
                {currentFolder?.name || '全部职位'}
              </h2>
              <span className="text-base font-black text-[#8C837A]">
                共 {filteredJobs.length} 个职位
              </span>
            </div>
            
            {/* 搜索框 - 右上角 */}
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C837A]" strokeWidth={2.5} />
                <input
                  type="text"
                  placeholder="搜索职位、公司..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-[#EFECE6] text-sm text-[#2D2D2D] placeholder-[#A8A29E] font-medium focus:outline-none focus:border-[#2D2D2D] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 职位卡片网格 - 32px间距 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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
            <div className="w-20 h-20 rounded-3xl bg-[#F9F7F2] flex items-center justify-center mb-4">
              <Briefcase size={40} className="text-[#8C837A]" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-black text-[#2D2D2D] mb-2">暂无职位</p>
            <p className="text-sm text-[#8C837A]">该收藏夹下还没有收藏职位</p>
          </motion.div>
        )}
      </main>

      {/* 职位详情抽屉 */}
      <JobDetailDrawer isOpen={isDetailDrawerOpen} onClose={() => setIsDetailDrawerOpen(false)} />

      {/* 新建收藏夹 Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="新建收藏夹"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#8C837A] tracking-widest uppercase mb-2">
              收藏夹名称
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="输入收藏夹名称..."
              className="w-full px-4 py-3 rounded-2xl bg-[#F9F7F2] border border-[#EFECE6] text-[#2D2D2D] placeholder-[#A8A29E] font-black focus:outline-none focus:border-[#2D2D2D] transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#8C837A] tracking-widest uppercase mb-2">
              选择颜色
            </label>
            <div className="flex gap-3">
              {folderColors.map((color) => {
                const colors = colorMap[color];
                return (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-xl ${colors.bg} transition-all ${
                      selectedColor === color ? 'ring-2 ring-[#2D2D2D] ring-offset-2' : ''
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFolderModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F9F7F2] text-[#8C837A] font-black hover:bg-[#EFECE6] transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#2D2D2D] text-white font-black hover:bg-[#2D2D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              创建
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* 删除确认 Modal */}
      <Modal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        title="删除收藏夹"
      >
        <div className="space-y-4">
          <p className="text-[#8C837A] font-medium">
            确定要删除收藏夹「{folders.find((f) => f.id === folderToDelete)?.name}」吗？
            <br />
            收藏夹内的职位将被移动到"全部职位"。
          </p>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFolderToDelete(null)}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F9F7F2] text-[#8C837A] font-black hover:bg-[#EFECE6] transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => folderToDelete && handleDeleteFolder(folderToDelete)}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#FDE2E4] text-[#2D2D2D] font-black hover:bg-[#FDE2E4]/80 transition-colors"
            >
              删除
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
