/**
 * 全局状态管理 - Zustand Store
 */
import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { 
  AnalysisResult, 
  TrashItem, 
  ChatSession, 
  TabType, 
  ProjectSortField 
} from '@/types'

interface SelectedChat {
  chat: ChatSession
  projectName: string
}

interface DeleteProgress {
  current: number
  total: number
  currentName: string
}

interface AppState {
  // 数据状态
  data: AnalysisResult | null
  trashItems: TrashItem[]
  appVersion: string
  
  // UI 状态
  loading: boolean
  deleting: boolean
  deleteProgress: DeleteProgress | null
  error: string | null
  activeTab: TabType
  
  // 项目分页和排序
  projectPage: number
  projectSort: ProjectSortField
  
  // 项目多选
  selectedProjectPaths: Set<string>
  
  // 选中的会话
  selectedChat: SelectedChat | null
  
  // 确认弹窗
  clearTrashConfirm: boolean
  
  // Actions
  setActiveTab: (tab: TabType) => void
  setProjectPage: (page: number) => void
  setProjectSort: (sort: ProjectSortField) => void
  setSelectedChat: (chat: SelectedChat | null) => void
  setClearTrashConfirm: (confirm: boolean) => void
  
  // 项目选择 Actions
  toggleProjectSelection: (path: string) => void
  selectAllProjects: (paths: string[]) => void
  clearProjectSelection: () => void
  
  // 异步 Actions
  loadData: () => Promise<void>
  loadTrash: () => Promise<void>
  deleteChat: (projectPath: string, chatId: string) => Promise<void>
  deleteChatsBatch: (projectPath: string, chatIds: string[]) => Promise<void>
  deleteProjectChats: (projectPath: string) => Promise<void>
  deleteProjectsBatch: (projectPaths: string[]) => Promise<void>
  deleteWorkspaceChats: (workspaceId: string) => Promise<void>
  deleteWorkspacesBatch: (workspaceIds: string[]) => Promise<void>
  clearTrash: () => Promise<void>
  deleteTrashItem: (trashId: number) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  data: null,
  trashItems: [],
  appVersion: '1.0.0',
  loading: true,
  deleting: false,
  deleteProgress: null,
  error: null,
  activeTab: 'overview',
  projectPage: 1,
  projectSort: 'lines_added',
  selectedProjectPaths: new Set(),
  selectedChat: null,
  clearTrashConfirm: false,
  
  // 简单 Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setProjectPage: (page) => set({ projectPage: page }),
  setProjectSort: (sort) => set({ projectSort: sort, projectPage: 1 }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setClearTrashConfirm: (confirm) => set({ clearTrashConfirm: confirm }),
  
  // 项目选择 Actions
  toggleProjectSelection: (path) => {
    const current = get().selectedProjectPaths
    const next = new Set(current)
    if (next.has(path)) {
      next.delete(path)
    } else {
      next.add(path)
    }
    set({ selectedProjectPaths: next })
  },
  
  selectAllProjects: (paths) => {
    set({ selectedProjectPaths: new Set(paths) })
  },
  
  clearProjectSelection: () => {
    set({ selectedProjectPaths: new Set() })
  },
  
  // 加载数据
  loadData: async () => {
    set({ loading: true, error: null })
    try {
      const [result, version, trash] = await Promise.all([
        invoke<AnalysisResult>('get_full_analysis'),
        invoke<string>('get_app_version'),
        invoke<TrashItem[]>('get_trash_items'),
      ])
      set({ data: result, appVersion: version, trashItems: trash })
    } catch (e) {
      set({ error: String(e) })
    } finally {
      set({ loading: false })
    }
  },
  
  // 加载垃圾桶
  loadTrash: async () => {
    try {
      const trash = await invoke<TrashItem[]>('get_trash_items')
      set({ trashItems: trash })
    } catch (e) {
      console.error('加载垃圾桶失败:', e)
    }
  },
  
  // 删除单个会话
  deleteChat: async (projectPath, chatId) => {
    set({ deleting: true, deleteProgress: null })
    try {
      await invoke('delete_chat', { projectPath, chatId })
      await get().loadData()
    } catch (e) {
      alert('删除失败: ' + String(e))
    } finally {
      set({ deleting: false, deleteProgress: null })
    }
  },
  
  // 批量删除会话
  deleteChatsBatch: async (projectPath, chatIds) => {
    set({ deleting: true, deleteProgress: null })
    try {
      await invoke('delete_chats_batch', { projectPath, chatIds })
      await get().loadData()
    } catch (e) {
      alert('批量删除失败: ' + String(e))
    } finally {
      set({ deleting: false, deleteProgress: null })
    }
  },
  
  // 删除项目所有会话
  deleteProjectChats: async (projectPath) => {
    set({ deleting: true, deleteProgress: null })
    try {
      await invoke('delete_project_chats', { projectPath })
      await get().loadData()
    } catch (e) {
      alert('删除失败: ' + String(e))
    } finally {
      set({ deleting: false, deleteProgress: null })
    }
  },
  
  // 批量删除多个项目 (带进度)
  deleteProjectsBatch: async (projectPaths) => {
    const data = get().data
    if (!data) return
    
    set({ deleting: true, deleteProgress: { current: 0, total: projectPaths.length, currentName: '' } })
    
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < projectPaths.length; i++) {
      const path = projectPaths[i]
      const project = data.projects.find(p => p.path === path)
      const projectName = project?.name || path.split('/').pop() || 'Unknown'
      
      set({ 
        deleteProgress: { 
          current: i + 1, 
          total: projectPaths.length, 
          currentName: projectName 
        } 
      })
      
      try {
        await invoke('delete_project_chats', { projectPath: path })
        successCount++
      } catch (e) {
        console.error(`删除项目 ${projectName} 失败:`, e)
        failCount++
      }
      
      // 给 UI 一点时间更新
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // 清除选择
    set({ selectedProjectPaths: new Set() })
    
    // 重新加载数据
    await get().loadData()
    
    set({ deleting: false, deleteProgress: null })
    
    if (failCount > 0) {
      alert(`删除完成: 成功 ${successCount} 个, 失败 ${failCount} 个`)
    }
  },
  
  // 删除工作区所有会话
  deleteWorkspaceChats: async (workspaceId) => {
    set({ deleting: true, deleteProgress: null })
    try {
      await invoke('delete_workspace_chats', { workspaceId })
      await get().loadData()
    } catch (e) {
      alert('删除失败: ' + String(e))
    } finally {
      set({ deleting: false, deleteProgress: null })
    }
  },
  
  // 批量删除多个工作区 (带进度)
  deleteWorkspacesBatch: async (workspaceIds) => {
    const data = get().data
    if (!data) return
    
    set({ deleting: true, deleteProgress: { current: 0, total: workspaceIds.length, currentName: '' } })
    
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < workspaceIds.length; i++) {
      const id = workspaceIds[i]
      const workspace = data.workspaces.find(w => w.id === id)
      const workspaceName = workspace?.projects[0]?.split('/').pop() || id.slice(0, 8)
      
      set({ 
        deleteProgress: { 
          current: i + 1, 
          total: workspaceIds.length, 
          currentName: workspaceName 
        } 
      })
      
      try {
        await invoke('delete_workspace_chats', { workspaceId: id })
        successCount++
      } catch (e) {
        console.error(`删除工作区 ${workspaceName} 失败:`, e)
        failCount++
      }
      
      // 给 UI 一点时间更新
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // 重新加载数据
    await get().loadData()
    
    set({ deleting: false, deleteProgress: null })
    
    if (failCount > 0) {
      alert(`删除完成: 成功 ${successCount} 个, 失败 ${failCount} 个`)
    }
  },
  
  // 清空垃圾桶
  clearTrash: async () => {
    try {
      await invoke('clear_trash')
      set({ trashItems: [], clearTrashConfirm: false })
    } catch (e) {
      alert('清空垃圾桶失败: ' + String(e))
    }
  },
  
  // 删除垃圾桶单项
  deleteTrashItem: async (trashId) => {
    try {
      await invoke('delete_trash_item', { trashId })
      await get().loadTrash()
    } catch (e) {
      alert('删除失败: ' + String(e))
    }
  },
}))
