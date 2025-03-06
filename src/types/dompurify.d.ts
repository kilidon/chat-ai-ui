/**
 * DOMPurify库的类型声明文件
 */
declare module 'dompurify' {
  interface DOMPurify {
    /**
     * 清理HTML以防XSS攻击
     * @param dirty - 需要清理的HTML字符串或DOM节点
     * @param options - 选项
     * @returns 清理后的HTML
     */
    sanitize(dirty: string | Node | unknown, options?: DOMPurifyOptions): string

    /**
     * 添加钩子
     */
    addHook(hookName: string, hookFunction: (...args: unknown[]) => unknown): void

    /**
     * 移除钩子
     */
    removeHook(hookName: string): void

    /**
     * 移除所有钩子
     */
    removeHooks(hookName: string): void

    /**
     * 重置配置
     */
    clearConfig(): void
  }

  export interface DOMPurifyOptions {
    ALLOWED_TAGS?: string[]
    ALLOWED_ATTR?: string[]
    FORBID_TAGS?: string[]
    FORBID_ATTR?: string[]
    USE_PROFILES?: {
      html?: boolean
      svg?: boolean
      svgFilters?: boolean
      mathMl?: boolean
    }
    ADD_URI_SAFE_ATTR?: string[]
    ADD_DATA_URI_TAGS?: string[]
    ALLOW_UNKNOWN_PROTOCOLS?: boolean
    RETURN_DOM?: boolean
    RETURN_DOM_FRAGMENT?: boolean
    RETURN_DOM_IMPORT?: boolean
    WHOLE_DOCUMENT?: boolean
    SANITIZE_DOM?: boolean
    KEEP_CONTENT?: boolean
    IN_PLACE?: boolean
    ALLOWED_URI_REGEXP?: RegExp
    NAMESPACE?: string
  }

  const dompurify: DOMPurify
  export default dompurify
}
