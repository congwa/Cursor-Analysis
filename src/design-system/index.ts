/**
 * Cursor Analysis 设计系统
 * 
 * 提供统一的设计令牌、工具函数和类型定义
 */

// 设计令牌
export * from './tokens'

// 格式化工具
export { 
  formatNumber, 
  formatSize, 
  truncate, 
  shortenPath,
  formatPercent,
  formatDate 
} from '@/lib/format'

// cn 工具函数 (用于合并 Tailwind 类名)
export { cn } from '@/lib/utils'
