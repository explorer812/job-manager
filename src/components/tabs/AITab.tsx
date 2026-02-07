import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Image as ImageIcon,
  X,
  Building2,
  MapPin,
  Banknote,
  ArrowRight,
  Loader2,
  FileText,
  GraduationCap,
  Clock,
  Briefcase,
  ListTodo,
  Lightbulb,
  MessageSquare,
  DollarSign,
  Plus,
  ChevronRight,
  ChevronLeft,
  Search,
  Trash2,
  History,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PathPickerModal } from './PathPickerModal';
import { AIAvatar } from '../ui/AIAvatar';
import { ImagePreview } from '../ui/ImagePreview';
import { parseJobWithDoubao } from '../../services/doubaoService';
import { chatWithAI } from '../../services/chatService';
import type { AIMessage, JobCard, ChatSession } from '../../types';

export function AITab() {
  const { 
    aiMessages, 
    addAIMessage, 
    clearAIMessages, 
    folders, 
    addJob, 
    setActiveTab, 
    addToast,
    chatSessions,
    currentSessionId,
    addChatSession,
    deleteChatSession,
    setCurrentSessionId,
    loadChatSession,
    updateChatSession,
  } = useStore();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [pendingJob, setPendingJob] = useState<Partial<JobCard> | null>(null);
  const [isPathPickerOpen, setIsPathPickerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // 判断是否应该解析职位（包含职位相关关键词或图片）
  const shouldParseJob = (text: string, hasImage: boolean): boolean => {
    if (hasImage) return true;
    const jobKeywords = ['职位', '岗位', 'JD', '招聘', '薪资', '要求', '职责', '工程师', '经理', '总监', '专员'];
    return jobKeywords.some(keyword => text.includes(keyword));
  };

  // 生成会话标题
  const generateSessionTitle = (messages: AIMessage[]): string => {
    // 查找AI消息中的解析职位信息
    const aiMessageWithJob = messages.find(m => m.type === 'ai' && m.parsedJob);
    if (aiMessageWithJob?.parsedJob) {
      const company = aiMessageWithJob.parsedJob.company?.name;
      const position = aiMessageWithJob.parsedJob.position?.title;
      if (company && position) {
        return `${company} - ${position}`;
      }
    }
    
    // 否则使用第一条用户消息
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (firstUserMessage) {
      const content = firstUserMessage.content || '';
      // 提取前20个字符作为标题
      return content.slice(0, 20) + (content.length > 20 ? '...' : '') || '新对话';
    }
    return '新对话';
  };

  const handleSend = async () => {
    if (!input.trim() && !uploadedImage) return;

    // 如果没有当前会话，创建一个新会话
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = `session-${Date.now()}`;
      const newSession: ChatSession = {
        id: sessionId,
        title: '新对话',
        messages: [],
        updatedAt: Date.now(),
      };
      addChatSession(newSession);
    }

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: Date.now(),
      image: uploadedImage || undefined,
    };

    addAIMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // 判断是职位解析还是普通对话
      const isJobRelated = shouldParseJob(input, !!uploadedImage);

      if (isJobRelated) {
        // 职位解析模式
        let imageBase64: string | undefined;
        if (uploadedImage) {
          imageBase64 = uploadedImage.split(',')[1];
        }

        const parsedJob = await parseJobWithDoubao(input, imageBase64);

        const aiMessage: AIMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'ai',
          content: '已为您解析该职位信息',
          parsedJob,
          stage: 'complete',
          timestamp: Date.now() + 1,
        };

        addAIMessage(aiMessage);
        setPendingJob(parsedJob);
        
        // 更新会话标题
        if (sessionId) {
          const updatedMessages = [...aiMessages, userMessage, aiMessage];
          const title = generateSessionTitle(updatedMessages);
          updateChatSession(sessionId, { 
            title,
            messages: updatedMessages,
            updatedAt: Date.now() 
          });
        }
      } else {
        // 普通对话模式
        const aiResponse = await chatWithAI(aiMessages, input);

        const aiMessage: AIMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'ai',
          content: aiResponse,
          timestamp: Date.now() + 1,
        };

        addAIMessage(aiMessage);
        
        // 更新会话标题
        if (sessionId) {
          const updatedMessages = [...aiMessages, userMessage, aiMessage];
          const title = generateSessionTitle(updatedMessages);
          updateChatSession(sessionId, { 
            title,
            messages: updatedMessages,
            updatedAt: Date.now() 
          });
        }
      }
    } catch (error) {
      console.error('发送失败:', error);
      addToast({
        message: '发送失败，请重试',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setUploadedImage(null);
    }
  };

  const handleAddToBookmark = () => {
    if (pendingJob) {
      setIsPathPickerOpen(true);
    }
  };

  const handleConfirmAdd = (folderId: string) => {
    if (pendingJob) {
      const newJob: JobCard = {
        ...pendingJob,
        folderId,
        id: `job-${Date.now()}`,
        createdAt: Date.now(),
        hasReminder: false,
        reminderEvent: undefined,
        position: {
          ...pendingJob.position,
          status: 'new',
        },
      } as JobCard;

      addJob(newJob);
      setIsPathPickerOpen(false);
      setPendingJob(null);

      const folder = folders.find((f) => f.id === folderId);
      addToast({
        message: `已添加至「${folder?.name}」`,
        type: 'success',
        action: {
          label: '去查看',
          onClick: () => setActiveTab('bookmark'),
        },
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({
        message: '请上传图片文件',
        type: 'error',
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 处理粘贴事件
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  }, []);

  // 添加粘贴事件监听
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('paste', handlePaste);
      return () => textarea.removeEventListener('paste', handlePaste);
    }
  }, [handlePaste]);

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        addToast({
          message: '请上传图片文件',
          type: 'error',
        });
      }
    }
  };

  // 新建对话
  const handleNewChat = () => {
    // 保存当前对话
    if (aiMessages.length > 0 && currentSessionId) {
      const title = generateSessionTitle(aiMessages);
      // 更新当前会话
      updateChatSession(currentSessionId, {
        title,
        messages: [...aiMessages],
        updatedAt: Date.now(),
      });
    }
    
    // 创建新会话
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: '新对话',
      messages: [],
      updatedAt: Date.now(),
    };
    addChatSession(newSession);
    setCurrentSessionId(newSessionId);
    clearAIMessages();
    setPendingJob(null);
    setUploadedImage(null);
    setInput('');
  };

  // 加载历史会话
  const handleLoadSession = (sessionId: string) => {
    loadChatSession(sessionId);
    setPendingJob(null);
    setUploadedImage(null);
  };

  // 删除历史会话
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChatSession(sessionId);
    addToast({
      message: '对话已删除',
      type: 'info',
    });
  };

  // 过滤历史记录
  const filteredSessions = chatSessions
    .filter(session => 
      session.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // 过滤掉隐藏的 AI 消息
  const visibleMessages = aiMessages.filter((msg) => !msg.hidden);

  return (
    <div className="h-full flex">
      {/* 历史记录侧边栏 - 奶油风设计 */}
      <aside 
        className={`hidden lg:flex flex-col bg-white h-[calc(100vh-6rem)] rounded-3xl mr-6 transition-all duration-300 ease-in-out relative flex-shrink-0 ${
          isSidebarCollapsed ? 'w-16 p-3' : 'w-64 p-5'
        }`}
      >
        {/* 折叠/展开按钮 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-[#8C837A] hover:text-[#2D2D2D] z-10 border border-[#EFECE6]"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>

        {/* 标题 */}
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2 mb-6">
            <History size={20} className="text-[#2D2D2D]" strokeWidth={2.5} />
            <h2 className="text-lg font-black text-[#2D2D2D] tracking-tight">历史记录</h2>
          </div>
        )}

        {isSidebarCollapsed && (
          <div className="flex justify-center mb-6">
            <History size={20} className="text-[#2D2D2D]" strokeWidth={2.5} />
          </div>
        )}

        {/* 新建对话按钮 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewChat}
          className={`w-full mb-4 rounded-2xl bg-[#2D2D2D] text-white font-black transition-colors flex items-center justify-center ${
            isSidebarCollapsed ? 'p-3' : 'p-4 gap-2'
          }`}
          title={isSidebarCollapsed ? '新对话' : undefined}
        >
          <Plus size={isSidebarCollapsed ? 20 : 18} strokeWidth={3} />
          {!isSidebarCollapsed && <span>新对话</span>}
        </motion.button>

        {/* 搜索框 */}
        {!isSidebarCollapsed && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C837A]" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="搜索对话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F9F7F2] border border-[#EFECE6] text-sm text-[#2D2D2D] placeholder:text-[#8C837A] focus:border-[#2D2D2D] outline-none transition-colors font-medium"
            />
          </div>
        )}

        {/* 历史记录列表 */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredSessions.map((session) => {
            const isActive = currentSessionId === session.id;
            
            return (
              <motion.div
                key={session.id}
                whileHover={{ x: isSidebarCollapsed ? 0 : 4 }}
                onClick={() => handleLoadSession(session.id)}
                className={`
                  group relative cursor-pointer rounded-xl transition-all duration-200
                  ${isSidebarCollapsed 
                    ? 'p-3 flex justify-center' 
                    : 'p-3'
                  }
                  ${isActive 
                    ? 'bg-[#2D2D2D]' 
                    : 'hover:bg-[#F9F7F2]'
                  }
                `}
                title={isSidebarCollapsed ? session.title : undefined}
              >
                {!isSidebarCollapsed && (
                  <>
                    <div className="flex items-start gap-2" title={session.title}>
                      <MessageSquare 
                        size={16} 
                        className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#8C837A]'}`} 
                        strokeWidth={2.5}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black truncate ${isActive ? 'text-white' : 'text-[#2D2D2D]'}`}>
                          {session.title}
                        </p>
                        <p className={`text-xs mt-1 ${isActive ? 'text-white/60' : 'text-[#8C837A]'}`}>
                          {new Date(session.updatedAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    
                    {/* 删除按钮 */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white/60 hover:text-white' : 'text-[#8C837A] hover:bg-[#FDE2E4]/50'}`}
                      title="删除对话"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </>
                )}
                
                {isSidebarCollapsed && (
                  <MessageSquare 
                    size={20} 
                    className={isActive ? 'text-[#2D2D2D]' : 'text-[#8C837A]'} 
                    strokeWidth={2.5}
                  />
                )}
              </motion.div>
            );
          })}
          
          {filteredSessions.length === 0 && !isSidebarCollapsed && (
            <div className="text-center py-8">
              <p className="text-sm text-[#8C837A]">暂无历史记录</p>
            </div>
          )}
        </div>
      </aside>

      {/* 主聊天区域 */}
      <main 
        ref={dropZoneRef}
        className="flex-1 flex flex-col relative bg-white rounded-3xl h-[calc(100vh-6rem)]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 拖拽提示遮罩 */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#EAF4F4]/80 backdrop-blur-sm border-4 border-dashed border-[#2D2D2D] m-4 rounded-3xl flex items-center justify-center"
            >
              <div className="text-center">
                <ImageIcon size={48} className="text-[#2D2D2D] mx-auto mb-4" strokeWidth={2} />
                <p className="text-lg font-black text-[#2D2D2D]">释放以上传图片</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFECE6]">
          <div className="flex items-center gap-3">
            <AIAvatar size="sm" />
            <span className="text-sm font-black text-[#2D2D2D] tracking-tight">AI 求职助手</span>
          </div>
          
          {/* 移动端新建对话按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewChat}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#8C837A] hover:bg-[#F9F7F2] transition-colors font-black"
          >
            <Plus size={16} strokeWidth={3} />
            新对话
          </motion.button>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-6 pb-2 space-y-4">
          {visibleMessages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center px-4 pb-4"
            >
              <div className="mb-4">
                <AIAvatar size="lg" />
              </div>
              <h3 className="text-3xl font-black text-[#2D2D2D] mb-3 tracking-tight">AI 求职助手</h3>
              <div className="space-y-3 max-w-md">
                <p className="text-[#8C837A] font-medium">
                  你好！我是你的求职 AI 助手，可以帮你：
                </p>
                <ul className="text-sm text-[#8C837A] space-y-3 text-left bg-[#F9F7F2] rounded-2xl p-6">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#FDE2E4] mt-1.5 flex-shrink-0" />
                    <span>上传<strong className="text-[#2D2D2D]">岗位 JD 截图</strong>，自动提取职位信息</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#FFEDD8] mt-1.5 flex-shrink-0" />
                    <span>粘贴<strong className="text-[#2D2D2D]">职位描述文本</strong>，智能解析关键内容</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#E2EAFC] mt-1.5 flex-shrink-0" />
                    <span>获取<strong className="text-[#2D2D2D]">个性化求职建议</strong>：简历优化、面试准备、薪资谈判</span>
                  </li>
                </ul>
                <p className="text-xs text-[#8C837A] mt-4 font-black tracking-wider">
                  支持图片 + 文字组合输入，让解析更准确
                </p>
              </div>
            </motion.div>
          )}

          {visibleMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' ? (
                <div className="max-w-[85%] space-y-3">
                  {/* AI 头像和标签 */}
                  <div className="flex items-center gap-2">
                    <AIAvatar size="md" isTyping={isLoading} />
                    <span className="text-sm font-black text-[#8C837A]">AI 助手</span>
                  </div>

                  {/* AI 消息内容 */}
                  <div className="bg-[#F9F7F2] rounded-2xl rounded-tl-sm p-5">
                    <p className="text-[#2D2D2D] font-medium">{message.content}</p>
                  </div>

                  {/* 解析结果卡片 */}
                  {message.parsedJob && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-3xl p-6 shadow-sm border border-[#EFECE6] space-y-5"
                    >
                      {/* 公司信息 */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FDE2E4] flex items-center justify-center flex-shrink-0">
                          <Building2 size={24} className="text-[#2D2D2D]" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-[#2D2D2D] truncate text-xl tracking-tight">
                            {message.parsedJob.company?.name || '未识别公司名称'}
                          </h4>
                          <p className="text-sm text-[#8C837A] font-medium">
                            {message.parsedJob.position?.title || '未识别职位名称'}
                          </p>
                        </div>
                      </div>

                      {/* 基本信息 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {message.parsedJob.position?.salary && (
                          <div className="flex items-center gap-2">
                            <Banknote size={16} className="text-[#2D2D2D]" strokeWidth={2.5} />
                            <span className="text-[#2D2D2D] font-black">{message.parsedJob.position.salary}</span>
                          </div>
                        )}
                        {message.parsedJob.position?.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#8C837A]" strokeWidth={2.5} />
                            <span className="text-[#8C837A] font-medium">{message.parsedJob.position.location}</span>
                          </div>
                        )}
                        {message.parsedJob.position?.education && (
                          <div className="flex items-center gap-2">
                            <GraduationCap size={16} className="text-[#8C837A]" strokeWidth={2.5} />
                            <span className="text-[#2D2D2D] font-black">{message.parsedJob.position.education}</span>
                          </div>
                        )}
                        {message.parsedJob.position?.experience && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[#8C837A]" strokeWidth={2.5} />
                            <span className="text-[#2D2D2D] font-black">{message.parsedJob.position.experience}</span>
                          </div>
                        )}
                      </div>

                      {/* 岗位职责 */}
                      {message.parsedJob.aiAnalysis?.responsibilities && message.parsedJob.aiAnalysis.responsibilities.length > 0 && (
                        <div className="pt-4 border-t border-[#EFECE6]">
                          <div className="flex items-center gap-2 mb-3">
                            <Briefcase size={16} className="text-[#2D2D2D]" strokeWidth={2.5} />
                            <span className="text-xs font-black text-[#8C837A] tracking-widest uppercase">岗位职责</span>
                          </div>
                          <ul className="space-y-2">
                            {message.parsedJob.aiAnalysis.responsibilities.map((item, idx) => (
                              <li key={idx} className="text-sm text-[#2D2D2D] flex items-start gap-2 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FDE2E4] mt-1.5 flex-shrink-0" />
                                <span className="line-clamp-2">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 任职要求 */}
                      {message.parsedJob.aiAnalysis?.requirements && message.parsedJob.aiAnalysis.requirements.length > 0 && (
                        <div className="pt-4 border-t border-[#EFECE6]">
                          <div className="flex items-center gap-2 mb-3">
                            <ListTodo size={16} className="text-[#2D2D2D]" strokeWidth={2.5} />
                            <span className="text-xs font-black text-[#8C837A] tracking-widest uppercase">任职要求</span>
                          </div>
                          <ul className="space-y-2">
                            {message.parsedJob.aiAnalysis.requirements.map((item, idx) => (
                              <li key={idx} className="text-sm text-[#2D2D2D] flex items-start gap-2 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FFEDD8] mt-1.5 flex-shrink-0" />
                                <span className="line-clamp-2">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI 建议 */}
                      {message.parsedJob.aiAnalysis?.suggestions && (
                        <div className="pt-4 border-t border-[#EFECE6] space-y-4">
                          <div className="flex items-center gap-2">
                            <Lightbulb size={16} className="text-[#2D2D2D]" strokeWidth={2.5} />
                            <span className="text-xs font-black text-[#8C837A] tracking-widest uppercase">AI 求职建议</span>
                          </div>
                          
                          {/* 简历建议 */}
                          {message.parsedJob.aiAnalysis.suggestions.resume && (
                            <div className="bg-[#FDE2E4]/30 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <FileText size={14} className="text-[#2D2D2D]" strokeWidth={2.5} />
                                <span className="text-xs font-black text-[#2D2D2D] tracking-wider">简历优化</span>
                              </div>
                              <div className="text-xs text-[#8C837A] space-y-2 leading-relaxed">
                                {message.parsedJob.aiAnalysis.suggestions.resume.split('\n').map((line, idx) => (
                                  line.trim() && (
                                    <p key={idx} className={line.startsWith('•') ? '' : 'pl-3'}>
                                      {line}
                                    </p>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* 面试建议 */}
                          {message.parsedJob.aiAnalysis.suggestions.interview && (
                            <div className="bg-[#FFEDD8]/30 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <MessageSquare size={14} className="text-[#2D2D2D]" strokeWidth={2.5} />
                                <span className="text-xs font-black text-[#2D2D2D] tracking-wider">面试准备</span>
                              </div>
                              <div className="text-xs text-[#8C837A] space-y-2 leading-relaxed">
                                {message.parsedJob.aiAnalysis.suggestions.interview.split('\n').map((line, idx) => (
                                  line.trim() && (
                                    <p key={idx} className={line.startsWith('•') ? '' : 'pl-3'}>
                                      {line}
                                    </p>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* 薪资建议 */}
                          {message.parsedJob.aiAnalysis.suggestions.negotiation && (
                            <div className="bg-[#E2EAFC]/30 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <DollarSign size={14} className="text-[#2D2D2D]" strokeWidth={2.5} />
                                <span className="text-xs font-black text-[#2D2D2D] tracking-wider">薪资谈判</span>
                              </div>
                              <div className="text-xs text-[#8C837A] space-y-2 leading-relaxed">
                                {message.parsedJob.aiAnalysis.suggestions.negotiation.split('\n').map((line, idx) => (
                                  line.trim() && (
                                    <p key={idx} className={line.startsWith('•') ? '' : 'pl-3'}>
                                      {line}
                                    </p>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Action Bar */}
                  {message.parsedJob && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#EFECE6]"
                    >
                      <span className="text-sm text-[#2D2D2D] font-medium">是否将此职位加入收藏？</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToBookmark}
                        className="px-5 py-2.5 rounded-xl text-sm bg-[#2D2D2D] text-white font-black flex items-center gap-2"
                      >
                        添加收藏
                        <ArrowRight size={14} strokeWidth={3} />
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="max-w-[80%] bg-[#2D2D2D] rounded-2xl rounded-tr-sm px-5 py-4">
                  {message.image && (
                    <div className="mb-3">
                      <ImagePreview
                        src={message.image}
                        alt="上传的图片"
                        maxHeight="12rem"
                        className="rounded-xl"
                      />
                    </div>
                  )}
                  {message.content && (
                    <p className="text-white font-medium">{message.content}</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-[#F9F7F2] rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                <Loader2 size={18} className="text-[#2D2D2D] animate-spin" />
                <span className="text-sm text-[#8C837A] font-medium">AI 正在分析...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* 输入区域 */}
        <div className="p-3 border-t border-[#EFECE6]">
          <div className="max-w-2xl mx-auto">
            {/* 图片预览 */}
            <AnimatePresence>
              {uploadedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2"
                >
                  <div className="relative inline-block">
                    <ImagePreview
                      src={uploadedImage}
                      alt="预览"
                      maxHeight="5rem"
                      className="rounded-xl"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center z-10"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-3 bg-[#F9F7F2] rounded-2xl border border-[#EFECE6] p-2.5">
              {/* 图片上传按钮 */}
              <label className="p-3 rounded-xl hover:bg-white cursor-pointer transition-colors flex-shrink-0">
                <ImageIcon size={20} className="text-[#8C837A]" strokeWidth={2.5} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {/* 文本输入 */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="粘贴职位描述，AI 帮你分析...（支持粘贴图片）"
                className="flex-1 max-h-32 py-3 px-1 bg-transparent border-none outline-none resize-none text-[#2D2D2D] placeholder:text-[#8C837A]/60 font-medium"
                rows={1}
              />

              {/* 发送按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() && !uploadedImage}
                className="p-3 rounded-xl bg-[#2D2D2D] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send size={18} strokeWidth={2.5} />
              </motion.button>
            </div>
            
            {/* 提示文字 */}
            <p className="text-xs text-[#8C837A] mt-2 text-center font-black tracking-wider">
              支持拖拽、粘贴、点击上传图片
            </p>
          </div>
        </div>
      </main>

      {/* 路径选择器 Modal */}
      <PathPickerModal
        isOpen={isPathPickerOpen}
        onClose={() => setIsPathPickerOpen(false)}
        onSelect={handleConfirmAdd}
      />
    </div>
  );
}
