<template>
  <div class="chat-messages" ref="messagesContainer">
    <div v-if="!messages.length" class="welcome-message">
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
      <MessageItem v-for="(message, index) in messages" :key="index" :message="message" />
    </template>
  </div>
</template>

<script lang="ts">
// 导出组件
export default {
  name: 'MessageList',
}
</script>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import MessageItem from './MessageItem.vue'

// 定义组件名称
defineOptions({
  name: 'MessageList',
})

// 定义消息接口
interface Message {
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  extra?: Record<string, unknown>
}

// 定义属性
const props = defineProps<{
  messages: Message[]
}>()

// 消息容器引用
const messagesContainer = ref<HTMLElement | null>(null)

/**
 * 将消息容器滚动到底部
 */
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages,
  () => {
    nextTick(() => {
      // scrollToBottom()
    })
  },
  { deep: true }
)

// 首次加载时滚动到底部
onMounted(() => {
  scrollToBottom()
})

// 暴露方法
defineExpose({
  scrollToBottom,
})
</script>

<style scoped lang="scss">
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
  color: #4a90e2;
  font-size: 16px;
}

.welcome-text p {
  margin: 8px 0;
}
</style> 