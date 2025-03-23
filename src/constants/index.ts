// AI 模型相关
export const AI_MODELS = {
  HUNYUAN: "Hunyuan",
  DEEPSEEK: "Deepseek",
  QWEN: "Qwen",
} as const;

export const SYSTEM_PROMPTS = {
  Hunyuan:
    "你是元宝AI助手，由腾讯公司开发的混元大模型。请用中文回答问题，保持友好和专业的态度。",
  Deepseek:
    "你是元宝AI助手，使用DeepSeek大模型。请用中文回答问题，保持友好和专业的态度。",
  Qwen: "你是元宝AI助手，使用通义千问大模型。请用中文回答问题，保持友好和专业的态度。",
} as const;

// 创作相关
export const CREATION_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
  WRITING: "writing",
} as const;

export const CREATION_TABS = [
  { key: CREATION_TYPES.IMAGE, label: "AI画图" },
  { key: CREATION_TYPES.VIDEO, label: "AI视频" },
  { key: CREATION_TYPES.WRITING, label: "AI写作" },
] as const;

// 应用分类
export const APP_CATEGORIES = [
  { key: "used", label: "用过" },
  { key: "tools", label: "工具提效" },
  { key: "entertainment", label: "娱乐休闲" },
  { key: "chat", label: "角色闲聊" },
] as const;

// 搜索相关
export const SEARCH_TABS = [
  { key: "all", label: "综合" },
  { key: "news", label: "资讯" },
  { key: "video", label: "视频" },
  { key: "image", label: "图片" },
  { key: "account", label: "公众号" },
  { key: "miniapp", label: "小程序" },
  { key: "knowledge", label: "知识" },
] as const;

// 错误信息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "网络连接失败，请检查网络设置",
  SERVER_ERROR: "服务器错误，请稍后重试",
  UNAUTHORIZED: "登录已过期，请重新登录",
  FORBIDDEN: "没有权限访问该功能",
  NOT_VIP: "该功能仅对VIP会员开放",
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER_INFO: "userInfo",
  CHAT_HISTORY: "chatHistory",
  SETTINGS: "settings",
} as const;
