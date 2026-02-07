import type { JobCard, Folder, AIMessage } from '../types';

export const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    name: '互联网大厂',
    color: 'blue',
    jobCount: 3,
  },
  {
    id: 'folder-2',
    name: '外企',
    color: 'mint',
    jobCount: 2,
  },
  {
    id: 'folder-3',
    name: '国企',
    color: 'peach',
    jobCount: 2,
  },
];

export const mockJobs: JobCard[] = [
  {
    id: 'job-1',
    folderId: 'folder-1',
    company: {
      name: '字节跳动',
      type: '互联网',
    },
    position: {
      title: '高级前端工程师',
      salary: '35k-50k',
      location: '北京·海淀',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'inProgress',
      education: '本科及以上',
      experience: '5年以上',
    },
    aiAnalysis: {
      responsibilities: [
        '负责抖音电商核心页面开发与性能优化',
        '参与前端架构设计，推动工程化建设',
        '指导初中级工程师，进行代码评审',
        '与产品、设计紧密配合，保证交付质量',
      ],
      requirements: [
        '5年以上前端开发经验，精通 React/Vue',
        '熟悉 Node.js，有全栈开发经验优先',
        '具备大型项目性能优化经验',
        '计算机相关专业本科及以上学历',
      ],
      suggestions: {
        resume: '突出你在性能优化方面的具体数据，如首屏加载时间减少X%、转化率提升Y%等量化指标。强调React生态深度使用经验。',
        interview: '重点准备浏览器渲染原理、React Fiber架构、微前端方案。手写Promise、debounce/throttle是必考。',
        negotiation: '字节总包通常包含基础工资+绩效+期权，期权部分可以谈判。年终奖通常3-6个月。',
      },
    },
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    applyLink: 'https://jobs.bytedance.com',
    hasReminder: true,
  },
  {
    id: 'job-2',
    folderId: 'folder-1',
    company: {
      name: '阿里巴巴',
      type: '互联网',
    },
    position: {
      title: '前端开发专家',
      salary: '40k-60k·16薪',
      location: '杭州·余杭',
      deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'new',
      education: '本科及以上',
      experience: '5年以上',
    },
    aiAnalysis: {
      responsibilities: [
        '负责淘宝核心交易链路前端开发',
        '主导低代码平台建设',
        '前端性能监控与稳定性保障',
      ],
      requirements: [
        '精通 React，熟悉底层原理',
        '有大型电商项目经验',
        '熟悉 Webpack/Vite 等构建工具',
        '良好的跨团队协作能力',
      ],
      suggestions: {
        resume: '强调电商相关经验，特别是交易、支付、订单等核心链路。阿里重视技术影响力，可提及开源贡献或技术博客。',
        interview: '阿里前端面试偏重工程化、架构设计。准备P7级别的系统设计题，如设计一个组件库或搭建平台。',
        negotiation: '阿里职级体系明确，P7对应专家级别。总包构成：基本工资+股票+年终奖，年终奖通常4个月。',
      },
    },
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    applyLink: 'https://talent.alibaba.com',
    hasReminder: true,
  },
  {
    id: 'job-3',
    folderId: 'folder-1',
    company: {
      name: '腾讯',
      type: '互联网',
    },
    position: {
      title: 'Web前端开发',
      salary: '30k-45k',
      location: '深圳·南山',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'new',
      education: '本科及以上',
      experience: '3年以上',
    },
    aiAnalysis: {
      responsibilities: [
        '负责微信生态相关H5页面开发',
        '小程序性能优化与体验提升',
        '参与前端基础设施建设',
      ],
      requirements: [
        '3年以上前端经验，熟悉微信小程序',
        '扎实的JavaScript/CSS基础',
        '有移动端H5开发经验',
        '了解HTTP协议和浏览器原理',
      ],
      suggestions: {
        resume: '突出微信生态相关经验，包括小程序、公众号H5。腾讯重视产品思维，可展示对产品细节的关注。',
        interview: '腾讯面试注重基础，CSS布局、JS闭包/原型链、浏览器缓存策略是重点。',
        negotiation: '腾讯薪资结构：基础工资+绩效+股票+签字费。不同BG薪资差异较大，WXG、IEG通常较高。',
      },
    },
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    applyLink: 'https://careers.tencent.com',
    hasReminder: true,
  },
  {
    id: 'job-4',
    folderId: 'folder-2',
    company: {
      name: 'Microsoft',
      type: '外企',
    },
    position: {
      title: 'Senior Frontend Engineer',
      salary: '50k-70k·13薪',
      location: '北京·中关村',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'new',
      education: '本科及以上',
      experience: '5年以上',
    },
    aiAnalysis: {
      responsibilities: [
        'Build responsive web applications using React and TypeScript',
        'Collaborate with PM and designers to deliver high-quality products',
        'Mentor junior developers and conduct code reviews',
        'Drive frontend best practices and engineering excellence',
      ],
      requirements: [
        '5+ years of frontend development experience',
        'Strong proficiency in React, TypeScript, and modern CSS',
        'Experience with cloud services (Azure preferred)',
        'Excellent English communication skills',
      ],
      suggestions: {
        resume: 'Use STAR format to describe projects. Highlight cross-cultural collaboration experience. Include GitHub/StackOverflow profiles.',
        interview: 'Microsoft interviews focus on problem-solving and system design. Prepare behavioral questions using STAR method.',
        negotiation: 'Microsoft offers competitive base salary with good WLB. Benefits include stock grants, bonus, and comprehensive insurance.',
      },
    },
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    applyLink: 'https://careers.microsoft.com',
    hasReminder: true,
  },
  {
    id: 'job-5',
    folderId: 'folder-2',
    company: {
      name: 'Shopee',
      type: '外企',
    },
    position: {
      title: 'Frontend Engineer',
      salary: '35k-50k·15薪',
      location: '深圳·科技园',
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'new',
      education: '本科及以上',
      experience: '3年以上',
    },
    aiAnalysis: {
      responsibilities: [
        'Develop e-commerce platform features',
        'Optimize web performance and user experience',
        'Work closely with Singapore and regional teams',
      ],
      requirements: [
        '3+ years frontend experience',
        'Proficient in React and state management',
        'Experience with large-scale web applications',
        'Willing to travel to Singapore occasionally',
      ],
      suggestions: {
        resume: 'Highlight e-commerce domain knowledge. Shopee values candidates with regional/SEA market understanding.',
        interview: 'Technical rounds include coding (algorithm + frontend), system design, and behavioral. Culture fit is important.',
        negotiation: 'Shopee offers competitive packages with stock options. Consider the travel requirements and work-life balance.',
      },
    },
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    applyLink: 'https://careers.shopee.sg',
    hasReminder: true,
  },
  {
    id: 'job-6',
    folderId: 'folder-3',
    company: {
      name: '中国银行',
      type: '国企',
    },
    position: {
      title: '前端开发工程师',
      salary: '25k-35k',
      location: '北京·西城区',
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'new',
      education: '本科及以上',
      experience: '3年以上',
    },
    aiAnalysis: {
      responsibilities: [
        '负责手机银行APP内H5页面开发',
        '参与金融科技前端技术选型',
        '保障系统安全与合规要求',
      ],
      requirements: [
        '3年以上前端开发经验',
        '熟悉Vue或React框架',
        '了解金融安全相关知识',
        '党员优先，政治素质过硬',
      ],
      suggestions: {
        resume: '强调稳定性和长期发展意愿。国企重视政治面貌，党员务必注明。突出安全合规意识。',
        interview: '技术面试相对基础，但可能有政治素养考察。准备对金融科技行业的理解。',
        negotiation: '国企薪资相对透明，涨幅有限但稳定性高。关注福利：六险二金、补充医疗、食堂等。',
      },
    },
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    applyLink: 'https://www.boc.cn',
    hasReminder: true,
  },
  {
    id: 'job-7',
    folderId: 'folder-3',
    company: {
      name: '中国移动',
      type: '国企',
    },
    position: {
      title: 'Web前端开发',
      salary: '20k-30k',
      location: '北京·东城区',
      status: 'rejected',
      education: '本科及以上',
      experience: '2年以上',
    },
    aiAnalysis: {
      responsibilities: [
        '负责营业厅系统前端开发',
        '移动端H5页面适配与优化',
      ],
      requirements: [
        '2年以上前端经验',
        '熟悉HTML5/CSS3/JavaScript',
        '有运营商行业经验优先',
      ],
      suggestions: {
        resume: '突出toB系统开发经验。国企偏好稳重、踏实的候选人。',
        interview: '面试流程较长，需耐心等待。技术问题偏向实际项目经验。',
        negotiation: '国企薪资结构固定，可谈判空间小。',
      },
    },
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    applyLink: 'https://www.10086.cn',
    hasReminder: false,
  },
];

export const mockAIMessages: AIMessage[] = [
  {
    id: 'msg-1',
    type: 'user',
    content: '帮我分析一下这个职位：美团外卖事业部招高级前端，要求5年经验，负责外卖商家端核心页面，薪资30-45k',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'msg-2',
    type: 'ai',
    content: '已为您分析该职位信息',
    stage: 'complete',
    parsedJob: {
      company: {
        name: '美团',
        type: '互联网',
      },
      position: {
        title: '高级前端工程师',
        salary: '30k-45k',
        location: '北京',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'new',
        education: '本科及以上',
        experience: '5年以上',
      },
      aiAnalysis: {
        responsibilities: [
          '负责外卖商家端核心页面开发与维护',
          '参与前端技术方案设计',
          '性能优化与用户体验提升',
        ],
        requirements: [
          '5年以上前端开发经验',
          '精通React/Vue等主流框架',
          '有大型toB项目经验',
        ],
        suggestions: {
          resume: '突出toB业务经验，特别是商家端、后台管理系统。美团重视数据驱动，可展示AB测试、数据埋点经验。',
          interview: '美团面试注重算法和系统设计，准备中等难度LeetCode题。',
          negotiation: '美团薪资结构：基本工资+绩效+股票，年终奖通常3-4个月。',
        },
      },
    },
    timestamp: Date.now() - 3500000,
  },
];

// 颜色映射 - 柔和配色
export const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  mint: {
    bg: 'bg-[#B8E6D3]',
    text: 'text-[#1A1A2E]',
    border: 'border-[#B8E6D3]',
    light: 'bg-[#B8E6D3]/20',
  },
  peach: {
    bg: 'bg-[#FFD4B3]',
    text: 'text-[#1A1A2E]',
    border: 'border-[#FFD4B3]',
    light: 'bg-[#FFD4B3]/20',
  },
  blue: {
    bg: 'bg-[#E6E6FA]',
    text: 'text-[#1A1A2E]',
    border: 'border-[#E6E6FA]',
    light: 'bg-[#E6E6FA]/30',
  },
  lavender: {
    bg: 'bg-[#FFD1DC]',
    text: 'text-[#1A1A2E]',
    border: 'border-[#FFD1DC]',
    light: 'bg-[#FFD1DC]/20',
  },
  coral: {
    bg: 'bg-[#FFB6A3]',
    text: 'text-[#1A1A2E]',
    border: 'border-[#FFB6A3]',
    light: 'bg-[#FFB6A3]/20',
  },
};

// 状态映射 - 柔和配色
// 状态映射 - 奶油风配色
export const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '新收藏', color: 'text-[#2D2D2D]', bg: 'bg-[#F9F7F2]' },
  inProgress: { label: '进行中', color: 'text-[#2D2D2D]', bg: 'bg-[#EAF4F4]' },
  offer: { label: '已offer', color: 'text-[#2D2D2D]', bg: 'bg-[#FFEDD8]' },
  rejected: { label: '已挂', color: 'text-[#8C837A]', bg: 'bg-[#EFECE6]' },
};

// 提醒事件映射 - 统一深色背景
export const reminderEventMap: Record<string, { label: string; color: string; bg: string }> = {
  toApply: { label: '待投递', color: 'text-white', bg: 'bg-[#2D2D2D]' },
  writtenTest: { label: '待笔试', color: 'text-white', bg: 'bg-[#2D2D2D]' },
  interview: { label: '待面试', color: 'text-white', bg: 'bg-[#2D2D2D]' },
  toOffer: { label: '待接受', color: 'text-white', bg: 'bg-[#2D2D2D]' },
};

// 公司类型映射 - 奶油风配色
export const companyTypeMap: Record<string, { label: string; color: string }> = {
  '互联网': { label: '互联网', color: 'bg-[#E2EAFC] text-[#2D2D2D]' },
  '国企': { label: '国企', color: 'bg-[#FDE2E4] text-[#2D2D2D]' },
  '外企': { label: '外企', color: 'bg-[#FFEDD8] text-[#2D2D2D]' },
  '金融': { label: '金融', color: 'bg-[#EAF4F4] text-[#2D2D2D]' },
  '其他': { label: '其他', color: 'bg-[#EFECE6] text-[#8C837A]' },
};
