/**
 * WebSocket服务
 * 处理与视频生成API的WebSocket通信
 */

import { ref } from 'vue'

// 用户唯一码的存储键
const USER_CODE_KEY = 'video_generation_user_code'

// WebSocket状态
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

// 消息类型
export enum MessageType {
  CONNECTED = 'connected',
  PONG = 'pong',
  MESSAGE = 'message',
}

// 消息接口
export interface WebSocketMessage {
  id: string
  type: MessageType
  content: string
  timestamp: number
  extra?: Record<string, unknown>
}

// 视频进度消息类型
interface VideoProgressMessage {
  type: string
  taskId: number
  progress: number
  stage: number
  stageDesc: string
  estimatedRemainingTime?: number
}

// 视频完成消息类型
interface VideoCompleteMessage {
  type: string
  taskId: number
  videoUrl: string
  thumbnailUrl?: string
}

// WebSocket单例
class WebSocketService {
  private ws: WebSocket | null = null
  private userCode: string = ''
  private baseUrl: string = import.meta.env.VITE_WEBSOCKET_API_URL
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectTimeout: number = 3000
  private reconnectTimer: number | null = null
  private pingInterval: number | null = null

  public status = ref<WebSocketStatus>(WebSocketStatus.DISCONNECTED)
  public messages = ref<WebSocketMessage[]>([])
  public errorMessage = ref<string>('')

  /**
   * 生成或获取用户唯一码
   */
  public getUserCode(): string {
    // 生成新的唯一码 (时间戳 + 随机字符串)
    const code = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    localStorage.setItem(USER_CODE_KEY, code)
    this.userCode = code
    return code
  }

  /**
   * 刷新用户唯一码
   */
  public refreshUserCode(): string {
    // 生成新的唯一码
    const code = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    localStorage.setItem(USER_CODE_KEY, code)
    this.userCode = code
    return code
  }

  /**
   * 连接WebSocket
   */
  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // 每次连接时生成新的用户码
      this.getUserCode()

      // 关闭现有连接
      this.disconnect()

      // 更新状态
      this.status.value = WebSocketStatus.CONNECTING

      try {
        // 创建WebSocket连接
        const url = `${this.baseUrl}?code=${this.userCode}`
        this.ws = new WebSocket(url)

        // 设置事件处理器
        this.ws.onopen = () => {
          console.log('WebSocket连接已建立')
          this.status.value = WebSocketStatus.CONNECTED
          this.reconnectAttempts = 0
          this.startPingInterval()

          // 添加系统消息
          this.addSystemMessage('连接已建立，可以开始对话')

          resolve(true)
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket连接已关闭', event)
          this.status.value = WebSocketStatus.DISCONNECTED
          this.stopPingInterval()

          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          } else {
            this.addSystemMessage('连接已断开，请刷新页面重试')
          }

          resolve(false)
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket连接错误', error)
          this.status.value = WebSocketStatus.ERROR
          this.errorMessage.value = '连接服务器时发生错误'

          // 添加错误消息
          this.addErrorMessage('连接服务器时发生错误，请检查网络或稍后重试')

          reject(error)
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }
      } catch (error) {
        console.error('创建WebSocket连接时发生错误', error)
        this.status.value = WebSocketStatus.ERROR
        this.errorMessage.value = '创建连接时发生错误'

        // 添加错误消息
        this.addErrorMessage('创建连接时发生错误，请检查网络或稍后重试')

        reject(error)
      }
    })
  }

  /**
   * 断开WebSocket连接
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.status.value = WebSocketStatus.DISCONNECTED
      this.stopPingInterval()

      if (this.reconnectTimer) {
        window.clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    }
  }

  /**
   * 发送消息到服务器
   */
  public sendMessage(content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket未连接，无法发送消息')
      this.addErrorMessage('未连接到服务器，请检查网络连接')
      return false
    }

    try {
      // 构建消息对象
      const message = {
        content,
        timestamp: Date.now(),
      }

      // 发送消息
      this.ws.send(JSON.stringify(message))

      // 添加到本地消息列表（作为用户消息）
      this.addUserMessage(content)

      return true
    } catch (error) {
      console.error('发送消息时发生错误', error)
      this.addErrorMessage('发送消息失败，请重试')
      return false
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string): void {
    try {
      // 解析消息
      const message = JSON.parse(data)
      // console.log('WebSocket收到原始消息:', message)

      // 检查是否为ping消息，如果是则回应pong但不添加到消息列表
      if (message.type === 'ping') {
        console.log('收到ping消息，发送pong响应')
        this.sendPong()
        return
      }

      // 检查是否为视频进度或视频完成消息 - 通过progress和taskId字段判断
      if (message.progress !== undefined && message.taskId !== undefined) {
        // console.log('检测到视频相关消息:', message)
        // 这是视频进度消息，直接转发到消息列表
        const progressMessage: WebSocketMessage = {
          id: `progress_${message.taskId || Date.now()}`,
          type: MessageType.MESSAGE, // 使用MESSAGE枚举
          content: JSON.stringify(message), // 直接转发完整消息内容
          timestamp: Date.now(),
          extra: { isVideoProgress: true },
        }
        // console.log('添加视频进度消息到队列:', message.taskId, message.progress)
        this.messages.value.push(progressMessage)
        return
      }

      // 处理一般消息
      // console.log('处理一般消息:', message)
      return
      // // 生成消息ID和时间戳（如果没有的话）
      // const id = message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      // const timestamp = message.timestamp || Date.now()
      // const type =
      //   message.type === 'connected'
      //     ? MessageType.CONNECTED
      //     : message.type === 'pong'
      //       ? MessageType.PONG
      //       : MessageType.MESSAGE // 使用枚举值

      // // 创建标准化的消息对象
      // const standardizedMessage: WebSocketMessage = {
      //   id,
      //   type,
      //   content: message.content || JSON.stringify(message), // 如果没有content字段，则使用整个消息
      //   timestamp,
      //   extra: message.extra || {},
      // }

      // // 添加到消息列表
      // console.log('添加一般消息到队列')
      // this.messages.value.push(standardizedMessage)

      // // 如果是错误消息，更新错误状态
      // if (message.type === 'error' || message.errorMessage) {
      //   this.errorMessage.value = message.content || message.errorMessage || '未知错误'
      // }
    } catch (error) {
      console.error('处理WebSocket消息时出错:', error, data)
      try {
        // 尝试作为纯文本消息处理
        const textMessage: WebSocketMessage = {
          id: `txt_${Date.now()}`,
          type: MessageType.MESSAGE, // 使用MESSAGE枚举
          content: data, // 直接使用原始数据
          timestamp: Date.now(),
        }
        this.messages.value.push(textMessage)
      } catch (secondError) {
        console.error('处理为纯文本消息也失败:', secondError)
      }
    }
  }

  /**
   * 处理视频生成进度消息
   */
  private handleVideoProgressMessage(message: VideoProgressMessage): void {
    console.log('收到视频进度消息:', message)

    const progressMessage: WebSocketMessage = {
      id: `progress_${message.taskId || Date.now()}`,
      type: MessageType.PONG, // 使用PONG代替SYSTEM
      content: JSON.stringify(message), // 直接存储完整的进度信息
      timestamp: Date.now(),
      extra: {
        isVideoProgress: true,
        taskId: message.taskId,
        progress: message.progress,
        stage: message.stage,
        stageDesc: message.stageDesc,
      },
    }

    this.messages.value.push(progressMessage)
  }

  /**
   * 处理视频生成完成消息
   */
  private handleVideoCompleteMessage(message: VideoCompleteMessage): void {
    console.log('收到视频完成消息:', message)

    const completeMessage: WebSocketMessage = {
      id: `video_${message.taskId || Date.now()}`,
      type: MessageType.CONNECTED, // 使用CONNECTED代替VIDEO
      content: JSON.stringify(message), // 直接存储完整的完成信息
      timestamp: Date.now(),
      extra: {
        isVideoComplete: true,
        taskId: message.taskId,
        videoUrl: message.videoUrl,
        thumbnailUrl: message.thumbnailUrl,
      },
    }

    this.messages.value.push(completeMessage)
  }

  /**
   * 添加用户消息到列表
   */
  private addUserMessage(content: string): void {
    const message: WebSocketMessage = {
      id: `user_${Date.now()}`,
      type: MessageType.PONG, // 使用PONG代替TEXT
      content,
      timestamp: Date.now(),
    }

    this.messages.value.push(message)
  }

  /**
   * 添加系统消息到列表
   */
  private addSystemMessage(content: string): void {
    const message: WebSocketMessage = {
      id: `system_${Date.now()}`,
      type: MessageType.PONG, // 使用PONG代替SYSTEM
      content,
      timestamp: Date.now(),
    }

    this.messages.value.push(message)
  }

  /**
   * 添加错误消息到列表
   */
  private addErrorMessage(content: string): void {
    const message: WebSocketMessage = {
      id: `error_${Date.now()}`,
      type: MessageType.PONG, // 使用PONG代替ERROR
      content,
      timestamp: Date.now(),
      extra: {
        isError: true,
      },
    }

    this.messages.value.push(message)
    this.errorMessage.value = content
  }

  /**
   * 发送pong响应
   */
  private sendPong(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'pong' }))
    }
  }

  /**
   * 开始定时ping
   */
  private startPingInterval(): void {
    this.stopPingInterval()

    // 每30秒发送一次ping
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  /**
   * 停止定时ping
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      window.clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++

    // 指数退避重连
    const delay = this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1)

    this.addSystemMessage(
      `连接已断开，${Math.round(delay / 1000)}秒后重试 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    )

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch((error) => {
        console.error('重连失败', error)
      })
    }, delay)
  }

  /**
   * 清空消息历史
   */
  public clearMessages(): void {
    this.messages.value = []
  }

  /**
   * 获取连接状态
   */
  public getStatus(): WebSocketStatus {
    return this.status.value
  }
}

// 导出单例
export const websocketService = new WebSocketService()

export default websocketService
