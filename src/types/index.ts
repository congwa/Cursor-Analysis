/**
 * Cursor Analysis 类型定义
 */

// 存储信息
export interface StorageInfo {
  total_size: number
  total_size_human: string
  global_storage_size: number
  global_storage_size_human: string
  history_size: number
  history_size_human: string
  workspace_storage_size: number
  workspace_storage_size_human: string
  state_vscdb_size: number
  state_vscdb_backup_size: number
}

// 数据库统计
export interface DatabaseStats {
  item_table_count: number
  item_table_size: number
  cursor_disk_kv_count: number
  cursor_disk_kv_size: number
  bubble_count: number
  bubble_size: number
  composer_count: number
  composer_size: number
  checkpoint_count: number
  checkpoint_size: number
  agent_kv_count: number
  agent_kv_size: number
}

// 聊天会话
export interface ChatSession {
  id: string
  name: string
  mode: 'agent' | 'chat' | string
  created_at: string | null
  updated_at: string | null
  lines_added: number
  lines_removed: number
  files_changed: number
  context_usage: number
  branch: string
  is_archived: boolean
  subtitle: string
}

// 项目统计
export interface ProjectStats {
  name: string
  path: string
  chat_count: number
  lines_added: number
  lines_removed: number
  files_changed: number
  chats: ChatSession[]
}

// 工作区信息
export interface WorkspaceInfo {
  id: string
  created_at: string
  projects: string[]
  chat_count: number
  lines_added: number
  lines_removed: number
  files_changed: number
  recent_chats: ChatSession[]
  is_multi_project: boolean
}

// 概览统计
export interface OverviewStats {
  total_projects: number
  total_chats: number
  total_lines_added: number
  total_lines_removed: number
  net_lines: number
  total_files_changed: number
  agent_mode_count: number
  chat_mode_count: number
}

// 分析结果
export interface AnalysisResult {
  storage: StorageInfo
  overview: OverviewStats
  database: DatabaseStats
  projects: ProjectStats[]
  workspaces: WorkspaceInfo[]
}

// 垃圾桶项目
export interface TrashItem {
  id: number
  chat_id: string
  chat_name: string
  project_path: string
  mode: string
  lines_added: number
  lines_removed: number
  files_changed: number
  deleted_at: string
  original_data: string
}

// Tab 类型
export type TabType = 'overview' | 'storage' | 'projects' | 'workspaces' | 'database' | 'trash'

// 排序字段类型
export type SortField = 
  | 'files_changed' 
  | 'lines_added' 
  | 'lines_removed' 
  | 'net_lines' 
  | 'updated_at' 
  | 'created_at' 
  | 'context_usage' 
  | 'name'

export type SortOrder = 'asc' | 'desc'

// 项目排序字段
export type ProjectSortField = 
  | 'lines_added' 
  | 'lines_removed' 
  | 'chat_count' 
  | 'files_changed' 
  | 'name'
