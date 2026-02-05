/**
 * Cursor Analysis 设计令牌 (Design Tokens)
 * 基于 ui-ux-pro-max 生成
 */

// ============================================
// 颜色系统
// ============================================

export const colors = {
  // 背景色
  background: {
    primary: '#0d1117',    // 页面背景
    secondary: '#161b22',  // 卡片背景
    tertiary: '#21262d',   // 次级背景
  },
  
  // 文字色
  text: {
    primary: '#c9d1d9',    // 主要文字
    secondary: '#8b949e',  // 次要文字
    muted: '#6e7681',      // 更淡的文字
  },
  
  // 边框
  border: {
    default: '#30363d',
    subtle: '#21262d',
  },
  
  // 主题色
  primary: {
    DEFAULT: '#2f81f7',
    foreground: '#ffffff',
    hover: '#4a9eff',
  },
  
  // 功能色
  success: {
    DEFAULT: '#3fb950',
    background: 'rgba(63, 185, 80, 0.1)',
    border: 'rgba(63, 185, 80, 0.2)',
  },
  
  destructive: {
    DEFAULT: '#f85149',
    background: 'rgba(248, 81, 73, 0.1)',
    border: 'rgba(248, 81, 73, 0.2)',
  },
  
  warning: {
    DEFAULT: '#f0883e',
    background: 'rgba(240, 136, 62, 0.1)',
    border: 'rgba(240, 136, 62, 0.2)',
  },
  
  info: {
    DEFAULT: '#58a6ff',
    background: 'rgba(88, 166, 255, 0.1)',
    border: 'rgba(88, 166, 255, 0.2)',
  },
  
  // 模式色
  agent: {
    DEFAULT: '#a371f7',
    background: 'rgba(163, 113, 247, 0.2)',
  },
  
  chat: {
    DEFAULT: '#58a6ff',
    background: 'rgba(88, 166, 255, 0.2)',
  },
}

// 图表颜色
export const chartColors = [
  '#2f81f7', // 蓝色 - 主要
  '#3fb950', // 绿色 - 正向
  '#f0883e', // 橙色 - 次要
  '#f85149', // 红色 - 负向
  '#a371f7', // 紫色 - Agent
  '#8b949e', // 灰色 - 中性
]

// ============================================
// 字体系统
// ============================================

export const typography = {
  fontFamily: {
    mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
    sans: ['Fira Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

// ============================================
// 间距系统
// ============================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
}

// ============================================
// 圆角
// ============================================

export const borderRadius = {
  sm: '2px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
}

// ============================================
// 阴影
// ============================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glow: '0 0 10px rgba(47, 129, 247, 0.3)',
}

// ============================================
// 动画
// ============================================

export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  
  easing: {
    default: 'ease-in-out',
    in: 'ease-in',
    out: 'ease-out',
  },
}

// ============================================
// 响应式断点
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// ============================================
// Z-Index 层级
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
}
