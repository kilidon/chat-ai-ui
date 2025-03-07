<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useChatStore } from './stores'
import { initializeServices } from './services'

const chatStore = useChatStore()

onMounted(() => {
  // 初始化聊天数据
  chatStore.initFromLocalStorage()
  // 初始化WebSocket服务
  initializeServices()
})
</script>

<template>
  <div class="app-container background-pattern">
    <RouterView />
  </div>
</template>

<style lang="scss">
// 页面级别的自定义样式
.app-container {
  // 这里可以添加特定于App组件的样式
}
</style>
