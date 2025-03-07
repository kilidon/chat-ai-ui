<template>
  <div class="chat-header">
    <h2>{{ title }}</h2>
    <div class="connection-status" :class="websocketStatusClass">
      <span v-if="status === 'connected'">已连接</span>
      <span v-else-if="status === 'connecting'">连接中...</span>
      <span v-else-if="status === 'disconnected'">未连接</span>
      <span v-else-if="status === 'error'">连接错误</span>
      <el-tooltip v-if="status === 'error'" :content="errorMessage">
        <el-icon><Warning /></el-icon>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
// 导出组件
export default {
  name: 'ChatHeader',
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps<{
  title: string
  status: 'connected' | 'connecting' | 'disconnected' | 'error'
  errorMessage?: string
}>()

/**
 * WebSocket状态对应的CSS类名
 */
const websocketStatusClass = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'status-connected'
    case 'connecting':
      return 'status-connecting'
    case 'disconnected':
      return 'status-disconnected'
    case 'error':
      return 'status-error'
    default:
      return ''
  }
})
</script>

<style scoped lang="scss">
.chat-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #4a90e2;
}

.connection-status {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 5px;

  &.status-connected {
    color: #52c41a;
  }

  &.status-connecting {
    color: #1890ff;
  }

  &.status-disconnected {
    color: #ff4d4f;
  }

  &.status-error {
    color: #ff4d4f;
  }
}
</style> 