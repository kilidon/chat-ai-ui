/**
 * DeepSeek API服务
 * 
 * 提供与DeepSeek AI API交互的方法
 */

// API配置 - 从环境变量中获取
const API_ENDPOINT = import.meta.env.VITE_DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';
// 优先使用环境变量中的API密钥
const API_KEY = ''; // 不在代码中硬编码密钥

// 错误类型
enum ApiErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_API_KEY = 'INVALID_API_KEY',
  NETWORK_ERROR = 'NETWORK_ERROR',
  OTHER_ERROR = 'OTHER_ERROR'
}

// 请求头
const getHeaders = () => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || API_KEY || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
};

// 消息接口
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * 分析API错误类型
 * 
 * @param error - 错误对象或消息
 * @returns 错误类型
 */
function analyzeErrorType(error: any): ApiErrorType {
  const errorMessage = error?.message || String(error);
  
  if (errorMessage.includes('Insufficient Balance') || errorMessage.includes('余额不足')) {
    return ApiErrorType.INSUFFICIENT_BALANCE;
  } else if (errorMessage.includes('Invalid API key') || errorMessage.includes('无效的API密钥')) {
    return ApiErrorType.INVALID_API_KEY;
  } else if (errorMessage.includes('network') || errorMessage.includes('网络')) {
    return ApiErrorType.NETWORK_ERROR;
  }
  
  return ApiErrorType.OTHER_ERROR;
}

/**
 * 获取DeepSeek AI的回复
 * 
 * @param messages - 对话历史消息
 * @returns AI的回复内容
 */
export async function getChatCompletion(messages: Message[]): Promise<string> {
  try {
    // 检查API密钥是否设置
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || API_KEY || '';
    if (!apiKey) {
      console.warn('DeepSeek API密钥未设置，将使用模拟数据');
      return getMockCompletion(messages[messages.length - 1].content);
    }

    console.log('正在使用DeepSeek API...');
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API响应错误:', errorData);
      const errorMessage = errorData.error?.message || response.statusText;
      
      // 特殊处理余额不足错误
      if (errorMessage.includes('Insufficient Balance')) {
        console.warn('DeepSeek API余额不足，将使用模拟数据');
        return getMockCompletionWithError(
          messages[messages.length - 1].content,
          ApiErrorType.INSUFFICIENT_BALANCE
        );
      }
      
      throw new Error(`API请求失败: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (data && data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      console.error('API返回无效数据:', data);
      throw new Error('API返回的数据格式无效');
    }
  } catch (error) {
    console.error('DeepSeek API调用错误:', error);
    
    // 分析错误类型并处理
    const errorType = analyzeErrorType(error);
    if (errorType === ApiErrorType.INSUFFICIENT_BALANCE) {
      return getMockCompletionWithError(
        messages[messages.length - 1].content,
        ApiErrorType.INSUFFICIENT_BALANCE
      );
    }
    
    throw error;
  }
}

/**
 * 简单调用DeepSeek API获取回复
 * 
 * @param userMessage - 用户消息
 * @returns AI的回复内容
 */
export async function getSimpleCompletion(userMessage: string): Promise<string> {
  // 仅适用于简单的对话，不保留上下文
  return getChatCompletion([
    { role: 'user', content: userMessage }
  ]);
}

/**
 * 带有错误信息的模拟回复
 * 
 * @param userMessage - 用户消息
 * @param errorType - 错误类型
 * @returns 模拟的AI回复，包含错误信息
 */
export function getMockCompletionWithError(userMessage: string, errorType: ApiErrorType): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let errorMessage = '';
      
      switch (errorType) {
        case ApiErrorType.INSUFFICIENT_BALANCE:
          errorMessage = `⚠️ **API账户余额不足提醒**

我检测到您的DeepSeek API账户余额已耗尽，无法继续使用API服务。以下是一些解决方案：

1. **充值账户**：访问DeepSeek官网(https://deepseek.com)，登录后为您的账户充值
2. **切换到免费API**：您可以考虑切换到其他提供免费额度的API服务
3. **现在使用模拟模式**：目前系统已自动切换到模拟模式，可以继续对话，但回复质量将受限

如果您已经充值，请等待几分钟后系统将自动恢复正常。

---
以下是对您问题"${userMessage}"的模拟回复：`;
          break;
        default:
          errorMessage = `⚠️ **API连接问题**\n\n系统暂时无法连接到DeepSeek API，已切换到模拟模式。\n\n---\n以下是对您问题的模拟回复：`;
      }
      
      resolve(`${errorMessage}

喵~ 我是问小猫AI助手！您的问题很有趣。由于当前使用的是模拟模式，我无法提供完整的智能回复。

当您解决API账户问题后，我将能够更智能地回答您的问题。

需要了解如何充值或获取免费API支持，请参考"DEEPSEEK_SETUP.md"文档。`);
    }, 1000);
  });
}

/**
 * 模拟AI响应（用于开发和测试）
 * 
 * @param userMessage - 用户消息
 * @returns 模拟的AI回复
 */
export function getMockCompletion(userMessage: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`喵~ 这是一个模拟的DeepSeek AI回复喵！我已接收到您的消息: "${userMessage}"

根据您的问题，我可以给您提供以下信息：
1. 这只是一个模拟响应，实际使用时需要配置DeepSeek API密钥
2. 您可以在环境变量中设置VITE_DEEPSEEK_API_KEY
3. 当密钥配置完成后，系统将自动使用真实的AI回复

需要进一步了解什么信息吗？`);
    }, 1000);
  });
}

export default {
  getChatCompletion,
  getSimpleCompletion,
  getMockCompletion
}; 