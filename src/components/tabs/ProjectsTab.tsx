/**
 * 项目 Tab 组件
 */
import { useMemo, useState } from 'react'
import { Trash2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ProjectRow } from '@/components/lists/ProjectRow'
import { useAppStore } from '@/stores/appStore'
import type { ChatSession, ProjectSortField } from '@/types'

const PROJECTS_PER_PAGE = 20

interface ProjectsTabProps {
  onChatClick: (chat: ChatSession, projectName: string) => void
}

export function ProjectsTab({ onChatClick }: ProjectsTabProps) {
  const {
    data,
    projectPage,
    projectSort,
    selectedProjectPaths,
    setProjectPage,
    setProjectSort,
    toggleProjectSelection,
    selectAllProjects,
    clearProjectSelection,
    deleteProjectChats,
    deleteProjectsBatch,
    deleteChat,
    deleteChatsBatch,
  } = useAppStore()

  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false)

  const sortedProjects = useMemo(() => {
    if (!data) return []
    const projects = [...data.projects]
    switch (projectSort) {
      case 'lines_added':
        return projects.sort((a, b) => b.lines_added - a.lines_added)
      case 'lines_removed':
        return projects.sort((a, b) => b.lines_removed - a.lines_removed)
      case 'chat_count':
        return projects.sort((a, b) => b.chat_count - a.chat_count)
      case 'files_changed':
        return projects.sort((a, b) => b.files_changed - a.files_changed)
      case 'name':
        return projects.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return projects
    }
  }, [data?.projects, projectSort])

  const totalPages = Math.ceil(sortedProjects.length / PROJECTS_PER_PAGE)
  const paginatedProjects = sortedProjects.slice(
    (projectPage - 1) * PROJECTS_PER_PAGE,
    projectPage * PROJECTS_PER_PAGE
  )

  // 计算选中项目的总会话数
  const selectedChatsCount = useMemo(() => {
    if (!data) return 0
    return data.projects
      .filter(p => selectedProjectPaths.has(p.path))
      .reduce((sum, p) => sum + p.chat_count, 0)
  }, [data, selectedProjectPaths])

  // 本页全选状态
  const isAllPageSelected = paginatedProjects.length > 0 && 
    paginatedProjects.every(p => selectedProjectPaths.has(p.path))

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      // 取消本页选择
      paginatedProjects.forEach(p => {
        if (selectedProjectPaths.has(p.path)) {
          toggleProjectSelection(p.path)
        }
      })
    } else {
      // 选择本页
      paginatedProjects.forEach(p => {
        if (!selectedProjectPaths.has(p.path)) {
          toggleProjectSelection(p.path)
        }
      })
    }
  }

  const handleSelectAll = () => {
    selectAllProjects(sortedProjects.map(p => p.path))
  }

  const handleBatchDelete = () => {
    if (selectedProjectPaths.size > 0) {
      setBatchDeleteConfirm(true)
    }
  }

  const confirmBatchDelete = async () => {
    setBatchDeleteConfirm(false)
    await deleteProjectsBatch(Array.from(selectedProjectPaths))
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <FolderOpen size={20} /> 项目列表 ({data.projects.length} 个)
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">排序:</label>
          <select
            value={projectSort}
            onChange={(e) => setProjectSort(e.target.value as ProjectSortField)}
            className="h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground"
          >
            <option value="lines_added">添加代码量</option>
            <option value="lines_removed">删除代码量</option>
            <option value="chat_count">会话数量</option>
            <option value="files_changed">变更文件数</option>
            <option value="name">项目名称</option>
          </select>
        </div>
      </div>

      {/* 批量操作栏 */}
      <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={isAllPageSelected}
              onCheckedChange={toggleSelectAllPage}
            />
            本页全选
          </label>
          {sortedProjects.length > paginatedProjects.length && (
            <Button variant="link" size="sm" onClick={handleSelectAll} className="text-primary p-0">
              选择全部 {sortedProjects.length} 个项目
            </Button>
          )}
          {selectedProjectPaths.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                已选 {selectedProjectPaths.size} 个项目 ({selectedChatsCount} 个会话)
              </span>
              <Button variant="link" size="sm" onClick={clearProjectSelection} className="text-muted-foreground p-0">
                取消选择
              </Button>
            </>
          )}
        </div>
        {selectedProjectPaths.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBatchDelete} className="gap-1">
            <Trash2 size={14} /> 批量删除 ({selectedProjectPaths.size})
          </Button>
        )}
      </div>

      {/* 项目列表 */}
      <div className="space-y-3">
        {paginatedProjects.map((project, i) => (
          <ProjectRow
            key={project.path}
            project={project}
            rank={(projectPage - 1) * PROJECTS_PER_PAGE + i + 1}
            selected={selectedProjectPaths.has(project.path)}
            onToggleSelect={() => toggleProjectSelection(project.path)}
            onChatClick={onChatClick}
            onDeleteProject={deleteProjectChats}
            onDeleteChat={deleteChat}
            onDeleteBatch={deleteChatsBatch}
          />
        ))}
      </div>

      {/* 分页 */}
      <Pagination
        currentPage={projectPage}
        totalPages={totalPages}
        onPageChange={setProjectPage}
      />

      {/* 批量删除确认 */}
      <ConfirmDialog
        open={batchDeleteConfirm}
        title="批量删除项目"
        message={`确定要删除选中的 ${selectedProjectPaths.size} 个项目的所有 ${selectedChatsCount} 个会话吗？此操作不可恢复。`}
        onConfirm={confirmBatchDelete}
        onCancel={() => setBatchDeleteConfirm(false)}
      />
    </div>
  )
}
