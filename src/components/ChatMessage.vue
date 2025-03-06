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
import type { PropType } from 'vue'
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
      type: String as PropType<string>,
      required: true,
    },
    /**
     * 发送者角色
     */
    role: {
      type: String as PropType<'user' | 'assistant'>,
      required: true,
    },
    /**
     * 消息时间戳
     */
    timestamp: {
      type: Number,
      required: true,
    },
    /**
     * 用户头像
     */
    userAvatar: {
      type: String,
      default: '/user-avatar.svg',
    },
    /**
     * AI头像
     */
    aiAvatar: {
      type: String,
      default: '/ai-avatar.png',
    },
  },
  setup(props) {
    /**
     * 是否为用户消息
     */
    const isUser = computed(() => props.role === 'user')

    /**
     * 头像源
     */
    const avatarSrc = computed(() => {
      return isUser.value ? props.userAvatar : props.aiAvatar
    })

    /**
     * 格式化消息内容（支持Markdown）
     */
    const formattedContent = computed(() => {
      try {
        // 使用标准字符串转换确保内容是字符串
        const contentStr = String(props.content)
        // 使用marked解析Markdown
        const markedContent = marked(contentStr)
        // 使用DOMPurify清理HTML以防XSS攻击
        return DOMPurify.sanitize(markedContent)
      } catch (error) {
        console.error('处理消息内容时出错:', error)
        return ''
      }
    })

    /**
     * 格式化时间
     */
    const formattedTime = computed(() => {
      const date = new Date(props.timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    return {
      isUser,
      avatarSrc,
      formattedContent,
      formattedTime,
    }
  },
})
</script>

<style lang="scss" scoped>
.chat-message {
  display: flex;
  margin-bottom: 20px;

  .avatar {
    margin-right: 10px;
    flex-shrink: 0;
  }

  .message-content {
    flex-grow: 1;

    .message-text {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 4px;
      line-height: 1.5;
      max-width: 80%;
      word-break: break-word;

      /* 支持Markdown渲染的基本样式 */
      :deep(p) {
        margin: 0 0 10px;
        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(pre) {
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
      }

      :deep(code) {
        font-family: 'Courier New', monospace;
        background-color: #f5f5f5;
        padding: 2px 4px;
        border-radius: 3px;
      }

      :deep(a) {
        color: #1890ff;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }

      :deep(ul, ol) {
        padding-left: 20px;
        margin: 10px 0;
      }

      :deep(img) {
        max-width: 100%;
        border-radius: 4px;
      }
    }

    .message-time {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }

  &.user-message {
    flex-direction: row-reverse;

    .avatar {
      margin-right: 0;
      margin-left: 10px;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .message-text {
        background-color: #e1f5fe;
        color: #0277bd;
      }
    }
  }

  &.ai-message {
    .message-text {
      background-color: #f5f5f5;
      color: #333;
    }
  }
}
</style> 