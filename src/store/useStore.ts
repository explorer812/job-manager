import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JobCard, Folder, TabType, AIMessage, Toast, ScheduleFilter, EventTypeFilter, UrgencyFilter, JobStatus, FolderColor, User, ChatSession } from '../types';
import { mockJobs, mockFolders, mockAIMessages } from '../utils/mockData';

// Tab 切换方向
export type SlideDirection = 'left' | 'right' | 'none';

interface AppState {
  // Tab 状态
  activeTab: TabType;
  slideDirection: SlideDirection;
  setActiveTab: (tab: TabType) => void;

  // 文件夹状态
  folders: Folder[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  addFolder: (name: string, color: FolderColor) => void;
  deleteFolder: (id: string) => void;
  updateFolderName: (id: string, name: string) => void;
  updateFolderJobCount: () => void;

  // 职位状态
  jobs: JobCard[];
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  addJob: (job: JobCard) => void;
  updateJob: (id: string, updates: Partial<JobCard>) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  moveJobToFolder: (jobId: string, folderId: string) => void;
  deleteJob: (id: string) => void;
  archiveJob: (id: string) => void;

  // AI 聊天状态
  aiMessages: AIMessage[];
  addAIMessage: (message: AIMessage) => void;
  clearAIMessages: () => void;
  hideAIMessage: (id: string) => void;

  // AI 对话会话
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  addChatSession: (session: ChatSession) => void;
  deleteChatSession: (id: string) => void;
  setCurrentSessionId: (id: string | null) => void;
  loadChatSession: (id: string) => void;
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void;

  // 日程筛选 - 多维筛选
  eventTypeFilter: EventTypeFilter;
  setEventTypeFilter: (filter: EventTypeFilter) => void;
  urgencyFilter: UrgencyFilter;
  setUrgencyFilter: (filter: UrgencyFilter) => void;
  // 兼容旧代码
  scheduleFilter: ScheduleFilter;
  setScheduleFilter: (filter: ScheduleFilter) => void;

  // Toast 通知
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // UI 状态
  isFolderModalOpen: boolean;
  setIsFolderModalOpen: (open: boolean) => void;
  isPathPickerOpen: boolean;
  setIsPathPickerOpen: (open: boolean) => void;
  pendingJobForAdd: Partial<JobCard> | null;
  setPendingJobForAdd: (job: Partial<JobCard> | null) => void;

  // 详情 Drawer
  isDetailDrawerOpen: boolean;
  setIsDetailDrawerOpen: (open: boolean) => void;

  // 用户状态
  user: User | null;
  isLoginModalOpen: boolean;
  isSettingsModalOpen: boolean;
  loginModalMode: 'login' | 'register';
  setUser: (user: User | null) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsSettingsModalOpen: (open: boolean) => void;
  setLoginModalMode: (mode: 'login' | 'register') => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nickname: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  updateUserPassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Tab 状态
      activeTab: 'bookmark',
      slideDirection: 'none',
      setActiveTab: (tab) => {
        const currentTab = get().activeTab;
        const tabOrder: TabType[] = ['bookmark', 'ai', 'schedule'];
        const currentIndex = tabOrder.indexOf(currentTab);
        const newIndex = tabOrder.indexOf(tab);
        const direction: SlideDirection = newIndex > currentIndex ? 'left' : newIndex < currentIndex ? 'right' : 'none';
        set({ activeTab: tab, slideDirection: direction });
      },

      // 文件夹状态
      folders: mockFolders,
      selectedFolderId: mockFolders[0]?.id || null,
      setSelectedFolderId: (id) => set({ selectedFolderId: id }),
      addFolder: (name, color) => {
        const newFolder: Folder = {
          id: `folder-${generateId()}`,
          name,
          color,
          jobCount: 0,
        };
        set((state) => ({ folders: [...state.folders, newFolder] }));
      },
      deleteFolder: (id) => {
        set((state) => {
          // 删除文件夹时，将其中的职位移动到第一个文件夹
          const remainingFolders = state.folders.filter((f) => f.id !== id);
          const defaultFolderId = remainingFolders[0]?.id;
          
          const newJobs = state.jobs.map((job) =>
            job.folderId === id && defaultFolderId
              ? { ...job, folderId: defaultFolderId }
              : job
          );
          
          const updatedFolders = remainingFolders.map((folder) => ({
            ...folder,
            jobCount: newJobs.filter((j) => j.folderId === folder.id).length,
          }));
          
          // 如果删除的是当前选中的文件夹，切换到第一个文件夹
          const newSelectedId = state.selectedFolderId === id 
            ? defaultFolderId || null 
            : state.selectedFolderId;
          
          return { 
            folders: updatedFolders, 
            jobs: newJobs,
            selectedFolderId: newSelectedId
          };
        });
      },
      updateFolderName: (id, name) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, name } : folder
          ),
        }));
      },
      updateFolderJobCount: () => {
        const { jobs, folders } = get();
        const updatedFolders = folders.map((folder) => ({
          ...folder,
          jobCount: jobs.filter((job) => job.folderId === folder.id).length,
        }));
        set({ folders: updatedFolders });
      },

      // 职位状态
      jobs: mockJobs,
      selectedJobId: null,
      setSelectedJobId: (id) => set({ selectedJobId: id }),
      addJob: (job) => {
        set((state) => {
          const newJobs = [...state.jobs, job];
          // 更新文件夹计数
          const updatedFolders = state.folders.map((folder) => ({
            ...folder,
            jobCount: newJobs.filter((j) => j.folderId === folder.id).length,
          }));
          return { jobs: newJobs, folders: updatedFolders };
        });
      },
      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...updates } : job)),
        }));
      },
      updateJobStatus: (id, status) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, position: { ...job.position, status } } : job
          ),
        }));
      },
      moveJobToFolder: (jobId, folderId) => {
        set((state) => {
          const newJobs = state.jobs.map((job) =>
            job.id === jobId ? { ...job, folderId } : job
          );
          const updatedFolders = state.folders.map((folder) => ({
            ...folder,
            jobCount: newJobs.filter((j) => j.folderId === folder.id).length,
          }));
          return { jobs: newJobs, folders: updatedFolders };
        });
      },
      deleteJob: (id) => {
        set((state) => {
          const newJobs = state.jobs.filter((job) => job.id !== id);
          const updatedFolders = state.folders.map((folder) => ({
            ...folder,
            jobCount: newJobs.filter((j) => j.folderId === folder.id).length,
          }));
          return { jobs: newJobs, folders: updatedFolders };
        });
      },
      archiveJob: (id) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, isArchived: true } : job
          ),
        }));
      },

      // AI 聊天状态
      aiMessages: mockAIMessages,
      addAIMessage: (message) => {
        set((state) => {
          const newMessages = [...state.aiMessages, message];
          // 同时更新当前会话的消息
          if (state.currentSessionId) {
            const updatedSessions = state.chatSessions.map((session) =>
              session.id === state.currentSessionId
                ? { ...session, messages: newMessages, updatedAt: Date.now() }
                : session
            );
            return { aiMessages: newMessages, chatSessions: updatedSessions };
          }
          return { aiMessages: newMessages };
        });
      },
      clearAIMessages: () => set({ aiMessages: [] }),
      hideAIMessage: (id) => {
        set((state) => ({
          aiMessages: state.aiMessages.map((msg) =>
            msg.id === id ? { ...msg, hidden: true } : msg
          ),
        }));
      },

      // AI 对话会话
      chatSessions: [],
      currentSessionId: null,
      addChatSession: (session) => {
        set((state) => ({
          chatSessions: [session, ...state.chatSessions],
          currentSessionId: session.id,
        }));
      },
      deleteChatSession: (id) => {
        set((state) => {
          const newSessions = state.chatSessions.filter((s) => s.id !== id);
          // 如果删除的是当前会话，清空当前消息
          if (state.currentSessionId === id) {
            return {
              chatSessions: newSessions,
              currentSessionId: null,
              aiMessages: [],
            };
          }
          return { chatSessions: newSessions };
        });
      },
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      loadChatSession: (id) => {
        const session = get().chatSessions.find((s) => s.id === id);
        if (session) {
          set({
            currentSessionId: id,
            aiMessages: session.messages,
          });
        }
      },
      updateChatSession: (id, updates) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((session) =>
            session.id === id ? { ...session, ...updates, updatedAt: Date.now() } : session
          ),
        }));
      },

      // 日程筛选 - 多维筛选
      eventTypeFilter: 'all',
      setEventTypeFilter: (filter) => set({ eventTypeFilter: filter }),
      urgencyFilter: 'all',
      setUrgencyFilter: (filter) => set({ urgencyFilter: filter }),
      // 兼容旧代码
      scheduleFilter: 'all',
      setScheduleFilter: (filter) => set({ scheduleFilter: filter }),

      // Toast 通知
      toasts: [],
      addToast: (toast) => {
        const id = generateId();
        const newToast = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        // 自动移除
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration || 3000);
        }
      },
      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      // UI 状态
      isFolderModalOpen: false,
      setIsFolderModalOpen: (open) => set({ isFolderModalOpen: open }),
      isPathPickerOpen: false,
      setIsPathPickerOpen: (open) => set({ isPathPickerOpen: open }),
      pendingJobForAdd: null,
      setPendingJobForAdd: (job) => set({ pendingJobForAdd: job }),

      // 详情 Drawer
      isDetailDrawerOpen: false,
      setIsDetailDrawerOpen: (open) => set({ isDetailDrawerOpen: open }),

      // 用户状态
      user: null,
      isLoginModalOpen: false,
      isSettingsModalOpen: false,
      loginModalMode: 'login',
      setUser: (user) => set({ user }),
      setIsLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
      setIsSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
      setLoginModalMode: (mode) => set({ loginModalMode: mode }),
      login: async (email, password) => {
        // 模拟登录验证（实际项目中应该调用后端 API）
        const users = JSON.parse(localStorage.getItem('job-manager-users') || '[]');
        const user = users.find((u: User) => u.email === email);
        
        if (user) {
          // 验证密码（实际应该加密比较）
          const storedPassword = localStorage.getItem(`job-manager-password-${user.id}`);
          if (storedPassword === password) {
            set({ user });
            return true;
          }
        }
        return false;
      },
      register: async (nickname, email, password) => {
        // 模拟注册（实际项目中应该调用后端 API）
        const users = JSON.parse(localStorage.getItem('job-manager-users') || '[]');
        
        // 检查邮箱是否已存在
        if (users.some((u: User) => u.email === email)) {
          return false;
        }
        
        const newUser: User = {
          id: `user-${generateId()}`,
          nickname,
          email,
          createdAt: Date.now(),
        };
        
        users.push(newUser);
        localStorage.setItem('job-manager-users', JSON.stringify(users));
        localStorage.setItem(`job-manager-password-${newUser.id}`, password);
        
        set({ user: newUser });
        return true;
      },
      logout: () => {
        set({ user: null });
      },
      updateUserProfile: (updates) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...updates };
          // 更新本地存储
          const users = JSON.parse(localStorage.getItem('job-manager-users') || '[]');
          const updatedUsers = users.map((u: User) => 
            u.id === updatedUser.id ? updatedUser : u
          );
          localStorage.setItem('job-manager-users', JSON.stringify(updatedUsers));
          return { user: updatedUser };
        });
      },
      updateUserPassword: (oldPassword: string, newPassword: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const state = get();
          if (!state.user) {
            resolve(false);
            return;
          }
          
          // 验证旧密码
          const storedPassword = localStorage.getItem(`job-manager-password-${state.user.id}`);
          if (storedPassword !== oldPassword) {
            resolve(false);
            return;
          }
          
          // 更新密码
          localStorage.setItem(`job-manager-password-${state.user.id}`, newPassword);
          resolve(true);
        });
      },
    }),
    {
      name: 'job-manager-storage',
      partialize: (state) => ({
        folders: state.folders,
        jobs: state.jobs,
        aiMessages: state.aiMessages,
        user: state.user,
        chatSessions: state.chatSessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);

// 派生状态选择器
export const selectFilteredJobs = (state: AppState) => {
  const { jobs, selectedFolderId } = state;
  if (!selectedFolderId) return jobs;
  return jobs.filter((job) => job.folderId === selectedFolderId);
};

export const selectScheduleJobs = (state: AppState) => {
  const { jobs, scheduleFilter } = state;
  const now = new Date();

  // 只显示有提醒且未归档的职位
  const jobsWithReminder = jobs.filter((job) => job.hasReminder && !job.isArchived);

  if (scheduleFilter === 'archived') {
    return jobs.filter((job) => job.isArchived);
  }

  return jobsWithReminder
    .filter((job) => {
      if (!job.position.deadline) return false;
      const deadline = new Date(job.position.deadline);
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      switch (scheduleFilter) {
        case 'urgent':
          return daysUntil <= 3 && daysUntil >= 0;
        case 'week':
          return daysUntil <= 7 && daysUntil >= 0;
        case 'overdue':
          return daysUntil < 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      if (!a.position.deadline || !b.position.deadline) return 0;
      return new Date(a.position.deadline).getTime() - new Date(b.position.deadline).getTime();
    });
};

export const selectSelectedJob = (state: AppState) => {
  const { jobs, selectedJobId } = state;
  return jobs.find((job) => job.id === selectedJobId) || null;
};
