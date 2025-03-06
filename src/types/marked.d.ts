/**
 * marked库的类型声明文件
 */
declare module 'marked' {
  export interface MarkedOptions {
    baseUrl?: string
    breaks?: boolean
    gfm?: boolean
    headerIds?: boolean
    headerPrefix?: string
    langPrefix?: string
    mangle?: boolean
    pedantic?: boolean
    sanitize?: boolean
    silent?: boolean
    smartLists?: boolean
    smartypants?: boolean
    xhtml?: boolean
  }

  /**
   * 将Markdown文本转换为HTML
   * @param src - Markdown源文本
   * @param options - 选项
   * @returns 转换后的HTML
   */
  export function marked(src: string | unknown, options?: MarkedOptions): string

  // 其他可能的导出...
}
