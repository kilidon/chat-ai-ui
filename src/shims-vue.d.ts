/**
 * Vue文件的类型声明
 * 使TypeScript能够识别.vue文件
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
} 