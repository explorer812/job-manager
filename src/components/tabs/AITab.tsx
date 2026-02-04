import { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PathPickerModal } from './PathPickerModal';
import { AIAvatar } from '../ui/AIAvatar';
import { parseJobWithDoubao } from '../../services/doubaoService';
import { chatWithAI } from '../../services/chatService';
import type { AIMessage, JobCard } from '../../types';

export function AITab() {
  const { aiMessages, addAIMessage, clearAIMessages, folders, addJob, setActiveTab, addToast } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [pendingJob, setPendingJob] = useState<Partial<JobCard> | null>(null);
  const [isPathPickerOpen, setIsPathPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSend = async () => {
    if (!input.trim() && !uploadedImage) return;

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
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 过滤掉隐藏的 AI 消息
  const visibleMessages = aiMessages.filter((msg) => !msg.hidden);

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <AIAvatar size="sm" />
          <span className="text-sm font-medium text-[#2D3748]">AI 求职助手</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            clearAIMessages();
            setPendingJob(null);
            setUploadedImage(null);
            setInput('');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#718096] hover:bg-gray-100 transition-colors"
        >
          <Plus size={16} />
          新对话
        </motion.button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <div className="mb-4">
              <AIAvatar size="lg" />
            </div>
            <h3 className="text-xl font-semibold text-[#2D3748] mb-3">AI 求职助手</h3>
            <div className="space-y-3 max-w-sm">
              <p className="text-[#718096]">
                你好！我是你的求职 AI 助手，可以帮你：
              </p>
              <ul className="text-sm text-[#718096] space-y-2 text-left bg-white/60 rounded-xl p-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#B5EAD7] mt-0.5">•</span>
                  <span>上传<strong>岗位 JD 截图</strong>，自动提取职位信息</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C7CEEA] mt-0.5">•</span>
                  <span>粘贴<strong>职位描述文本</strong>，智能解析关键内容</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFB6A3] mt-0.5">•</span>
                  <span>获取<strong>个性化求职建议</strong>：简历优化、面试准备、薪资谈判</span>
                </li>
              </ul>
              <p className="text-xs text-[#718096] mt-4">
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
                  <span className="text-sm font-medium text-[#718096]">AI 助手</span>
                </div>

                {/* AI 消息内容 */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 shadow-sm border border-white/50">
                  <p className="text-[#2D3748]">{message.content}</p>
                </div>

                {/* 解析结果卡片 */}
                {message.parsedJob && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50 space-y-4"
                  >
                    {/* 公司信息 */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5EAD7]/30 to-[#C7CEEA]/30 flex items-center justify-center flex-shrink-0">
                        <Building2 size={20} className="text-[#718096]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#2D3748] truncate">
                          {message.parsedJob.company?.name || '未识别公司名称'}
                        </h4>
                        <p className="text-sm text-[#718096]">
                          {message.parsedJob.position?.title || '未识别职位名称'}
                        </p>
                      </div>
                    </div>

                    {/* 基本信息 */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {message.parsedJob.position?.salary && (
                        <div className="flex items-center gap-2">
                          <Banknote size={14} className="text-[#B5EAD7]" />
                          <span className="text-[#2D3748]">{message.parsedJob.position.salary}</span>
                        </div>
                      )}
                      {message.parsedJob.position?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-[#718096]" />
                          <span className="text-[#718096]">{message.parsedJob.position.location}</span>
                        </div>
                      )}
                      {message.parsedJob.position?.education && (
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="text-[#C7CEEA]" />
                          <span className="text-[#2D3748]">{message.parsedJob.position.education}</span>
                        </div>
                      )}
                      {message.parsedJob.position?.experience && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-[#FFB6A3]" />
                          <span className="text-[#2D3748]">{message.parsedJob.position.experience}</span>
                        </div>
                      )}
                    </div>

                    {/* 岗位职责 */}
                    {message.parsedJob.aiAnalysis?.responsibilities && message.parsedJob.aiAnalysis.responsibilities.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase size={14} className="text-[#B5EAD7]" />
                          <span className="text-xs font-medium text-[#718096]">岗位职责</span>
                        </div>
                        <ul className="space-y-1">
                          {message.parsedJob.aiAnalysis.responsibilities.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-[#2D3748] flex items-start gap-2">
                              <span className="text-[#B5EAD7] mt-1">•</span>
                              <span className="line-clamp-2">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 任职要求 */}
                    {message.parsedJob.aiAnalysis?.requirements && message.parsedJob.aiAnalysis.requirements.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <ListTodo size={14} className="text-[#C7CEEA]" />
                          <span className="text-xs font-medium text-[#718096]">任职要求</span>
                        </div>
                        <ul className="space-y-1">
                          {message.parsedJob.aiAnalysis.requirements.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-[#2D3748] flex items-start gap-2">
                              <span className="text-[#C7CEEA] mt-1">•</span>
                              <span className="line-clamp-2">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI 建议 */}
                    {message.parsedJob.aiAnalysis?.suggestions && (
                      <div className="pt-3 border-t border-gray-100 space-y-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb size={14} className="text-[#FFB6A3]" />
                          <span className="text-xs font-medium text-[#718096]">AI 求职建议</span>
                        </div>
                        
                        {/* 简历建议 */}
                        {message.parsedJob.aiAnalysis.suggestions.resume && (
                          <div className="bg-[#B5EAD7]/10 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <FileText size={12} className="text-[#B5EAD7]" />
                              <span className="text-xs font-medium text-[#2D3748]">简历优化</span>
                            </div>
                            <p className="text-xs text-[#718096] line-clamp-3">
                              {message.parsedJob.aiAnalysis.suggestions.resume}
                            </p>
                          </div>
                        )}
                        
                        {/* 面试建议 */}
                        {message.parsedJob.aiAnalysis.suggestions.interview && (
                          <div className="bg-[#C7CEEA]/10 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MessageSquare size={12} className="text-[#C7CEEA]" />
                              <span className="text-xs font-medium text-[#2D3748]">面试准备</span>
                            </div>
                            <p className="text-xs text-[#718096] line-clamp-3">
                              {message.parsedJob.aiAnalysis.suggestions.interview}
                            </p>
                          </div>
                        )}
                        
                        {/* 薪资建议 */}
                        {message.parsedJob.aiAnalysis.suggestions.negotiation && (
                          <div className="bg-[#FFB6A3]/10 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <DollarSign size={12} className="text-[#FFB6A3]" />
                              <span className="text-xs font-medium text-[#2D3748]">薪资谈判</span>
                            </div>
                            <p className="text-xs text-[#718096] line-clamp-3">
                              {message.parsedJob.aiAnalysis.suggestions.negotiation}
                            </p>
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
                    className="flex items-center justify-between bg-[#B5EAD7]/10 rounded-xl p-3"
                  >
                    <span className="text-sm text-[#718096]">是否将此职位加入收藏？</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddToBookmark}
                      className="px-4 py-2 rounded-lg text-sm bg-[#B5EAD7] text-[#2D3748] font-medium flex items-center gap-1"
                    >
                      添加收藏
                      <ArrowRight size={14} />
                    </motion.button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="max-w-[80%] bg-[#C7CEEA] rounded-2xl rounded-tr-sm px-4 py-3">
                {message.image && (
                  <img
                    src={message.image}
                    alt="上传的图片"
                    className="max-w-full max-h-48 rounded-lg mb-2 object-contain"
                  />
                )}
                {message.content && (
                  <p className="text-[#2D3748]">{message.content}</p>
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
            <div className="bg-white/80 backdrop-blur-md rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={18} className="text-[#B5EAD7] animate-spin" />
              <span className="text-sm text-[#718096]">AI 正在分析...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-100 bg-white/50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          {/* 图片预览 */}
          <AnimatePresence>
            {uploadedImage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="预览"
                    className="h-20 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
            {/* 图片上传按钮 */}
            <label className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors flex-shrink-0">
              <ImageIcon size={20} className="text-[#718096]" />
              <input
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
              placeholder="粘贴职位描述，AI 帮你分析..."
              className="flex-1 max-h-32 py-2 px-1 bg-transparent border-none outline-none resize-none text-[#2D3748] placeholder:text-[#718096]/60"
              rows={1}
            />

            {/* 发送按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() && !uploadedImage}
              className="p-3 rounded-xl bg-[#B5EAD7] text-[#2D3748] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 路径选择器 Modal */}
      <PathPickerModal
        isOpen={isPathPickerOpen}
        onClose={() => setIsPathPickerOpen(false)}
        onSelect={handleConfirmAdd}
      />
    </div>
  );
}
