/**
 * 工作区 Tab 组件
 */
import { useState, useMemo } from 'react'
import { Layers, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { WorkspaceRow } from '@/components/lists/WorkspaceRow'
import { useAppStore } from '@/stores/appStore'
import type { ChatSession } from '@/types'

interface WorkspacesTabProps {
  onChatClick: (chat: ChatSession, projectName: string) => void
}

export function WorkspacesTab({ onChatClick }: WorkspacesTabProps) {
  const {
    data,
    deleteChat,
    deleteChatsBatch,
    deleteWorkspaceChats,
    deleteWorkspacesBatch,
  } = useAppStore()

  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<Set<string>>(new Set())
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false)

  if (!data) return null

  const workspacesWithChats = data.workspaces.filter((w) => w.chat_count > 0)

  // 计算选中工作区的总会话数
  const selectedChatsCount = useMemo(() => {
    return workspacesWithChats
      .filter(w => selectedWorkspaceIds.has(w.id))
      .reduce((sum, w) => sum + w.chat_count, 0)
  }, [workspacesWithChats, selectedWorkspaceIds])

  // 全选状态
  const isAllSelected = workspacesWithChats.length > 0 && 
    workspacesWithChats.every(w => selectedWorkspaceIds.has(w.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedWorkspaceIds(new Set())
    } else {
      setSelectedWorkspaceIds(new Set(workspacesWithChats.map(w => w.id)))
    }
  }

  const toggleSelection = (id: string) => {
    const next = new Set(selectedWorkspaceIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedWorkspaceIds(next)
  }

  const handleBatchDelete = () => {
    if (selectedWorkspaceIds.size > 0) {
      setBatchDeleteConfirm(true)
    }
  }

  const confirmBatchDelete = async () => {
    setBatchDeleteConfirm(false)
    await deleteWorkspacesBatch(Array.from(selectedWorkspaceIds))
    setSelectedWorkspaceIds(new Set())
  }

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <Layers size={20} /> 工作区列表 ({workspacesWithChats.length} 个)
      </h2>

      {/* 批量操作栏 */}
      {workspacesWithChats.length > 0 && (
        <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
              全选
            </label>
            {selectedWorkspaceIds.size > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  已选 {selectedWorkspaceIds.size} 个工作区 ({selectedChatsCount} 个会话)
                </span>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setSelectedWorkspaceIds(new Set())} 
                  className="text-muted-foreground p-0"
                >
                  取消选择
                </Button>
              </>
            )}
          </div>
          {selectedWorkspaceIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBatchDelete} className="gap-1">
              <Trash2 size={14} /> 批量删除 ({selectedWorkspaceIds.size})
            </Button>
          )}
        </div>
      )}

      {/* 工作区列表 */}
      <div className="space-y-3">
        {workspacesWithChats.map((workspace) => (
          <WorkspaceRow
            key={workspace.id}
            workspace={workspace}
            selected={selectedWorkspaceIds.has(workspace.id)}
            onToggleSelect={() => toggleSelection(workspace.id)}
            onChatClick={onChatClick}
            onDeleteChat={deleteChat}
            onDeleteBatch={deleteChatsBatch}
            onDeleteWorkspace={deleteWorkspaceChats}
          />
        ))}
      </div>

      {workspacesWithChats.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          没有找到包含会话的工作区
        </div>
      )}

      {/* 批量删除确认 */}
      <ConfirmDialog
        open={batchDeleteConfirm}
        title="批量删除工作区"
        message={`确定要删除选中的 ${selectedWorkspaceIds.size} 个工作区的所有 ${selectedChatsCount} 个会话吗？此操作不可恢复。`}
        onConfirm={confirmBatchDelete}
        onCancel={() => setBatchDeleteConfirm(false)}
      />
    </div>
  )
}
