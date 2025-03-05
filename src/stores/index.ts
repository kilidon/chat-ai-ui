import { defineStore } from 'pinia'

/**
 * 消息对象接口
 */
export interface Message {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
}

/**
 * 会话接口
 */
export interface Session {
  id: string;
  title: string;
  createTime: number;
}

/**
 * 聊天状态存储
 */
export const useChatStore = defineStore('chat', {
  state: () => ({
    /**
     * 聊天消息列表
     */
    chatMessages: [] as Message[],
    
    /**
     * 当前用户信息
     */
    userInfo: null as UserInfo | null,
    
    /**
     * 是否正在加载
     */
    loading: false,
    
    /**
     * 当前选择的对话ID
     */
    currentSessionId: null as string | null,
    
    /**
     * 对话列表
     */
    sessionList: [] as Session[]
  }),
  
  getters: {
    /**
     * 获取当前会话
     * @returns 当前会话对象
     */
    currentSession: (state) => {
      if (!state.currentSessionId) return null
      return state.sessionList.find(session => session.id === state.currentSessionId) || null
    }
  },
  
  actions: {
    /**
     * 添加聊天消息
     * @param message - 消息对象
     */
    addMessage(message: Message) {
      this.chatMessages.push(message)
    },
    
    /**
     * 设置用户信息
     * @param userInfo - 用户信息
     */
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
    
    /**
     * 设置加载状态
     * @param status - 加载状态
     */
    setLoading(status: boolean) {
      this.loading = status
    },
    
    /**
     * 设置当前会话ID
     * @param sessionId - 会话ID
     */
    setCurrentSession(sessionId: string) {
      this.currentSessionId = sessionId
    },
    
    /**
     * 设置会话列表
     * @param list - 会话列表
     */
    setSessionList(list: Session[]) {
      this.sessionList = list
    },
    
    /**
     * 添加新会话
     * @param session - 会话对象
     */
    addSession(session: Session) {
      this.sessionList.unshift(session)
    },
    
    /**
     * 清空当前会话消息
     */
    clearMessages() {
      this.chatMessages = []
    },
    
    /**
     * 发送消息
     * @param message - 消息对象
     */
    sendMessage(message: Partial<Message>) {
      this.addMessage({
        ...message,
        timestamp: new Date().getTime()
      } as Message)
      
      // 这里可以添加与后端API通信的逻辑
    },
    
    /**
     * 创建新会话
     * @returns 新会话ID
     */
    createNewSession() {
      const sessionId = 'session_' + new Date().getTime()
      const newSession: Session = {
        id: sessionId,
        title: '新对话',
        createTime: new Date().getTime()
      }
      
      this.addSession(newSession)
      this.setCurrentSession(sessionId)
      this.clearMessages()
      
      // 添加欢迎消息
      this.sendMessage({
        content: '喵~ 我是问小猫，您的AI助手！有什么我可以帮您的喵？',
        role: 'assistant'
      })
      
      return sessionId
    },
    
    /**
     * 切换会话
     * @param sessionId - 会话ID
     */
    switchSession(sessionId: string) {
      this.setCurrentSession(sessionId)
      this.clearMessages()
      
      // 这里可以添加加载特定会话消息的逻辑
    }
  }
}) 