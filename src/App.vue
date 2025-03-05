<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
  background-color: #f8f6ff;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="10" cy="10" r="2" fill="%23FACDCD" opacity="0.5"/><circle cx="30" cy="30" r="3" fill="%23D4F0FF" opacity="0.5"/><circle cx="50" cy="10" r="2" fill="%23FACDCD" opacity="0.5"/><circle cx="70" cy="30" r="3" fill="%23D4F0FF" opacity="0.5"/><circle cx="90" cy="10" r="2" fill="%23FACDCD" opacity="0.5"/><circle cx="10" cy="50" r="3" fill="%23D4F0FF" opacity="0.5"/><circle cx="30" cy="70" r="2" fill="%23FACDCD" opacity="0.5"/><circle cx="50" cy="50" r="3" fill="%23D4F0FF" opacity="0.5"/><circle cx="70" cy="70" r="2" fill="%23FACDCD" opacity="0.5"/><circle cx="90" cy="50" r="3" fill="%23D4F0FF" opacity="0.5"/><circle cx="10" cy="90" r="2" fill="%23FACDCD" opacity="0.5"/><circle cx="50" cy="90" r="2" fill="%23FACDCD" opacity="0.5"/><circle cx="90" cy="90" r="2" fill="%23FACDCD" opacity="0.5"/></svg>');
}

.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 卡通风格的全局样式 */
.el-button--primary {
  background: linear-gradient(145deg, #4A90E2, #5C9EE6) !important;
  border-color: #4A90E2 !important;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3), inset 0 -2px 5px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
}

.el-button--primary:hover, .el-button--primary:focus {
  background: linear-gradient(145deg, #5C9EE6, #4A90E2) !important;
  border-color: #4A90E2 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.1) !important;
}

.el-button--primary:active {
  transform: translateY(1px) !important;
  box-shadow: 0 2px 5px rgba(74, 144, 226, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.1) !important;
}

.el-input__inner, .el-textarea__inner {
  border-radius: 20px !important;
  transition: all 0.3s !important;
  border: 1px solid #E0E0E0 !important;
}

.el-input__inner:focus, .el-textarea__inner:focus {
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.3) !important;
  border-color: #4A90E2 !important;
}

.el-button {
  border-radius: 20px !important;
  transition: all 0.3s !important;
}

.el-card {
  border-radius: 15px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s !important;
}

.el-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1) !important;
}
</style>
