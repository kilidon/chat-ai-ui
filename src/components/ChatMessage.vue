<template>
  <div class="chat-message" :class="{ 'user-message': isUser, 'ai-message': !isUser }">
    <div class="avatar">
      <el-avatar :size="40" :src="avatarSrc"></el-avatar>
    </div>
    <div class="message-content">
      <div class="message-text" v-html="formattedContent"></div>
      <div class="message-time">{{ formattedTime }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * 聊天消息组件
 * 用于显示用户和AI的对话消息
 */
export default defineComponent({
  name: 'ChatMessage',
  props: {
    /**
     * 消息内容
     */
    content: {
      type: String,
      required: true
    },
    /**
     * 消息角色（用户或AI助手）
     */
    role: {
      type: String,
      required: true,
      validator: (value: string) => ['user', 'assistant'].includes(value)
    },
    /**
     * 消息时间戳
     */
    timestamp: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    /**
     * 判断是否为用户消息
     */
    const isUser = computed(() => props.role === 'user')
    
    /**
     * 获取头像源
     */
    const avatarSrc = computed(() => {
      return isUser.value 
        ? '/user-avatar.png' 
        : '/ai-avatar.png'
    })
    
    /**
     * 格式化消息内容（支持Markdown）
     */
    const formattedContent = computed(() => {
      // 使用marked解析Markdown，并使用DOMPurify清理HTML以防XSS攻击
      return DOMPurify.sanitize(marked(props.content))
    })
    
    /**
     * 格式化时间
     */
    const formattedTime = computed(() => {
      const date = new Date(props.timestamp)
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    })
    
    return {
      isUser,
      avatarSrc,
      formattedContent,
      formattedTime
    }
  }
})
</script>

<style scoped>
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
  border-radius: 10px;
  word-break: break-word;
  line-height: 1.5;
}

.user-message .message-text {
  background-color: #95ec69;
  color: #000;
}

.ai-message .message-text {
  background-color: #f2f2f2;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* Markdown样式 */
.message-text :deep(pre) {
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

.message-text :deep(code) {
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
}

.message-text :deep(p) {
  margin: 8px 0;
}

.message-text :deep(ul), .message-text :deep(ol) {
  padding-left: 20px;
}
</style> 