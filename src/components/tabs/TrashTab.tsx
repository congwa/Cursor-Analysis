/**
 * 垃圾桶 Tab 组件
 */
import { Trash2, Bot, MessageCircle, Clock, FolderOpen, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useAppStore } from '@/stores/appStore'

export function TrashTab() {
  const {
    trashItems,
    clearTrashConfirm,
    setClearTrashConfirm,
    clearTrash,
    deleteTrashItem,
  } = useAppStore()

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Trash2 size={20} /> 垃圾桶 ({trashItems.length} 个已删除会话)
        </h2>
        {trashItems.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setClearTrashConfirm(true)}
            className="gap-1"
          >
            <Trash2 size={16} /> 清空垃圾桶
          </Button>
        )}
      </div>

      {/* 垃圾桶内容 */}
      {trashItems.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-foreground">垃圾桶是空的</p>
          <p className="text-sm text-muted-foreground mt-1">
            删除的会话会自动保存到这里
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trashItems.map((item) => (
            <Card key={item.id} className="bg-card border-border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      'gap-1',
                      item.mode === 'agent'
                        ? 'bg-agent/20 text-agent border-agent/50'
                        : 'bg-chat/20 text-chat border-chat/50'
                    )}
                  >
                    {item.mode === 'agent' ? <Bot size={12} /> : <MessageCircle size={12} />}
                  </Badge>
                  <span className="font-medium text-foreground">{item.chat_name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTrashItem(item.id)}
                  title="永久删除"
                >
                  <X size={16} />
                </Button>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> 删除于 {item.deleted_at}
                </span>
                <span className="flex items-center gap-1">
                  <FolderOpen size={12} /> {item.project_path.replace('/Users/cong/', '~/')}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="bg-success/20 text-success border-0">
                  +{formatNumber(item.lines_added)}
                </Badge>
                <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0">
                  -{formatNumber(item.lines_removed)}
                </Badge>
                <Badge variant="secondary" className="bg-info/20 text-info border-0">
                  {item.files_changed} 文件
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 清空确认 */}
      <ConfirmDialog
        open={clearTrashConfirm}
        title="清空垃圾桶"
        message={`确定要永久删除垃圾桶中的 ${trashItems.length} 个会话记录吗？此操作不可恢复。`}
        onConfirm={clearTrash}
        onCancel={() => setClearTrashConfirm(false)}
      />
    </div>
  )
}
