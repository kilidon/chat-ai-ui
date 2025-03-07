/**
 * 视频生成服务
 *
 * 提供与视频生成API的交互功能
 */

// API基础地址
const API_BASE_URL = 'http://119.97.185.162:9943/api'

// 用户唯一码的存储键
const USER_CODE_KEY = 'video_generation_user_code'

/**
 * API错误类型枚举
 */
export enum VideoApiErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED', // 未授权
  INVALID_PARAMS = 'INVALID_PARAMS', // 无效参数
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND', // 资源未找到
  SERVER_ERROR = 'SERVER_ERROR', // 服务器错误
  NETWORK_ERROR = 'NETWORK_ERROR', // 网络错误
  OTHER_ERROR = 'OTHER_ERROR', // 其他错误
}

/**
 * 生成或获取用户唯一码
 */
export function getUserCode(): string {
  let code = localStorage.getItem(USER_CODE_KEY)

  if (!code) {
    // 生成新的唯一码 (时间戳 + 随机字符串)
    code = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    localStorage.setItem(USER_CODE_KEY, code)
  }

  return code
}

/**
 * 刷新用户唯一码
 */
export function refreshUserCode(): string {
  // 生成新的唯一码
  const code = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  localStorage.setItem(USER_CODE_KEY, code)
  return code
}

/**
 * 获取请求头
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  }
}

/**
 * 视频生成参数接口
 */
export interface VideoGenerationParams {
  /**
   * 输入文本（视频描述）
   */
  inputText: string

  /**
   * 用户唯一码
   */
  code?: string
}

/**
 * 视频生成结果接口
 */
export interface VideoGenerationResult {
  /**
   * 视频ID
   */
  videoId: string

  /**
   * 视频URL
   */
  videoUrl: string

  /**
   * 视频缩略图URL
   */
  thumbnailUrl?: string

  /**
   * 视频生成状态
   */
  status: 'processing' | 'completed' | 'failed'

  /**
   * 视频元数据
   */
  metadata?: {
    duration: number
    resolution: string
    format: string
    size: number
    createdAt: string
  }
}

/**
 * 视频生成进度接口
 */
export interface VideoGenerationProgress {
  /**
   * 任务ID
   */
  taskId: number

  /**
   * 当前阶段 (1-4)
   */
  stage: number

  /**
   * 进度百分比 (0-100)
   */
  progress: number

  /**
   * 阶段描述
   */
  stageDesc: string

  /**
   * 预计剩余时间（秒）
   */
  estimatedRemainingTime: number

  /**
   * 视频URL（如果已生成）
   */
  videoUrl: string

  /**
   * 错误信息（如果失败）
   */
  errorMessage: string
}

/**
 * API响应接口
 */
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * 分析错误类型
 *
 * @param error - 错误对象
 * @returns 错误类型
 */
function analyzeErrorType(error: unknown): VideoApiErrorType {
  if (!error) {
    return VideoApiErrorType.OTHER_ERROR
  }

  interface ErrorLike {
    message?: string
    status?: number
    name?: string
  }

  const errorObj = error as ErrorLike
  const message = errorObj.message || ''
  const status = errorObj.status || 0

  if (
    status === 401 ||
    status === 403 ||
    message.includes('unauthorized') ||
    message.includes('未授权')
  ) {
    return VideoApiErrorType.UNAUTHORIZED
  }

  if (status === 400 || message.includes('invalid') || message.includes('无效参数')) {
    return VideoApiErrorType.INVALID_PARAMS
  }

  if (status === 404 || message.includes('not found') || message.includes('未找到')) {
    return VideoApiErrorType.RESOURCE_NOT_FOUND
  }

  if (status >= 500 || message.includes('server error') || message.includes('服务器错误')) {
    return VideoApiErrorType.SERVER_ERROR
  }

  if (message.includes('network') || message.includes('网络') || errorObj.name === 'TypeError') {
    return VideoApiErrorType.NETWORK_ERROR
  }

  return VideoApiErrorType.OTHER_ERROR
}

/**
 * 处理API响应错误
 *
 * @param response - 响应对象
 * @returns 解析后的响应数据Promise
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    interface ApiError extends Error {
      status?: number
      code?: number
    }

    const error = new Error(`API请求失败: ${response.status} ${response.statusText}`) as ApiError
    error.status = response.status

    try {
      interface ErrorResponse {
        message?: string
        code?: number
      }

      const errorData = (await response.json()) as ErrorResponse
      error.message = errorData.message || error.message
      error.code = errorData.code
    } catch {
      // 忽略JSON解析错误
    }

    throw error
  }

  const responseData = (await response.json()) as ApiResponse<T>

  // 检查API返回的code，如果不是200则抛出错误
  if (responseData.code !== 200) {
    const error = new Error(responseData.message || '请求失败')
    throw error
  }

  return responseData
}

/**
 * 生成视频
 * 根据API文档: /api/video/generate
 *
 * @param params - 视频生成参数
 * @returns 任务ID
 */
export async function generateVideo(params: VideoGenerationParams): Promise<number> {
  try {
    // 确保有用户唯一码
    const requestParams = {
      ...params,
      code: params.code || getUserCode(),
    }

    // 发送请求
    const response = await fetch(`${API_BASE_URL}/video/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestParams),
    })

    // 处理响应
    const responseData = await handleResponse<number>(response)

    // 返回任务ID
    return responseData.data
  } catch (error) {
    console.error('生成视频失败:', error)
    const errorType = analyzeErrorType(error)
    throw new Error(
      `生成视频失败 [${errorType}]: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * 获取视频生成进度
 * 根据API文档: /api/video/progress/{taskId}
 *
 * @param taskId - 任务ID
 * @returns 视频生成进度
 */
export async function getVideoProgress(taskId: number): Promise<VideoGenerationProgress> {
  try {
    // 发送请求
    const response = await fetch(`${API_BASE_URL}/video/progress/${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    // 处理响应
    const responseData = await handleResponse<VideoGenerationProgress>(response)

    // 返回进度数据
    return responseData.data
  } catch (error) {
    console.error('获取视频进度失败:', error)
    const errorType = analyzeErrorType(error)
    throw new Error(
      `获取视频进度失败 [${errorType}]: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * 取消视频生成任务
 * 根据API文档: /api/video/cancel/{taskId}
 *
 * @param taskId - 任务ID
 * @returns 是否成功
 */
export async function cancelVideoTask(taskId: number): Promise<boolean> {
  try {
    // 发送请求
    const response = await fetch(`${API_BASE_URL}/video/cancel/${taskId}`, {
      method: 'POST',
      headers: getHeaders(),
    })

    // 处理响应
    const responseData = await handleResponse<boolean>(response)

    // 返回结果
    return responseData.data
  } catch (error) {
    console.error('取消视频任务失败:', error)
    const errorType = analyzeErrorType(error)
    throw new Error(
      `取消视频任务失败 [${errorType}]: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * 检查文件是否存在
 * 根据API文档: /api/file/check
 *
 * @param filePath - 文件路径
 * @returns 文件是否存在
 */
export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    // 发送请求
    const response = await fetch(`${API_BASE_URL}/file/check`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        path: filePath,
      }),
    })

    // 处理响应
    const responseData = await handleResponse<boolean>(response)

    // 返回结果
    return responseData.data
  } catch (error) {
    console.error('检查文件是否存在失败:', error)
    const errorType = analyzeErrorType(error)
    throw new Error(
      `检查文件是否存在失败 [${errorType}]: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * 获取文件下载URL
 * 根据API文档: /api/file/download
 *
 * @param filePath - 文件路径
 * @returns 文件下载URL
 */
export async function getFileDownloadUrl(filePath: string): Promise<string> {
  try {
    // 发送请求
    const response = await fetch(`${API_BASE_URL}/file/download?path=${filePath}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    // 处理响应
    const responseData = await handleResponse<string>(response)

    // 返回下载URL
    return responseData.data
  } catch (error) {
    console.error('获取文件下载URL失败:', error)
    const errorType = analyzeErrorType(error)
    throw new Error(
      `获取文件下载URL失败 [${errorType}]: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * 获取测试文件URL
 * 根据API文档: /api/file/test-url
 *
 * @returns 测试文件URL
 */
export async function getTestFileUrl(): Promise<string> {
  try {
    // 发送请求
    const response = await fetch(`${API_BASE_URL}/file/test-url`, {
      method: 'GET',
      headers: getHeaders(),
    })

    // 处理响应
    const responseData = await handleResponse<string>(response)

    // 返回测试文件URL
    return responseData.data
  } catch (error) {
    console.error('获取测试文件URL失败:', error)
    const errorType = analyzeErrorType(error)
    throw new Error(
      `获取测试文件URL失败 [${errorType}]: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// 创建服务对象，导出所有功能
const videoGenerationService = {
  getUserCode,
  refreshUserCode,
  generateVideo,
  getVideoProgress,
  cancelVideoTask,
  checkFileExists,
  getFileDownloadUrl,
  getTestFileUrl,
}

export default videoGenerationService
