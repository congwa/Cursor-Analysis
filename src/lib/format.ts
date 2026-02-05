/**
 * 格式化工具函数
 */

/**
 * 格式化数字，添加千位分隔符
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

/**
 * 格式化文件大小
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 截断字符串
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * 缩短文件路径
 */
export function shortenPath(path: string, maxLength: number = 40): string {
  if (path.length <= maxLength) return path
  
  const parts = path.split('/')
  if (parts.length <= 2) return truncate(path, maxLength)
  
  const first = parts[0]
  const last = parts[parts.length - 1]
  
  if (first.length + last.length + 5 > maxLength) {
    return truncate(last, maxLength)
  }
  
  return `${first}/.../${last}`
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return ((value / total) * 100).toFixed(1) + '%'
}

/**
 * 格式化时间戳为日期
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
