<template>
  <div class="video-generation-progress">
    <div class="progress-header">
      <el-icon><VideoCameraFilled /></el-icon>
      <span class="title">{{ titleText }}</span>
      <div class="progress-bar-container">
        <el-progress
          :percentage="progress"
          :status="progress === 100 ? 'success' : ''"
          :stroke-width="10"
          color="#4a90e2"
          :format="() => `${Math.round(progress)}%`"
        />
      </div>
    </div>

    <div class="timeline-container">
      <el-timeline>
        <!-- 内容理解阶段 -->
        <el-timeline-item
          :type="progress > 0 ? 'primary' : 'info'"
          :hollow="progress <= 10 ? false : true"
          size="large"
        >
          <div class="timeline-item-content">
            <h4 :class="{ 'active-stage': progress <= 10, 'completed-stage': progress > 10 }">
              内容理解
            </h4>
            <div v-if="hasStageDescForStage(1)" class="stage-desc">
              <div v-html="getStageDescForStage(1)"></div>
            </div>
          </div>
        </el-timeline-item>

        <!-- 分镜头脚本阶段 -->
        <el-timeline-item
          :type="progress > 10 ? 'primary' : 'info'"
          :hollow="progress > 10 && progress <= 20 ? false : true"
          size="large"
        >
          <div class="timeline-item-content">
            <h4
              :class="{
                'active-stage': progress > 10 && progress <= 20,
                'completed-stage': progress > 20,
              }"
            >
              分镜头脚本
            </h4>
            <div v-if="hasStageDescForStage(2)" class="stage-desc">
              <div v-html="getStageDescForStage(2)"></div>
            </div>
          </div>
        </el-timeline-item>

        <!-- 视频生成阶段 -->
        <el-timeline-item
          :type="progress > 20 ? 'primary' : 'info'"
          :hollow="progress > 20 && progress <= 50 ? false : true"
          size="large"
        >
          <div class="timeline-item-content">
            <h4
              :class="{
                'active-stage': progress > 20 && progress <= 50,
                'completed-stage': progress > 50,
              }"
            >
              视频生成
            </h4>
            <div v-if="hasStageDescForStage(3)" class="stage-desc">
              <div v-html="getStageDescForStage(3)"></div>
            </div>
          </div>
        </el-timeline-item>

        <!-- 语音合成阶段 -->
        <el-timeline-item
          :type="progress > 50 ? 'primary' : 'info'"
          :hollow="progress > 50 && progress <= 70 ? false : true"
          size="large"
        >
          <div class="timeline-item-content">
            <h4
              :class="{
                'active-stage': progress > 50 && progress <= 70,
                'completed-stage': progress > 70,
              }"
            >
              语音合成
            </h4>
            <div v-if="hasStageDescForStage(4)" class="stage-desc">
              <div v-html="getStageDescForStage(4)"></div>
            </div>
          </div>
        </el-timeline-item>

        <!-- 视频合成阶段 -->
        <el-timeline-item
          :type="progress > 70 ? 'primary' : 'info'"
          :hollow="progress > 70 && progress <= 90 ? false : true"
          size="large"
        >
          <div class="timeline-item-content">
            <h4
              :class="{
                'active-stage': progress > 70 && progress <= 90,
                'completed-stage': progress > 90,
              }"
            >
              视频合成
            </h4>
            <div v-if="hasStageDescForStage(5)" class="stage-desc">
              <div v-html="getStageDescForStage(5)"></div>
            </div>
          </div>
        </el-timeline-item>

        <!-- 处理完成阶段 -->
        <el-timeline-item
          :type="progress > 90 ? 'success' : 'info'"
          :hollow="progress > 90 ? false : true"
          size="large"
        >
          <div class="timeline-item-content">
            <h4 :class="{ 'active-stage': progress > 90, 'completed-stage': false }">处理完成</h4>
            <div v-if="hasStageDescForStage(6)" class="stage-desc">
              <div v-html="getStageDescForStage(6)"></div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- <div class="remaining-time" v-if="estimatedRemainingTime !== undefined && progress < 100">
      <el-icon><Timer /></el-icon>
      <span>预计剩余时间: {{ formatTime(estimatedRemainingTime) }}</span>
    </div> -->

    <div class="video-result" v-if="videoUrl">
      <video controls :src="videoUrl" class="video-player"></video>
      <div class="video-actions">
        <a :href="videoUrl" target="_blank" class="video-link">
          <el-button type="primary" size="small">
            <el-icon><VideoPlay /></el-icon>
            在新窗口中播放
          </el-button>
        </a>
        <el-button type="success" size="small" @click="downloadVideo">
          <el-icon><Download /></el-icon>
          下载视频
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// 导出组件
export default {
  name: 'VideoSteps',
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { VideoCameraFilled, VideoPlay, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { getFileDownloadUrl } from '../../services/videoGeneration'
// 初始化Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return '' // 使用外部默认转义
  },
})

// 定义组件名称
defineOptions({
  name: 'VideoSteps',
})

interface Props {
  // 当前进度 (0-100)
  progress: number
  // 当前阶段 (1-5)
  stage: number
  // 阶段描述数组
  stageDesc?: string[]
  // 预计剩余时间（秒）
  estimatedRemainingTime?: number
  // 视频URL
  videoUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  stage: 1,
  stageDesc: () => [],
  estimatedRemainingTime: undefined,
  videoUrl: '',
})

/**
 * 检查当前是否有对应阶段的描述
 */
const hasStageDescForStage = (stageNumber: number): boolean => {
  // 检查数组中是否有对应阶段的描述
  if (!props.stageDesc || !Array.isArray(props.stageDesc) || props.stageDesc.length === 0)
    return false

  // 因为数组索引从0开始，而阶段编号从1开始，所以需要减1
  const index = stageNumber - 1
  return index >= 0 && index < props.stageDesc.length && !!props.stageDesc[index]
}

/**
 * 获取指定阶段的描述内容
 */
const getStageDescForStage = (stageNumber: number): string => {
  if (!hasStageDescForStage(stageNumber)) return ''

  // 获取对应索引的描述并格式化
  const index = stageNumber - 1
  const desc = props.stageDesc[index]
  return typeof desc === 'string' ? formatStageDesc(desc) : ''
}

/**
 * 使用Markdown解析器格式化阶段描述
 */
const formatStageDesc = (desc: string): string => {
  if (!desc) return ''

  // 处理特殊情况：带有JSON代码块的内容
  // 先替换JSON代码块为特殊标记，避免被markdown解析器处理
  const processedDesc = desc.replace(/```json\n([\s\S]*?)```/g, (match, p1) => {
    try {
      // 尝试解析和格式化JSON
      const jsonObj = JSON.parse(p1.trim())
      const formattedJson = JSON.stringify(jsonObj, null, 2) // 使用2个空格缩进美化JSON

      // 应用语法高亮
      const highlightedJson = formatJsonWithHighlight(formattedJson)

      return `<pre class="code-block"><code class="language-json">${highlightedJson}</code></pre>`
    } catch (e) {
      // 如果解析失败，使用原始内容，保留换行
      return `<pre class="code-block"><code class="language-json">${p1
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/\s/g, '&nbsp;')}</code></pre>`
    }
  })

  // 然后用markdown解析器解析其余内容
  return md.render(processedDesc)
}

/**
 * 为JSON字符串添加HTML语法高亮标记
 */
const formatJsonWithHighlight = (json: string): string => {
  // 转义特殊字符
  let result = json.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 添加换行和空格
  result = result.replace(/\n/g, '<br>').replace(/\s{2}/g, '&nbsp;&nbsp;')

  // 高亮字符串
  result = result.replace(/"([^"]*)":/g, '<span class="json-key">"$1"</span>:')

  // 高亮字符串值
  result = result.replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')

  // 高亮数字
  result = result.replace(/: (\d+)([,\n]|$)/g, ': <span class="json-number">$1</span>$2')

  // 高亮布尔值和null
  result = result.replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
  result = result.replace(/: (null)/g, ': <span class="json-null">$1</span>')

  return result
}

/**
 * 下载视频
 */
const downloadVideo = async () => {
  if (!props.videoUrl) return

  try {
    // 使用getFileDownloadUrl接口获取下载链接
    ElMessage({
      message: '准备下载视频...',
      type: 'info',
    })

    // 从URL中提取视频路径
    const videoPath = props.videoUrl
    const downloadUrl = await getFileDownloadUrl(videoPath)

    // 创建下载链接
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `video_${Date.now()}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    ElMessage({
      message: '开始下载视频',
      type: 'success',
    })
  } catch (error) {
    console.error('下载视频失败:', error)
    ElMessage({
      message: '下载视频失败: ' + (error instanceof Error ? error.message : String(error)),
      type: 'error',
    })
  }
}

/**
 * 计算标题文字
 */
const titleText = computed(() => {
  if (props.progress >= 100 || props.videoUrl) {
    return '视频生成完成'
  }
  return '视频生成中'
})
</script>

<style scoped lang="scss">
.video-generation-progress {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;

  .progress-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    .title {
      margin-left: 8px;
      font-weight: 500;
      font-size: 16px;
      color: #4a90e2;
    }

    .progress-bar-container {
      margin-left: auto;
      width: 60%; // 设置进度条宽度
    }
  }

  .timeline-container {
    margin: 20px 0;

    .el-timeline {
      padding-left: 0;
    }

    .timeline-item-content {
      padding: 0 0 0 8px;

      h4 {
        margin: 0 0 8px 0;
        font-size: 15px;
        font-weight: 500;
        color: #606266;
      }

      .active-stage {
        color: #409eff;
        font-weight: 600;
      }

      .completed-stage {
        color: #67c23a;
      }

      .stage-desc {
        background-color: #fff;
        padding: 10px;
        border-radius: 6px;
        margin: 8px 0 12px 0;
        font-size: 14px;
        border-left: 3px solid #4a90e2;
        line-height: 1.5;
        max-height: 200px;
        overflow-y: auto;
        word-break: break-word;

        /* 自定义滚动条样式 */
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }

        /* Markdown 内容样式 */
        :deep(p) {
          margin: 8px 0;
        }

        :deep(ul),
        :deep(ol) {
          padding-left: 20px;
          margin: 8px 0;
        }

        :deep(h1),
        :deep(h2),
        :deep(h3),
        :deep(h4),
        :deep(h5),
        :deep(h6) {
          margin: 12px 0 8px 0;
          font-weight: 600;
        }

        :deep(blockquote) {
          border-left: 4px solid #ddd;
          padding-left: 10px;
          color: #666;
          margin: 10px 0;
        }

        :deep(a) {
          color: #409eff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        .code-block {
          background-color: #f8f8f8;
          padding: 10px;
          border-radius: 4px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          white-space: pre-wrap;
          margin: 8px 0;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.6;

          .language-json {
            color: #333;

            // JSON语法高亮
            .json-string {
              color: #008000;
            }
            .json-number {
              color: #0000ff;
            }
            .json-boolean {
              color: #b22222;
            }
            .json-null {
              color: #808080;
            }
            .json-key {
              color: #a52a2a;
              font-weight: bold;
            }
          }
        }

        :deep(code) {
          background-color: #f8f8f8;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 13px;
        }

        :deep(pre) {
          background-color: #f8f8f8;
          padding: 8px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 10px 0;
        }
      }
    }
  }

  .remaining-time {
    display: flex;
    align-items: center;
    margin-top: 10px;
    color: #909399;
    font-size: 14px;

    .el-icon {
      margin-right: 5px;
    }
  }

  .video-player {
    width: 100%;
    // max-height: 250px;
    border-radius: 4px;
    margin: 15px 0 10px;
  }

  .video-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .video-link {
      text-decoration: none;
    }
  }
}
</style> 