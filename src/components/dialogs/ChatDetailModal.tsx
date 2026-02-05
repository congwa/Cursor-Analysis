/**
 * 会话详情弹窗组件
 */
import { 
  Bot, 
  MessageCircle, 
  Clock, 
  GitBranch, 
  Layers, 
  Code, 
  Trash2, 
  FileCode, 
  FolderOpen, 
  Archive 
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import type { ChatSession } from '@/types'

interface ChatDetailModalProps {
  chat: ChatSession | null
  projectName?: string
  open: boolean
  onClose: () => void
  onDelete?: () => void
}

export function ChatDetailModal({
  chat,
  projectName,
  open,
  onClose,
  onDelete,
}: ChatDetailModalProps) {
  if (!chat) return null

  const isAgent = chat.mode === 'agent'
  const netLines = chat.lines_added - chat.lines_removed

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                'gap-1',
                isAgent 
                  ? 'bg-agent/20 text-agent border-agent/50' 
                  : 'bg-chat/20 text-chat border-chat/50'
              )}
            >
              {isAgent ? <Bot size={14} /> : <MessageCircle size={14} />}
              {isAgent ? 'Agent' : 'Chat'}
            </Badge>
            <span className="text-foreground truncate">
              {chat.name || 'Unnamed Session'}
            </span>
            {chat.is_archived && (
              <Badge variant="secondary" className="gap-1">
                <Archive size={12} /> 已归档
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 项目信息 */}
          {projectName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderOpen size={16} />
              <span>{projectName}</span>
            </div>
          )}

          {/* 时间和分支 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Clock size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">创建时间</p>
                <p className="text-sm text-foreground">{chat.created_at || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Clock size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">更新时间</p>
                <p className="text-sm text-foreground">{chat.updated_at || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <GitBranch size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">分支</p>
                <p className="text-sm text-foreground">{chat.branch || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Layers size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">上下文使用</p>
                <p className="text-sm text-foreground">
                  {chat.context_usage > 0 ? `${(chat.context_usage * 100).toFixed(1)}%` : '-'}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* 代码统计 */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">代码统计</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-success/10 border border-success/20 rounded-lg">
                <Code size={20} className="mx-auto text-success mb-1" />
                <p className="text-lg font-semibold text-success">
                  +{formatNumber(chat.lines_added)}
                </p>
                <p className="text-xs text-muted-foreground">添加行数</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Trash2 size={20} className="mx-auto text-destructive mb-1" />
                <p className="text-lg font-semibold text-destructive">
                  -{formatNumber(chat.lines_removed)}
                </p>
                <p className="text-xs text-muted-foreground">删除行数</p>
              </div>
              <div className="text-center p-3 bg-info/10 border border-info/20 rounded-lg">
                <FileCode size={20} className="mx-auto text-info mb-1" />
                <p className="text-lg font-semibold text-info">
                  {formatNumber(chat.files_changed)}
                </p>
                <p className="text-xs text-muted-foreground">变更文件</p>
              </div>
              <div className="text-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <Code size={20} className="mx-auto text-primary mb-1" />
                <p className="text-lg font-semibold text-primary">
                  {netLines >= 0 ? '+' : ''}{formatNumber(netLines)}
                </p>
                <p className="text-xs text-muted-foreground">净增行数</p>
              </div>
            </div>
          </div>

          {/* 描述 */}
          {chat.subtitle && (
            <>
              <Separator className="bg-border" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">会话描述</h4>
                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                  {chat.subtitle}
                </p>
              </div>
            </>
          )}

          {/* ID */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">会话 ID</p>
            <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded font-mono">
              {chat.id}
            </code>
          </div>

          {/* 删除按钮 */}
          {onDelete && (
            <>
              <Separator className="bg-border" />
              <Button 
                variant="destructive" 
                className="w-full gap-2"
                onClick={onDelete}
              >
                <Trash2 size={16} /> 删除此会话
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
