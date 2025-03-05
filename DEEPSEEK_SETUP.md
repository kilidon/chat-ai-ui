# DeepSeek API 集成指南

## 简介

本文档指导您如何配置和使用DeepSeek API以获取AI回复。问小猫AI聊天机器人已经集成了DeepSeek API的调用框架，您只需要配置API密钥即可开始使用。

## 获取DeepSeek API密钥

1. 访问 [DeepSeek官网](https://deepseek.com/) 并注册账号
2. 登录后，在个人设置或API页面申请API密钥
3. 复制生成的API密钥，稍后将用于配置

## 配置API密钥

有两种方式配置API密钥：

### 方法一：使用环境变量文件（推荐）

1. 在项目根目录找到`.env.example`文件
2. 复制该文件并重命名为`.env`
3. 打开`.env`文件，将您的API密钥填写到`VITE_DEEPSEEK_API_KEY`变量中：

```
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

4. 保存文件并重启应用

### 方法二：直接在代码中配置

1. 打开`src/services/deepseek.ts`文件
2. 找到`API_KEY`常量并设置您的密钥：

```typescript
const API_KEY = 'your_api_key_here'; 
```

3. 保存文件并重启应用

## 测试API连接

完成配置后，您可以通过以下步骤测试API是否正常工作：

1. 启动应用 `npm run dev`
2. 打开浏览器，访问应用
3. 在聊天界面发送一条消息
4. 如果配置正确，您应该会收到DeepSeek AI的回复

## 自定义API参数

如果您需要自定义API调用参数（如温度、最大生成长度等），可以在`src/services/deepseek.ts`文件中修改：

```typescript
const response = await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages,
    temperature: 0.7,  // 可调整的温度值，控制回复的随机性
    max_tokens: 2000   // 最大生成的token数量
  })
})
```

## API余额不足解决方案

如果您收到"Insufficient Balance"（余额不足）错误，这表示您的DeepSeek API账户余额已耗尽，请按照以下步骤解决：

### 1. 充值账户

1. 访问 [DeepSeek官网](https://deepseek.com/) 并登录
2. 前往个人账户页面或计费设置
3. 根据页面指引，为您的账户充值
4. 充值完成后，应用将在几分钟内恢复正常功能

### 2. 使用替代方案

如果您不想充值，或者需要临时解决方案，可以：

- **使用免费API**：修改代码使用其他提供免费额度的AI服务API
- **使用模拟模式**：系统已配置为在API余额不足时自动切换到模拟模式，可以继续使用，但回复质量会受到影响

### 3. 申请免费API密钥

许多AI服务提供商（如OpenAI、HuggingFace等）都提供一定的免费额度，您可以：

1. 访问相应平台申请免费API密钥
2. 修改`src/services/deepseek.ts`文件中的API端点和相关代码
3. 使用新的API服务

## 故障排除

如果您遇到问题，请检查：

1. API密钥是否正确配置
2. 网络连接是否正常
3. 浏览器控制台是否有错误信息
4. 账户余额是否充足

如需更多帮助，请参考[DeepSeek API文档](https://deepseek.com/docs)或联系项目维护者。 