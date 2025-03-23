// 用户相关
export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  isVip: boolean;
  balance?: number;
  createdAt?: string;
  lastLoginAt?: string;
}

// 聊天相关
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  status?: "sending" | "success" | "error";
}

// 创作相关
export interface CreationItem {
  id: string;
  type: "image" | "video" | "writing";
  title: string;
  desc?: string;
  coverUrl?: string;
  creator: {
    name: string;
    avatar: string;
  };
  usage: string;
  createdAt: string;
  status?: "processing" | "completed" | "failed";
}

// 应用相关
export interface AppItem {
  id: string;
  name: string;
  icon: string;
  tag: string;
  desc: string;
  creator: string;
  usage: string;
  path: string;
  iconBg: string;
  iconColor: string;
  category: string[];
}

// 搜索相关
export interface SearchResult {
  id: string;
  type: "news" | "video" | "image" | "article";
  source: string;
  time: string;
  title: string;
  desc: string;
  imageUrl?: string;
  stats: {
    likes: number;
    comments: number;
    shares?: number;
  };
}

export interface HotSearch {
  id: string;
  rank: number;
  title: string;
  score: number;
  trend?: "up" | "down" | "stable";
}

// API 响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
