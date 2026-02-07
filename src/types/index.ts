// 企业类型
export type CompanyType = '互联网' | '国企' | '外企' | '金融' | '其他';

// 职位状态 - 简化为4个状态
export type JobStatus = 
  | 'new'           // 新收藏
  | 'inProgress'    // 进行中
  | 'offer'         // 已offer
  | 'rejected';     // 已挂

// 提醒事件类型
export type ReminderEvent = 'toApply' | 'writtenTest' | 'interview' | 'toOffer';

// 文件夹颜色
export type FolderColor = 'mint' | 'peach' | 'blue' | 'lavender' | 'coral';

// Tab 类型
export type TabType = 'bookmark' | 'ai' | 'schedule';

// 公司信息
export interface Company {
  name: string;
  logo?: string;
  type: CompanyType;
}

// 职位信息 - 添加学历和任职年限
export interface Position {
  title: string;
  salary: string;
  location: string;
  deadline?: string; // ISO日期，改为可选
  status: JobStatus;
  education?: string;      // 学历要求
  experience?: string;     // 任职年限
}

// AI 分析建议
export interface AISuggestions {
  resume: string;
  interview: string;
  negotiation: string;
}

// AI 分析
export interface AIAnalysis {
  responsibilities: string[];
  requirements: string[];
  suggestions: AISuggestions;
}

// 职位卡片
export interface JobCard {
  id: string;
  folderId: string;
  company: Company;
  position: Position;
  aiAnalysis: AIAnalysis;
  createdAt: number;
  applyLink?: string;      // 收藏页的投递/面试链接
  scheduleLink?: string;    // 日程页的面试/笔试/offer链接（独立于收藏）
  hasReminder?: boolean;   // 是否设置了提醒
  reminderEvent?: ReminderEvent; // 提醒事件类型
  isArchived?: boolean;    // 是否已完结归档
}

// 文件夹
export interface Folder {
  id: string;
  name: string;
  color: FolderColor;
  jobCount: number;
}

// AI 消息类型
export interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  parsedJob?: Partial<JobCard>;
  stage?: 'extracting' | 'confirm' | 'complete';
  timestamp: number;
  hidden?: boolean;        // 是否被隐藏（点击暂不需要）
  image?: string;          // 用户上传的图片 base64
}

// 事件类型筛选
export type EventTypeFilter = 'all' | 'toApply' | 'writtenTest' | 'interview' | 'toOffer';

// 紧急程度筛选
export type UrgencyFilter = 'all' | 'urgent' | 'week' | 'overdue';

// 日程筛选类型（兼容旧代码）
export type ScheduleFilter = EventTypeFilter | UrgencyFilter;

// Toast 通知
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

// 用户信息
export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  email?: string;
  createdAt: number;
}

// 登录/注册表单
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// AI 对话会话
export interface ChatSession {
  id: string;
  title: string;
  messages: AIMessage[];
  updatedAt: number;
}
