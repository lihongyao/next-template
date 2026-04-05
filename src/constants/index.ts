export const ZIndex = {
  // Layout & Navigation
  Footer: 100, // 底部
  Sidebar: 100, // 侧边栏
  FloatingBar: 200, // 吸顶/底导航、悬浮工具栏
  Header: 220, // 头部

  // Overlay Components
  Overlay: 1500, // 遮罩层
  Dialog: 1600, // 对话框 (modal / dialog)
  Sheet: 1700, // 抽屉

  Popover: 1900, // 弹出框
  Tooltip: 2000, // 提示框

  // Global scoped Loading
  GlobalLoading: 2100,

  // Notifications
  Message: 2200, // 消息
  Toast: 2300, // 提示
} as const;

// 当前版本号
export const CURRENT_VERSION = process.env.NEXT_PUBLIC_APP_VERSION!; // 从 next.config.ts 中获取
