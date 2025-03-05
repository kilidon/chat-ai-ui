<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="../assets/logo.svg" alt="Logo" class="logo" />
        <h2>问小猫 AI 聊天机器人</h2>
      </div>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        label-position="top"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <div class="remember-row">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <a href="#" class="forgot-link">忘记密码?</a>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-button" 
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-tips">
        <p>提示: 用户名和密码可以随意输入，这是一个演示项目</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useChatStore } from '../stores/index'

/**
 * 登录视图组件
 * 用户登录界面
 */
export default defineComponent({
  name: 'LoginView',
  components: {
    User,
    Lock
  },
  setup() {
    const router = useRouter()
    const chatStore = useChatStore()
    const loginFormRef = ref()
    const loading = ref(false)
    
    // 登录表单数据
    const loginForm = reactive({
      username: '',
      password: '',
      remember: false
    })
    
    // 表单验证规则
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
      ]
    }
    
    /**
     * 处理登录
     */
    const handleLogin = () => {
      loginFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        
        loading.value = true
        
        // 模拟登录请求
        setTimeout(() => {
          // 保存用户信息到store
          chatStore.setUserInfo({
            id: 'user_' + Date.now(),
            name: loginForm.username,
            avatar: '/user-avatar.svg'
          })
          
          loading.value = false
          ElMessage.success('登录成功')
          
          // 跳转到聊天页面
          router.push('/chat')
        }, 1000)
      })
    }
    
    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleLogin
    }
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fffaf0;
}

.login-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(255, 193, 7, 0.2);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  animation: spin 60s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.login-header h2 {
  font-size: 24px;
  color: #ff8f00;
  margin: 0;
  text-shadow: 0 2px 5px rgba(255, 193, 7, 0.2);
}

.login-form {
  margin-bottom: 20px;
}

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  color: #ffc107;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.forgot-link:hover {
  color: #ff8f00;
  text-decoration: underline;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
}

.login-tips {
  text-align: center;
  color: #ffb300;
  font-size: 14px;
  margin-top: 20px;
  padding: 10px;
  background-color: #fff8e1;
  border-radius: 10px;
  border: 1px dashed #ffe082;
}

:deep(.el-form-item__label) {
  color: #ff8f00;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #ffc107;
  border-color: #ffc107;
}

:deep(.el-checkbox__label) {
  color: #ff8f00;
}
</style> 