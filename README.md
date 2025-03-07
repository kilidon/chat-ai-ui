# 问小猫 AI 聊天机器人

这是一个基于Vue3、TypeScript、Element Plus和Pinia构建的AI聊天机器人前端项目，模仿"问小白"网站的界面和功能。

## 功能特点

- 🤖 AI对话：支持与AI助手进行自然语言对话
- 💬 多会话管理：可以创建和切换多个对话会话
- 🔒 用户认证：包含登录界面和用户认证功能
- 📱 响应式设计：适配不同尺寸的设备屏幕
- 🌈 美观界面：基于Element Plus的现代化UI设计
- 💾 本地存储：对话历史保存在浏览器本地存储中

## 技术栈

- **前端框架**：Vue 3
- **开发语言**：TypeScript
- **UI组件库**：Element Plus
- **状态管理**：Pinia (替代Vuex)
- **路由管理**：Vue Router
- **HTTP请求**：Axios
- **样式预处理**：SCSS
- **API集成**：DeepSeek AI API

## 项目结构

```
src/
├── assets/        # 静态资源
├── components/    # 公共组件
├── router/        # 路由配置
├── stores/        # Pinia状态管理
├── views/         # 页面视图
├── services/      # API服务
├── types/         # TypeScript类型定义
├── styles/        # 全局SCSS样式
├── App.vue        # 根组件
└── main.ts        # 入口文件
```

## 安装与运行

### 前提条件

- Node.js (推荐 v16+)
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式运行

```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 使用说明

1. 启动项目后，默认进入登录页面
2. 使用任意用户名和密码登录（演示模式）
3. 进入聊天界面后，可以在左侧创建新的对话或切换已有对话
4. 在输入框中输入问题，按回车或点击发送按钮与AI交流
5. 对话历史会自动保存在浏览器的本地存储中

## DeepSeek AI API 配置

项目集成了DeepSeek AI API，您需要:

1. 在DeepSeek网站获取API密钥
2. 创建`.env`文件并设置`VITE_DEEPSEEK_API_KEY`
3. 详细配置说明请参考`DEEPSEEK_SETUP.md`文件

## 编码规范

- 使用SCSS进行样式管理，遵循BEM命名规范
- 组件使用Vue 3的Composition API和`<script setup>`语法
- TypeScript类型定义明确，避免使用any类型
- 使用描述性变量和函数名，确保代码可读性

## 已实现功能

- [x] 基础聊天界面
- [x] 多会话管理
- [x] 用户登录界面
- [x] 本地存储对话历史
- [x] DeepSeek AI API集成

## 后续开发计划

- [ ] 支持更多消息类型（图片、文件等）
- [ ] 添加主题切换功能
- [ ] 优化移动端体验
- [ ] 添加导出对话记录功能
- [ ] 实现更精细的API配置选项

## 许可证

MIT
