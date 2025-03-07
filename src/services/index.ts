/**
 * 服务模块入口文件
 */

import websocketService, { WebSocketStatus, MessageType } from './websocket'
import type { WebSocketMessage } from './websocket'
import videoGenerationService from './videoGeneration'
import type { VideoGenerationParams, VideoGenerationProgress } from './videoGeneration'

/**
 * 初始化所有服务
 */
export function initializeServices(): void {
  // 获取或生成用户唯一码
  const userCode = websocketService.getUserCode()
  console.log('用户唯一码:', userCode)

  // 初始化WebSocket连接
  websocketService.connect().catch((error) => {
    console.error('初始化WebSocket连接失败:', error)
  })
}

// 导出所有服务
export { websocketService, WebSocketStatus, MessageType, videoGenerationService }

// 导出WebSocket相关类型
export type { WebSocketMessage, VideoGenerationParams, VideoGenerationProgress }
