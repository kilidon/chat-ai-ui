<template>
  <div class="chat-container">
    <el-container>
      <!-- 会话侧边栏 -->
      <SessionSidebar
        :sessionList="chatStore.sessionList"
        :currentSessionId="chatStore.currentSessionId"
        @create-session="createNewSession"
        @switch-session="switchSession"
        @delete-session="deleteSession"
        @toggle-sidebar="handleToggleSidebar"
      />

      <el-main>
        <div class="chat-main">
          <!-- 聊天头部 -->
          <ChatHeader
            :title="currentSessionTitle"
            :status="websocketStatusToString(websocketService.status.value)"
            :errorMessage="websocketService.errorMessage.value"
          />

          <!-- 消息列表 -->
          <MessageList ref="messageListRef" :messages="chatStore.chatMessages" />

          <!-- 聊天输入框 -->
          <ChatInput :loading="chatStore.loading" @send="handleSendMessage" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useChatStore } from '../stores/index'
import { websocketService, WebSocketStatus } from '../services'
import { ElMessage } from 'element-plus'

// 导入组件
import SessionSidebar from '../components/chat/SessionSidebar.vue'
import ChatHeader from '../components/chat/ChatHeader.vue'
import MessageList from '../components/chat/MessageList.vue'
import ChatInput from '../components/chat/ChatInput.vue'

// 定义组件名称
defineOptions({
  name: 'ChatView',
})

// 获取聊天状态
const chatStore = useChatStore()

// 消息列表引用
const messageListRef = ref<{ scrollToBottom: () => void } | null>(null)

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 获取当前会话标题
const currentSessionTitle = computed(() => {
  return chatStore.currentSession ? chatStore.currentSession.title : '新对话'
})

// 如果没有当前会话，创建一个新会话
if (!chatStore.currentSessionId && chatStore.sessionList.length === 0) {
  chatStore.createNewSession()
} else if (!chatStore.currentSessionId && chatStore.sessionList.length > 0) {
  // 如果有会话但没有选择当前会话，选择第一个会话
  chatStore.switchSession(chatStore.sessionList[0].id)
}

/**
 * 处理侧边栏折叠/展开
 */
const handleToggleSidebar = (collapsed: boolean) => {
  isCollapsed.value = collapsed
}

/**
 * 将WebSocket状态转换为字符串
 */
const websocketStatusToString = (
  status: WebSocketStatus
): 'connected' | 'connecting' | 'disconnected' | 'error' => {
  switch (status) {
    case WebSocketStatus.CONNECTED:
      return 'connected'
    case WebSocketStatus.CONNECTING:
      return 'connecting'
    case WebSocketStatus.DISCONNECTED:
      return 'disconnected'
    case WebSocketStatus.ERROR:
      return 'error'
    default:
      return 'disconnected'
  }
}

/**
 * 处理发送消息
 */
const handleSendMessage = async (message: string, taskId?: number) => {
  if (!message.trim() || chatStore.loading) return

  // 发送用户消息
  chatStore.sendMessage({
    content: message,
    role: 'user',
  })

  // 自动滚动到底部
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom()
  }

  try {
    // 设置加载状态
    chatStore.setLoading(true)

    // 这里应该调用普通对话API获取回复
    // TODO: 替换为实际的对话API调用

    // 模拟API响应
    setTimeout(() => {
      // 如果有taskId，添加到回复中
      console.log('taskId', taskId)
      if (taskId) {
        const reply = {
          content: ``,
          taskId: taskId,
          type: 'video' as const,
          role: 'assistant' as const,
          videoData: {
            progress: 0,
            stage: 0,
            stageDesc: [],
            estimatedRemainingTime: 0,
            videoUrl: '',
          },
        }
        // 在发送消息后记录返回的ID
        const messageId = chatStore.sendMessage(reply)

        // 如果需要在视频进度消息中使用，可以保存此ID
        console.log('回复消息ID:', messageId)
      }
      // 结束加载状态
      chatStore.setLoading(false)
    }, 200)

    // 确保WebSocket连接已建立（用于接收视频进度）
    if (websocketService.getStatus() !== WebSocketStatus.CONNECTED) {
      await websocketService.connect()
    }
  } catch (error) {
    console.error('获取回复时出错:', error)
    // 发送错误消息
    chatStore.sendMessage({
      content: `抱歉，获取回复时出现了错误：${
        error instanceof Error ? error.message : String(error)
      }`,
      role: 'assistant',
    })

    // 结束加载状态
    chatStore.setLoading(false)
  }
}

/**
 * 创建新会话
 */
const createNewSession = () => {
  chatStore.createNewSession()
}

/**
 * 切换会话
 */
const switchSession = (sessionId: string) => {
  chatStore.switchSession(sessionId)
}

/**
 * 删除会话
 */
const deleteSession = (sessionId: string) => {
  chatStore.deleteSession(sessionId)
  ElMessage({
    type: 'success',
    message: '删除成功',
  })
}

/**
 * 监听WebSocket消息
 */
const watchWebSocketMessages = () => {
  // 监听WebSocket消息
  watch(
    () => websocketService.messages.value,
    (messages) => {
      // 只处理新增的消息
      if (messages.length > 0) {
        // 获取最后一条消息
        const lastMessage = messages[messages.length - 1]
        // console.log('ChatView收到新消息，类型:', lastMessage?.type)

        // 首先检查消息对象是否存在
        if (!lastMessage) {
          console.log('消息对象为空，忽略')
          return
        }

        // 检查消息内容是否存在且不为空
        if (!lastMessage.content || typeof lastMessage.content !== 'string') {
          console.log('消息内容不是有效字符串，忽略')
          return
        }

        // 检查内容是否是有效的JSON格式
        if (lastMessage.content.trim() === '') {
          console.log('消息内容为空字符串，忽略')
          return
        }

        // 尝试解析消息内容
        let messageData
        try {
          messageData = JSON.parse(lastMessage.content)
          // console.log('解析消息内容成功:', messageData)
        } catch (parseError) {
          console.error('JSON解析失败:', parseError)
          // 尝试清理内容后再次解析
          try {
            const cleanedContent = lastMessage.content
              .replace(/\\"/g, '"') // 替换转义的双引号
              .replace(/^"|"$/g, '') // 移除首尾多余的引号
              .replace(/\\\\/g, '\\') // 替换双反斜杠

            messageData = JSON.parse(cleanedContent)
            console.log('清理后解析成功:', messageData)
          } catch (secondError) {
            console.error(
              '二次解析也失败:',
              secondError instanceof Error ? secondError.message : '未知错误'
            )
            return
          }
        }

        // 安全检查：确保messageData是对象且包含必要字段
        if (!messageData || typeof messageData !== 'object') {
          console.log('解析结果不是有效对象，忽略')
          return
        }

        // 直接检查是否包含progress字段，判断是否为视频进度消息
        if (messageData.progress !== undefined && messageData.taskId !== undefined) {
          // console.log('识别为视频进度消息，taskId:', messageData.taskId)

          // 查找是否已存在此taskId的消息
          const result = findMessageByTaskId(messageData.taskId)

          if (result) {
            // 存在对应的消息，进行更新
            console.log('找到现有消息，更新消息索引:', result)

            // 更新现有消息的内容，保留taskId属性
            chatStore.updateMessage(result.message.timestamp, messageData)
            // 自动滚动到底部
            nextTick(() => {
              if (messageListRef.value) {
                messageListRef.value.scrollToBottom()
              }
            })
          } else {
            // 不存在对应的消息，创建新消息
            console.log('未找到现有消息，创建新消息，taskId:', messageData.taskId)
            // chatStore.sendMessage({
            //   content: JSON.stringify(messageData),
            //   role: 'assistant',
            //   taskId: messageData.taskId, // 将taskId添加到消息对象
            // })
          }
        } else {
          console.log('非视频进度消息，忽略')
        }
      }
    },
    { deep: true }
  )
}

/**
 * 在聊天消息中查找包含特定taskId的消息
 * @returns 返回消息对象和消息索引
 */
const findMessageByTaskId = (
  taskId: number
): {
  message: {
    content: string
    role: 'user' | 'assistant'
    timestamp: number
    taskId?: number
    type?: 'text' | 'video'
    videoData?: {
      progress: number
      stage: number
      stageDesc: string[]
      estimatedRemainingTime: number
      videoUrl: string
    }
  }
  index: number
} | null => {
  // 首先在当前聊天消息中查找
  const index = chatStore.chatMessages.findIndex((msg) => msg.taskId === taskId)
  console.log('findMessageByTaskId当前会话', taskId, index)

  // 如果在当前会话找到了消息，返回消息和索引
  if (index !== -1) {
    return {
      message: chatStore.chatMessages[index],
      index,
    }
  }

  // 如果当前会话中未找到，尝试在所有会话历史中查找
  console.log('当前会话未找到消息，尝试在所有会话历史中查找', taskId)

  // 遍历所有会话
  for (let i = 0; i < chatStore.sessionList.length; i++) {
    const session = chatStore.sessionList[i]
    if (session.messages && session.messages.length > 0) {
      // 在会话的消息列表中查找
      const msgIndex = session.messages.findIndex((msg) => msg.taskId === taskId)
      if (msgIndex !== -1) {
        console.log('在历史会话中找到消息', session.id, msgIndex)
        return {
          message: session.messages[msgIndex],
          index: msgIndex,
        }
      }
    }
  }

  console.log('在所有会话历史中均未找到消息', taskId)
  return null
}

// 首次加载时
onMounted(() => {
  // 监听WebSocket消息
  watchWebSocketMessages()
})

onBeforeUnmount(() => {
  // 移除WebSocket消息监听
  // 如果需要的话
})
</script>

<style scoped lang="scss">
.chat-container {
  height: 100vh;
  width: 100%;
  display: flex;
}

.el-container {
  width: 100%;
  height: 100%;
}

.el-main {
  padding: 0;
  height: 100vh;
  overflow: hidden;
  background-color: #fefefe;
}

.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #bbdefb;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #90caf9;
}
</style> 