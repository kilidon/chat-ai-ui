# WebSocket集成指南

## 简介

本文档指导您如何配置和使用WebSocket连接来接收视频生成的实时消息。问小猫AI聊天机器人已经集成了WebSocket连接框架，系统会自动为每个用户生成唯一的用户码用于连接。

## WebSocket连接机制

1. **用户唯一码**：每次用户访问应用时，系统会自动生成一个唯一的用户码并存储在浏览器的本地存储中。
2. **自动连接**：应用启动时会自动尝试连接WebSocket服务器。
3. **消息传递**：用户发送的消息会通过WebSocket发送到服务器，服务器的回复会实时显示在聊天界面。

## WebSocket API端点

默认WebSocket连接地址为：

```
ws://119.97.185.162:9943/api/ws/video-generation?code={userCode}
```

其中`{userCode}`是系统自动生成的唯一用户码。

## 自定义配置

如果您需要修改WebSocket的连接地址或其他参数，可以在`src/services/websocket.ts`文件中进行以下修改：

```typescript
// 修改WebSocket基础URL
private baseUrl: string = 'ws://119.97.185.162:9943/api/ws/video-generation';

// 修改重连尝试次数
private maxReconnectAttempts: number = 5;

// 修改重连超时时间（毫秒）
private reconnectTimeout: number = 3000;
```

## 手动刷新用户码

在某些情况下，您可能需要刷新用户唯一码（例如，当前用户码失效）。您可以添加一个按钮来调用以下代码：

```typescript
import { websocketService } from './services'

// 刷新用户码并重新连接
function refreshUserCodeAndReconnect() {
  const newCode = websocketService.refreshUserCode()
  console.log('新用户码:', newCode)

  // 重新连接
  websocketService.connect().catch((error) => {
    console.error('重新连接失败:', error)
  })
}
```

## 连接状态监控

WebSocket服务提供了状态监控功能，您可以在组件中监听连接状态：

```typescript
import { websocketService, WebSocketStatus } from './services'
import { watch } from 'vue'

// 监听WebSocket连接状态
watch(
  () => websocketService.status.value,
  (status) => {
    if (status === WebSocketStatus.CONNECTED) {
      console.log('WebSocket已连接')
    } else if (status === WebSocketStatus.DISCONNECTED) {
      console.log('WebSocket已断开')
    } else if (status === WebSocketStatus.ERROR) {
      console.log('WebSocket连接错误', websocketService.errorMessage.value)
    }
  },
)
```

## 故障排除

如果您遇到WebSocket连接问题，请检查：

1. 网络连接是否正常
2. WebSocket服务器是否在线
3. 浏览器控制台是否有错误信息
4. 用户码是否正确生成

系统已配置为自动尝试重连，最多重试5次。如果仍然无法连接，可能需要刷新页面或手动刷新用户码。

## 消息格式

WebSocket服务支持多种消息类型：

1. **文本消息**：普通文本回复
2. **视频消息**：视频生成的URL或数据
3. **图像消息**：图像的URL或数据
4. **系统消息**：系统状态相关的通知
5. **错误消息**：错误通知

系统会根据消息类型自动处理，并显示在聊天界面中。

## 安全注意事项

WebSocket连接未加密（ws://而非wss://），请不要通过此连接发送敏感信息。在生产环境中，应当使用加密的WebSocket连接（wss://）以确保数据传输安全。
