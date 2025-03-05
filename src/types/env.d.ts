/**
 * 环境变量类型声明
 */

interface ImportMetaEnv {
  /**
   * DeepSeek API密钥
   */
  readonly VITE_DEEPSEEK_API_KEY: string;
  
  /**
   * DeepSeek API端点
   */
  readonly VITE_DEEPSEEK_API_ENDPOINT: string;
  
  /**
   * 环境模式
   */
  readonly MODE: string;
  
  /**
   * 项目基础路径
   */
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * 全局通用类型定义
 */

/** 消息角色 */
type MessageRole = 'user' | 'assistant' | 'system';

/** 消息对象 */
interface Message {
  role: MessageRole;
  content: string;
  timestamp?: number;
}

/** 会话对象 */
interface Session {
  id: string;
  title: string;
  createTime: number;
  lastActiveTime?: number;
}

/** 用户信息 */
interface UserInfo {
  id: string;
  name: string;
  avatar: string;
} 