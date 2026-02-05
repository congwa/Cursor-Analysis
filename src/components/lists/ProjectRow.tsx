/**
 * 项目行组件
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { UnifiedChatList } from './UnifiedChatList'
import type { ProjectStats, ChatSession } from '@/types'

interface ProjectRowProps {
  project: ProjectStats
  rank: number
  selected?: boolean
  onToggleSelect?: () => void
  onChatClick: (chat: ChatSession, projectName: string) => void
  onDeleteProject: (projectPath: string) => void
  onDeleteChat: (projectPath: string, chatId: string) => void
  onDeleteBatch: (projectPath: string, chatIds: string[]) => void
}

export function ProjectRow({
  project,
  rank,
  selected = false,
  onToggleSelect,
  onChatClick,
  onDeleteProject,
  onDeleteChat,
  onDeleteBatch,
}: ProjectRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirm(true)
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelect?.()
  }

  const confirmDelete = () => {
    onDeleteProject(project.path)
    setDeleteConfirm(false)
  }

  return (
    <Card className={cn(
      'bg-card border-border overflow-hidden transition-colors',
      selected && 'border-primary bg-primary/5'
    )}>
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Checkbox */}
        {onToggleSelect && (
          <div onClick={handleCheckboxClick} className="flex-shrink-0">
            <Checkbox checked={selected} />
          </div>
        )}

        {/* 排名 */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">#{rank}</span>
        </div>

        {/* 项目信息 */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{project.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {project.path.replace('/Users/cong/', '~/')}
          </p>
        </div>

        {/* 统计 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="secondary" className="bg-success/20 text-success border-0">
            +{formatNumber(project.lines_added)}
          </Badge>
          <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0">
            -{formatNumber(project.lines_removed)}
          </Badge>
          <Badge variant="secondary" className="bg-info/20 text-info border-0">
            {project.chat_count} 会话
          </Badge>
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
            {project.files_changed} 文件
          </Badge>
        </div>

        {/* 删除按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleDeleteClick}
          title="删除项目所有会话"
        >
          <Trash2 size={16} />
        </Button>

        {/* 展开图标 */}
        <div className="flex-shrink-0 text-muted-foreground">
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>

      {/* 展开内容 */}
      {expanded && (
        <div className="border-t border-border p-4 bg-secondary/30">
          <UnifiedChatList
            chats={project.chats}
            projectName={project.name}
            projectPath={project.path}
            onChatClick={onChatClick}
            onDeleteChat={onDeleteChat}
            onDeleteBatch={onDeleteBatch}
          />
        </div>
      )}

      {/* 删除确认 */}
      <ConfirmDialog
        open={deleteConfirm}
        title="删除项目所有会话"
        message={`确定要删除项目 "${project.name}" 的所有 ${project.chat_count} 个会话吗？此操作不可恢复。`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </Card>
  )
}
