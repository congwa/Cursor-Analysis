/**
 * 工作区行组件
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, Trash2, Folder, FolderTree } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { UnifiedChatList } from './UnifiedChatList'
import type { WorkspaceInfo, ChatSession } from '@/types'

interface WorkspaceRowProps {
  workspace: WorkspaceInfo
  selected?: boolean
  onToggleSelect?: () => void
  onChatClick: (chat: ChatSession, projectName: string) => void
  onDeleteChat: (projectPath: string, chatId: string) => void
  onDeleteBatch: (projectPath: string, chatIds: string[]) => void
  onDeleteWorkspace: (workspaceId: string) => void
}

export function WorkspaceRow({
  workspace,
  selected = false,
  onToggleSelect,
  onChatClick,
  onDeleteChat,
  onDeleteBatch,
  onDeleteWorkspace,
}: WorkspaceRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const projectPath = workspace.projects[0] || workspace.id
  const projectName = workspace.projects[0]?.split('/').pop() || 'Unknown'

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirm(true)
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelect?.()
  }

  const confirmDelete = () => {
    onDeleteWorkspace(workspace.id)
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

        {/* 工作区图标 */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-agent/20 flex items-center justify-center">
          {workspace.is_multi_project ? (
            <FolderTree size={20} className="text-agent" />
          ) : (
            <Folder size={20} className="text-agent" />
          )}
        </div>

        {/* 工作区信息 */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">
            {workspace.is_multi_project ? '多项目' : '单项目'} {workspace.id.slice(0, 8)}...
          </p>
          {workspace.created_at && (
            <p className="text-xs text-muted-foreground">{workspace.created_at}</p>
          )}
        </div>

        {/* 项目标签 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {workspace.projects.slice(0, 2).map((p, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {p.split('/').pop()}
            </Badge>
          ))}
          {workspace.projects.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{workspace.projects.length - 2}
            </Badge>
          )}
        </div>

        {/* 统计 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="secondary" className="bg-success/20 text-success border-0">
            +{formatNumber(workspace.lines_added)}
          </Badge>
          <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0">
            -{formatNumber(workspace.lines_removed)}
          </Badge>
          <Badge variant="secondary" className="bg-info/20 text-info border-0">
            {workspace.chat_count} 会话
          </Badge>
        </div>

        {/* 删除按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleDeleteClick}
          title="删除工作区所有会话"
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
        <div className="border-t border-border p-4 bg-secondary/30 space-y-4">
          {/* 项目列表 */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">包含项目:</p>
            {workspace.projects.length > 0 ? (
              <ul className="space-y-1">
                {workspace.projects.map((p, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {p.replace('/Users/cong/', '~/')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">(工作区文件已删除)</p>
            )}
          </div>

          {/* 会话列表 */}
          {workspace.recent_chats.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">会话列表:</p>
              <UnifiedChatList
                chats={workspace.recent_chats}
                projectName={projectName}
                projectPath={projectPath}
                onChatClick={onChatClick}
                onDeleteChat={onDeleteChat}
                onDeleteBatch={onDeleteBatch}
              />
            </div>
          )}
        </div>
      )}

      {/* 删除确认 */}
      <ConfirmDialog
        open={deleteConfirm}
        title="删除工作区所有会话"
        message={`确定要删除工作区的所有 ${workspace.chat_count} 个会话吗？此操作不可恢复，但会保存到垃圾桶。`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </Card>
  )
}
