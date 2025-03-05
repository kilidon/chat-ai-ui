<template>
  <div class="chat-container">
    <el-container>
      <el-aside :width="isCollapsed ? '80px' : '250px'" class="sidebar-container">
        <div class="session-list">
          <div class="session-header">
            <div class="virtual-avatar">
              <el-avatar :size="50" src="/images/cart.jpeg"></el-avatar>
              <div class="avatar-info" v-show="!isCollapsed">
                <h3>问小猫</h3>
              </div>
              <el-button 
                class="collapse-btn" 
                type="text" 
                @click="toggleSidebar"
              >
                <el-icon v-if="isCollapsed"><Expand /></el-icon>
                <el-icon v-else><Fold /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="new-chat-btn">
            <el-button 
              type="primary" 
              @click="createNewSession" 
              plain
              class="new-chat-button"
            >
              <el-icon><Plus /></el-icon>
              <span v-if="!isCollapsed" class="btn-text">新对话</span>
            </el-button>
          </div>
          
          <el-scrollbar height="calc(100vh - 170px)">
            <div 
              v-for="session in chatStore.sessionList" 
              :key="session.id" 
              class="session-item"
              :class="{ 'active': chatStore.currentSessionId === session.id, 'collapsed': isCollapsed }"
              @click="switchSession(session.id)"
            >
              <el-icon><ChatDotRound /></el-icon>
              <div class="session-title" v-show="!isCollapsed">{{ session.title }}</div>
              <div class="session-time" v-show="!isCollapsed">{{ formatTime(session.createTime) }}</div>
            </div>
            
            <div v-if="!chatStore.sessionList.length" class="empty-list">
              <el-empty description="暂无对话" v-if="!isCollapsed" />
              <el-icon v-else><ChatDotRound /></el-icon>
            </div>
          </el-scrollbar>
        </div>
      </el-aside>
      <el-main>
        <div class="chat-main">
          <div class="chat-header">
            <h2>{{ currentSessionTitle }}</h2>
          </div>
          
          <div class="chat-messages" ref="messagesContainer">
            <div v-if="!chatStore.chatMessages.length" class="welcome-message">
              <el-empty description="开始一个新的对话吧！">
                <template #image>
                  <img src="/images/cart.jpeg" alt="Logo" class="welcome-logo" />
                </template>
                <div class="welcome-text">
                  <p>喵~ 我是问小猫，您的AI助手</p>
                  <p>有什么我可以帮您的吗？</p>
                </div>
              </el-empty>
            </div>
            
            <template v-else>
              <div 
                v-for="(message, index) in chatStore.chatMessages" 
                :key="index"
                class="chat-message"
                :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
              >
                <div class="avatar">
                  <el-avatar :size="40" :src="message.role === 'user' ? '/user-avatar.svg' : '/images/cart.jpeg'"></el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-text" v-html="message.content"></div>
                  <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
                </div>
              </div>
            </template>
          </div>
          
          <div class="chat-input">
            <div class="chat-input-container">
              <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="3"
                placeholder="请输入您的问题..."
                resize="none"
                @keydown.enter.prevent="handleEnter"
              />
              <div class="button-container">
                <el-button 
                  type="primary" 
                  :disabled="!inputMessage.trim() || chatStore.loading" 
                  @click="sendMessage"
                  :loading="chatStore.loading"
                  round
                >
                  {{ chatStore.loading ? '发送中...' : '发送' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/index'
import { Plus, ChatDotRound, Expand, Fold } from '@element-plus/icons-vue'
import deepseekService from '../services/deepseek'

/**
 * 聊天视图组件
 * 主聊天界面，包含会话列表、消息显示和输入框
 */
export default defineComponent({
  name: 'ChatView',
  components: {
    Plus,
    ChatDotRound,
    Expand,
    Fold
  },
  setup() {
    const chatStore = useChatStore()
    const messagesContainer = ref<HTMLElement | null>(null)
    const inputMessage = ref('')
    const isCollapsed = ref(false)
    
    // 获取当前会话标题
    const currentSessionTitle = computed(() => {
      return chatStore.currentSession ? chatStore.currentSession.title : '新对话'
    })
    
    /**
     * 切换侧边栏展开/折叠
     */
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
    }
    
    /**
     * 处理回车键事件
     * @param {KeyboardEvent} e - 键盘事件对象
     */
    const handleEnter = (e: KeyboardEvent) => {
      // 如果按下Shift+Enter，则允许换行
      if (e.shiftKey) return
      
      // 否则发送消息
      sendMessage()
    }
    
    /**
     * 发送消息
     */
    const sendMessage = () => {
      const message = inputMessage.value.trim()
      if (!message || chatStore.loading) return
      
      // 设置加载状态
      chatStore.setLoading(true)
      
      // 添加用户消息
      chatStore.sendMessage({
        content: message,
        role: 'user'
      })
      
      // 清空输入框
      inputMessage.value = ''
      
      // 调用DeepSeek API获取回复
      fetchDeepSeekResponse(message)
    }
    
    /**
     * 从DeepSeek API获取回复
     * @param {string} userMessage - 用户消息
     */
    const fetchDeepSeekResponse = async (userMessage: string) => {
      try {
        // 调用deepseek服务获取回复
        const aiResponse = await deepseekService.getSimpleCompletion(userMessage);
        
        chatStore.sendMessage({
          content: aiResponse,
          role: 'assistant'
        });
      } catch (error) {
        console.error('获取AI回复时出错:', error)
        chatStore.sendMessage({
          content: `抱歉，获取回复时出现了错误：${error instanceof Error ? error.message : '未知错误'}。

可能的原因：
1. API密钥未正确配置或已失效
2. 网络连接问题
3. API服务端问题

请检查配置并重试。如需帮助，请参考"DEEPSEEK_SETUP.md"文档。`,
          role: 'assistant'
        })
      } finally {
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
     * 切换到指定会话
     * @param {string} sessionId - 会话ID
     */
    const switchSession = (sessionId: string) => {
      if (sessionId === chatStore.currentSessionId) return
      chatStore.switchSession(sessionId)
    }
    
    /**
     * 格式化时间
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化后的时间
     */
    const formatTime = (timestamp: number): string => {
      const date = new Date(timestamp)
      return date.toLocaleDateString('zh-CN')
    }
    
    /**
     * 格式化消息时间
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化后的时间
     */
    const formatMessageTime = (timestamp: number): string => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    }
    
    // 监听消息变化，自动滚动到底部
    watch(() => chatStore.chatMessages, () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }, { deep: true })
    
    // 如果没有会话，创建一个新会话
    if (chatStore.sessionList.length === 0) {
      createNewSession()
    }
    
    return {
      chatStore,
      currentSessionTitle,
      messagesContainer,
      inputMessage,
      isCollapsed,
      toggleSidebar,
      handleEnter,
      sendMessage,
      createNewSession,
      switchSession,
      formatTime,
      formatMessageTime
    }
  }
})
</script>

<style scoped>
.chat-container {
  height: 100vh;
  width: 100%;
  display: flex;
}

.el-container {
  width: 100%;
  height: 100%;
}

.el-aside {
  height: 100vh;
  overflow: hidden;
  border-right: 1px solid #E0E0E0;
  background-color: #F8F9FA;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  transition: width 0.3s ease;
}

.session-header {
  padding: 15px;
  border-bottom: 1px solid #E0E0E0;
  background-color: #F0F7FF;
  border-radius: 0 0 15px 15px;
}

.virtual-avatar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avatar-info {
  margin-left: 10px;
  flex: 1;
}

.avatar-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #4A90E2;
}

.collapse-btn {
  color: #4A90E2;
  font-size: 18px;
}

.new-chat-btn {
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #E0E0E0;
}

.new-chat-btn .el-button {
  width: 100%;
  background: linear-gradient(145deg, #4A90E2, #5C9EE6);
  border: none;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3), inset 0 -2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 40px;
}

.new-chat-btn .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.new-chat-btn .el-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(74, 144, 226, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #E0E0E0;
  position: relative;
  border-radius: 8px;
  margin: 5px 10px;
}

.session-item:hover {
  background-color: #F0F7FF;
}

.session-item.active {
  background-color: #E3F2FD;
  border-left: 3px solid #4A90E2;
}

.session-item.collapsed {
  justify-content: center;
  padding: 12px 5px;
}

.session-title {
  flex: 1;
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4A90E2;
}

.session-time {
  font-size: 12px;
  color: #78A9E6;
  margin-left: 10px;
}

.empty-list {
  padding: 20px;
  text-align: center;
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

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #E0E0E0;
  background-color: #fff;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #4A90E2;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  background-color: #fff;
}

.welcome-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-logo {
  width: 150px;
  height: 150px;
  filter: drop-shadow(0 5px 15px rgba(74, 144, 226, 0.3));
}

.welcome-text {
  text-align: center;
  color: #4A90E2;
  font-size: 16px;
}

.welcome-text p {
  margin: 8px 0;
}

.chat-message {
  display: flex;
  margin-bottom: 20px;
  padding: 0 20px;
}

.user-message {
  flex-direction: row-reverse;
}

.avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
}

.user-message .message-content {
  text-align: right;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  word-break: break-word;
  line-height: 1.5;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.user-message .message-text {
  background-color: #E3F2FD;
  color: #333;
  border-top-right-radius: 4px;
}

.ai-message .message-text {
  background-color: #F5F5F5;
  color: #333;
  border-top-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.chat-input {
  margin-top: auto;
}

.chat-input-container {
  padding: 15px;
  border-top: 1px solid #E0E0E0;
  background-color: #fff;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.button-container .el-button {
  background: linear-gradient(145deg, #4A90E2, #5C9EE6);
  border: none;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3), inset 0 -2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 40px;
  padding: 0 25px;
}

.button-container .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.button-container .el-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(74, 144, 226, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.1);
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
  background: #BBDEFB;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #90CAF9;
}

.sidebar-container {
  transition: width 0.3s ease-in-out;
}

.new-chat-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  margin-left: 5px;
  color: #FFFFFF;
}

.new-chat-btn .el-button.is-plain {
  background: linear-gradient(145deg, #4A90E2, #5C9EE6);
  color: white;
}
</style> 