import { defineStore } from 'pinia'

/**
 * 消息对象接口
 */
export interface Message {
  content: string
  taskId?: number
  type?: 'text' | 'video'
  videoData?: {
    progress: number
    stage: number
    stageDesc: string[]
    estimatedRemainingTime: number
    videoUrl: string
  }
  role: 'user' | 'assistant'
  timestamp: number
}

export interface VideoMessage {
  taskId: number
  progress: number
  stage: number
  stageDesc: string
  estimatedRemainingTime: number
  videoUrl: string
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string
  name: string
  avatar?: string
}

/**
 * 会话接口
 */
export interface Session {
  id: string
  title: string
  createTime: number
  messages?: Message[] // 添加消息列表，用于存储每个会话的消息
}

// 本地存储键
const STORAGE_KEY = {
  SESSION_LIST: 'chat_session_list',
  CURRENT_SESSION: 'chat_current_session',
  USER_INFO: 'chat_user_info',
}

/**
 * 保存数据到本地存储
 * @param key - 存储键
 * @param data - 要存储的数据
 */
function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('保存数据到本地存储失败:', error)
  }
}

/**
 * 从本地存储加载数据
 * @param key - 存储键
 * @returns 加载的数据
 */
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.error('从本地存储加载数据失败:', error)
    return defaultValue
  }
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
    userInfo: loadFromLocalStorage<UserInfo | null>(STORAGE_KEY.USER_INFO, null),

    /**
     * 是否正在加载
     */
    loading: false,

    /**
     * 当前选择的对话ID
     */
    currentSessionId: loadFromLocalStorage<string | null>(STORAGE_KEY.CURRENT_SESSION, null),

    /**
     * 对话列表
     */
    sessionList: loadFromLocalStorage<Session[]>(STORAGE_KEY.SESSION_LIST, []),
  }),

  getters: {
    /**
     * 获取当前会话
     * @returns 当前会话对象
     */
    currentSession: (state) => {
      if (!state.currentSessionId) return null
      return state.sessionList.find((session) => session.id === state.currentSessionId) || null
    },
  },

  actions: {
    /**
     * 添加聊天消息
     * @param message - 消息对象
     */
    addMessage(message: Message) {
      this.chatMessages.push(message)

      // 同时更新会话中的消息
      if (this.currentSessionId) {
        const sessionIndex = this.sessionList.findIndex((s) => s.id === this.currentSessionId)
        if (sessionIndex !== -1) {
          if (!this.sessionList[sessionIndex].messages) {
            this.sessionList[sessionIndex].messages = []
          }
          this.sessionList[sessionIndex].messages?.push(message)

          // 根据第一条用户消息更新会话标题
          if (message.role === 'user' && this.sessionList[sessionIndex].title === '新对话') {
            this.sessionList[sessionIndex].title =
              message.content.length > 20
                ? message.content.substring(0, 20) + '...'
                : message.content
          }

          // 保存会话列表到本地存储
          this.saveSessionList()
        }
      }
    },

    /**
     * 设置用户信息
     * @param userInfo - 用户信息
     */
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      saveToLocalStorage(STORAGE_KEY.USER_INFO, userInfo)
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
      saveToLocalStorage(STORAGE_KEY.CURRENT_SESSION, sessionId)
    },

    /**
     * 设置会话列表
     * @param list - 会话列表
     */
    setSessionList(list: Session[]) {
      this.sessionList = list
      this.saveSessionList()
    },

    /**
     * 保存会话列表到本地存储
     */
    saveSessionList() {
      saveToLocalStorage(STORAGE_KEY.SESSION_LIST, this.sessionList)
    },

    /**
     * 添加新会话
     * @param session - 会话对象
     */
    addSession(session: Session) {
      this.sessionList.unshift(session)
      this.saveSessionList()
    },

    /**
     * 删除会话
     * @param sessionId - 会话ID
     */
    deleteSession(sessionId: string) {
      const index = this.sessionList.findIndex((s) => s.id === sessionId)
      if (index !== -1) {
        this.sessionList.splice(index, 1)
        this.saveSessionList()

        // 如果删除的是当前会话，则切换到其他会话
        if (this.currentSessionId === sessionId) {
          if (this.sessionList.length > 0) {
            this.switchSession(this.sessionList[0].id)
          } else {
            this.createNewSession()
          }
        }
      }
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
     * @returns 消息ID
     */
    sendMessage(message: Omit<Message, 'timestamp'>) {
      const timestamp = Date.now()
      const fullMessage: Message = {
        ...message,
        timestamp,
      }

      this.addMessage(fullMessage)

      // 返回消息ID（使用时间戳作为ID）
      return timestamp
    },

    /**
     * 更新现有消息
     * @param messageId - 消息ID（时间戳）
     * @param updatedMessage - 更新后的消息内容
     * @returns 是否更新成功
     */
    updateMessage(messageId: number, updatedMessage: VideoMessage) {
      // 查找消息在chatMessages中的索引
      const messageIndex = this.chatMessages.findIndex((msg) => msg.timestamp === messageId)

      if (messageIndex === -1) {
        console.log('当前会话未找到消息，尝试在所有会话历史中查找:', messageId)

        // 在所有会话中查找该消息
        let foundInHistory = false
        let sessionWithMessage: { sessionIndex: number; messageIndex: number } | null = null

        // 遍历所有会话
        for (let i = 0; i < this.sessionList.length; i++) {
          const session = this.sessionList[i]
          if (session.messages && session.messages.length > 0) {
            // 在会话的消息列表中查找
            const msgIndex = session.messages.findIndex((msg) => msg.timestamp === messageId)
            if (msgIndex !== -1) {
              foundInHistory = true
              sessionWithMessage = { sessionIndex: i, messageIndex: msgIndex }
              break
            }
          }
        }

        if (foundInHistory && sessionWithMessage) {
          console.log('在会话历史中找到消息，正在更新')

          const { sessionIndex, messageIndex } = sessionWithMessage

          // 构建新的消息数据
          const newData: Message = {
            content: '',
            role: 'assistant',
            taskId: updatedMessage.taskId,
            type: 'video',
            videoData: {
              progress: updatedMessage?.progress,
              stage: updatedMessage?.stage,
              stageDesc: this.sessionList[sessionIndex].messages?.[messageIndex].videoData
                ?.stageDesc
                ? this.sessionList[sessionIndex].messages?.[
                    messageIndex
                  ].videoData?.stageDesc.concat(updatedMessage.stageDesc)
                : [updatedMessage.stageDesc],
              estimatedRemainingTime: updatedMessage?.estimatedRemainingTime,
              videoUrl: updatedMessage?.videoUrl,
            },
            timestamp: messageId,
          }

          // 更新历史会话中的消息
          if (this.sessionList[sessionIndex].messages) {
            this.sessionList[sessionIndex].messages[messageIndex] = newData

            // 如果更新的是当前会话，同时更新 chatMessages
            if (this.sessionList[sessionIndex].id === this.currentSessionId) {
              const currentMsgIndex = this.chatMessages.findIndex(
                (msg) => msg.timestamp === messageId,
              )
              if (currentMsgIndex !== -1) {
                this.chatMessages[currentMsgIndex] = newData
              }
            }

            // 保存会话列表到本地存储
            this.saveSessionList()
            return true
          }
        } else {
          console.error('在所有会话历史中均未找到要更新的消息:', messageId)
          return false
        }

        return false
      }

      const newData: Message = {
        content: '',
        role: 'assistant',
        taskId: updatedMessage.taskId,
        type: 'video',
        videoData: {
          progress: updatedMessage?.progress,
          stage: updatedMessage?.stage,
          stageDesc: this.chatMessages[messageIndex].videoData?.stageDesc
            ? this.chatMessages[messageIndex].videoData?.stageDesc.concat(updatedMessage.stageDesc)
            : [updatedMessage.stageDesc],
          estimatedRemainingTime: updatedMessage?.estimatedRemainingTime,
          videoUrl: updatedMessage?.videoUrl,
        },
        timestamp: messageId,
      }
      // 更新消息，保留原始时间戳
      this.chatMessages[messageIndex] = newData

      // 同时更新会话中的消息
      if (this.currentSessionId) {
        const sessionIndex = this.sessionList.findIndex((s) => s.id === this.currentSessionId)
        if (sessionIndex !== -1 && this.sessionList[sessionIndex].messages) {
          const sessionMsgIndex = this.sessionList[sessionIndex].messages?.findIndex(
            (msg) => msg.timestamp === messageId,
          )

          if (sessionMsgIndex !== -1 && sessionMsgIndex !== undefined) {
            if (this.sessionList[sessionIndex].messages) {
              this.sessionList[sessionIndex].messages[sessionMsgIndex] = newData
            }

            // 保存会话列表到本地存储
            this.saveSessionList()
          }
        }
      }

      return true
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
        createTime: new Date().getTime(),
        messages: [],
      }

      this.addSession(newSession)
      this.setCurrentSession(sessionId)
      this.clearMessages()

      // 添加欢迎消息
      this.sendMessage({
        content: '喵~ 我是问小猫，您的AI助手！有什么我可以帮您的喵？',
        role: 'assistant',
      })

      return sessionId
    },

    /**
     * 切换会话
     * @param sessionId - 会话ID
     */
    switchSession(sessionId: string, isInit: boolean = false) {
      // 保存当前会话消息
      if (this.currentSessionId) {
        const oldSessionIndex = this.sessionList.findIndex((s) => s.id === this.currentSessionId)
        if (oldSessionIndex !== -1 && !isInit) {
          this.sessionList[oldSessionIndex].messages = [...this.chatMessages]
          this.saveSessionList()
        }
      }

      this.setCurrentSession(sessionId)

      // 加载会话消息
      const session = this.sessionList.find((s) => s.id === sessionId)
      if (session && session.messages) {
        console.log('加载会话消息', sessionId)
        this.chatMessages = [...session.messages]
      } else {
        this.clearMessages()
      }
    },

    /**
     * 从本地存储初始化数据
     */
    initFromLocalStorage() {
      // 如果没有当前会话或当前会话不存在，创建新会话
      if (!this.currentSessionId || !this.sessionList.find((s) => s.id === this.currentSessionId)) {
        console.log('没有当前会话或当前会话不存在，创建新会话')
        if (this.sessionList.length > 0) {
          this.switchSession(this.sessionList[0].id)
        } else {
          this.createNewSession()
        }
      } else {
        console.log('有当前会话，加载当前会话的消息')
        // 加载当前会话的消息
        this.switchSession(this.currentSessionId, true)
      }
    },
  },
})
