<template>
  <el-aside :width="isCollapsed ? '80px' : '250px'" class="sidebar-container">
    <div class="session-list">
      <div class="session-header">
        <div class="virtual-avatar">
          <el-avatar
            :size="isCollapsed ? 50 : 100"
            :shape="isCollapsed ? 'circle' : 'square'"
            src="/images/cart.jpeg"
            class="ai-avatar"
          ></el-avatar>
          <div class="avatar-info" v-show="!isCollapsed">
            <h3>问小猫</h3>
            <p class="subtitle">您的AI助手</p>
          </div>
          <el-button
            class="collapse-btn"
            :class="isCollapsed ? 'isCollapsed' : ''"
            type="text"
            @click="toggleSidebar"
          >
            <el-icon v-if="isCollapsed"><Expand /></el-icon>
            <el-icon v-else><Fold /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="new-chat-btn">
        <el-button type="primary" @click="createNewSession" plain class="new-chat-button">
          <el-icon><Plus /></el-icon>
          <span v-if="!isCollapsed" class="btn-text">新对话</span>
        </el-button>
      </div>

      <el-scrollbar height="calc(100vh - 170px)">
        <div
          v-for="session in sessionList"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id, collapsed: isCollapsed }"
          @click="switchSession(session.id)"
        >
          <el-icon><ChatDotRound /></el-icon>
          <div class="session-info" v-show="!isCollapsed">
            <div class="session-title">{{ session.title }}</div>
            <div class="session-time">{{ formatTime(session.createTime) }}</div>
          </div>
          <div class="session-actions" v-if="!isCollapsed">
            <el-button type="text" @click.stop="deleteSession(session.id)" class="delete-btn">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <div v-if="!sessionList.length" class="empty-list">
          <el-empty description="暂无对话" v-if="!isCollapsed" />
          <el-icon v-else><ChatDotRound /></el-icon>
        </div>
      </el-scrollbar>
    </div>
  </el-aside>
</template>

<script lang="ts">
// 导出组件
export default {
  name: 'SessionSidebar',
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, ChatDotRound, Expand, Fold, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 定义会话接口
interface Session {
  id: string
  title: string
  createTime: number
}

// 定义属性
const props = defineProps<{
  sessionList: Session[]
  currentSessionId: string
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'create-session'): void
  (e: 'switch-session', sessionId: string): void
  (e: 'delete-session', sessionId: string): void
  (e: 'toggle-sidebar', isCollapsed: boolean): void
}>()

// 侧边栏折叠状态
const isCollapsed = ref(false)

/**
 * 切换侧边栏展开/折叠
 */
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-sidebar', isCollapsed.value)
}

/**
 * 创建新会话
 */
const createNewSession = () => {
  emit('create-session')
}

/**
 * 切换会话
 */
const switchSession = (sessionId: string) => {
  emit('switch-session', sessionId)
}

/**
 * 删除会话
 */
const deleteSession = (sessionId: string) => {
  // 确认删除
  ElMessageBox.confirm('确定要删除这个对话吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('delete-session', sessionId)
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    })
    .catch(() => {
      // 取消删除
    })
}

/**
 * 格式化会话创建时间
 */
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}
</script>

<style scoped lang="scss">
.sidebar-container {
  height: 100vh;
  overflow: hidden;
  border-right: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  transition: width 0.3s ease;
}

.session-header {
  position: relative;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f0f7ff;
  border-radius: 0 0 15px 15px;
}

.virtual-avatar {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.ai-avatar {
  border: 2px solid #4a90e2;
  box-shadow: 0 2px 12px 0 rgba(74, 144, 226, 0.2);
  transition: all 0.3s ease;
}

.avatar-info {
  margin-left: 10px;
  overflow: hidden;
}

.avatar-info h3 {
  margin: 0;
  font-size: 18px;
  color: #4a90e2;
}

.avatar-info p.subtitle {
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #78a9e6;
}

.collapse-btn {
  position: absolute;
  right: 10px;
  top: 12px;
  color: #4a90e2;
  font-size: 18px;
  &.isCollapsed {
    right: 10px;
    top: 12px;
  }
}

.new-chat-btn {
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.new-chat-btn .el-button {
  width: 100%;
  background: linear-gradient(145deg, #4a90e2, #5c9ee6);
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
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.session-item:hover {
  background-color: #f9f9f9;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.session-item.active {
  background-color: #e6f2ff;
}

.session-item.collapsed {
  justify-content: center;
  padding: 15px 0;
}

.session-info {
  flex: 1;
  overflow: hidden;
}

.session-title {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 12px;
  color: #999;
}

.session-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.delete-btn {
  color: #ff4d4f;
  padding: 2px;
}

.delete-btn:hover {
  color: #ff7875;
}

.empty-list {
  padding: 20px;
  text-align: center;
}

.new-chat-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  margin-left: 5px;
  color: #ffffff;
}

.new-chat-btn .el-button.is-plain {
  background: linear-gradient(145deg, #4a90e2, #5c9ee6);
  color: white;
}
</style> 