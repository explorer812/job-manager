# 智能求职信息管理 Web 应用

一个基于 React + TypeScript + Tailwind CSS + Framer Motion 开发的苹果风格求职信息管理应用。

## 功能特性

### 1. 收藏 Tab (Bookmark)
- **文件夹系统**: 支持创建、管理多个文件夹，每个文件夹可选择马卡龙配色
- **职位卡片**: 玻璃拟态设计，展示公司、岗位、薪资、地点等信息
- **倒计时环**: SVG 环形进度条，根据截止日期显示不同颜色（>7天薄荷绿、3-7天柔雾粉、<3天珊瑚红）
- **详情抽屉**: 右侧滑入，支持编辑职位信息、AI 提炼内容展示、求职建议折叠面板

### 2. 问 AI Tab (AI Parser)
- **聊天界面**: 类微信聊天布局，支持文本和图片输入
- **AI 解析**: 模拟 AI 解析职位描述，提取关键信息
- **结构化展示**: 解析结果以卡片形式展示，包含公司和职位信息
- **一键收藏**: 解析完成后可直接选择文件夹添加到收藏

### 3. 日程 Tab (Schedule)
- **时间轴视图**: 按截止日期排序，垂直时间轴设计
- **紧急度筛选**: 支持全部、即将截止(<3天)、本周、已逾期筛选
- **进度可视化**: 投递进度条，直观展示求职状态
- **快速操作**: 卡片上直接切换状态，实时同步到收藏 Tab
- **归档功能**: 左滑/点击归档，支持撤销操作

## 技术栈

- **框架**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **状态管理**: Zustand (持久化存储)
- **构建工具**: Vite

## 设计系统

### 配色方案 (马卡龙风格)
```css
--bg-primary: #F5F7FA;        /* 主背景 - 极浅灰蓝 */
--bg-card: rgba(255,255,255,0.85); /* 卡片背景 - 毛玻璃白 */
--accent-mint: #B5EAD7;       /* 薄荷绿 */
--accent-peach: #FFDAC1;      /* 柔雾粉 */
--accent-blue: #C7CEEA;       /* 婴儿蓝 */
--accent-lavender: #E2F0CB;   /* 薰衣草紫 */
--accent-coral: #FFB7B2;      /* 珊瑚粉 */
--text-primary: #2D3748;      /* 深灰文字 */
--text-secondary: #718096;    /* 次要文字 */
```

### 动画规范
- 页面切换: AnimatePresence + 方向感知滑动
- 卡片悬停: translateY(-4px) + shadow-xl
- 按钮点击: scale(0.95) 反馈
- Modal/Drawer: Spring 动画 (stiffness: 300, damping: 30)
- 倒计时脉冲: <3天显示脉冲动画

## 项目结构

```
src/
├── components/
│   ├── tabs/           # 三个 Tab 页面组件
│   │   ├── BookmarkTab.tsx
│   │   ├── AITab.tsx
│   │   ├── ScheduleTab.tsx
│   │   ├── JobCard.tsx
│   │   ├── JobDetailDrawer.tsx
│   │   └── PathPickerModal.tsx
│   ├── ui/             # 可复用 UI 组件
│   │   ├── TabBar.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── CountdownRing.tsx
│   │   ├── StatusBadge.tsx
│   │   └── CompanyTag.tsx
│   └── PageTransition.tsx
├── store/
│   └── useStore.ts     # Zustand 状态管理
├── types/
│   └── index.ts        # TypeScript 类型定义
├── utils/
│   └── mockData.ts     # Mock 数据和工具函数
├── App.tsx
├── main.tsx
└── index.css
```

## 安装和运行

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 响应式设计

- **Mobile**: < 768px (单列，底部 Tab Bar)
- **Tablet**: 768px-1024px (2列 Grid)
- **Desktop**: > 1024px (3列 Grid，左侧 Sidebar)

## 数据持久化

使用 Zustand 的 persist 中间件，数据自动保存到 localStorage，刷新页面后数据不丢失。

## 初始 Mock 数据

包含 3 个示例文件夹和 7 个示例职位卡片，涵盖互联网大厂、外企、国企等不同类型公司。

## 许可证

MIT
