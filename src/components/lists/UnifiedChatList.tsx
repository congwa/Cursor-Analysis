/**
 * 统一会话列表组件 - 支持批量选择、隐藏无修改、任意维度排序
 */
import { useState, useEffect, useMemo } from 'react'
import {
  Bot,
  MessageCircle,
  Clock,
  GitBranch,
  Archive,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { ChatSession, SortField, SortOrder } from '@/types'

interface UnifiedChatListProps {
  chats: ChatSession[]
  projectName: string
  projectPath: string
  onChatClick: (chat: ChatSession, projectName: string) => void
  onDeleteChat: (projectPath: string, chatId: string) => void
  onDeleteBatch: (projectPath: string, chatIds: string[]) => void
}

const ITEMS_PER_PAGE = 20

export function UnifiedChatList({
  chats,
  projectName,
  projectPath,
  onChatClick,
  onDeleteChat,
  onDeleteBatch,
}: UnifiedChatListProps) {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState<string>('all')
  const [archiveFilter, setArchiveFilter] = useState<string>('all')
  const [hideZeroChanges, setHideZeroChanges] = useState(true)
  const [sortBy, setSortBy] = useState<SortField>('files_changed')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<ChatSession | null>(null)
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false)

  // 重置页码和选择当过滤/排序条件改变时
  useEffect(() => {
    setPage(1)
    setSelectedIds(new Set())
  }, [searchTerm, modeFilter, archiveFilter, hideZeroChanges, sortBy, sortOrder])

  const filteredAndSortedChats = useMemo(() => {
    let result = chats.filter((chat) => {
      if (hideZeroChanges && chat.files_changed === 0 && chat.lines_added === 0 && chat.lines_removed === 0) {
        return false
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchName = chat.name.toLowerCase().includes(search)
        const matchSubtitle = chat.subtitle.toLowerCase().includes(search)
        if (!matchName && !matchSubtitle) return false
      }
      if (modeFilter !== 'all' && chat.mode !== modeFilter) return false
      if (archiveFilter === 'archived' && !chat.is_archived) return false
      if (archiveFilter === 'active' && chat.is_archived) return false
      return true
    })

    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'files_changed':
          cmp = a.files_changed - b.files_changed
          break
        case 'lines_added':
          cmp = a.lines_added - b.lines_added
          break
        case 'lines_removed':
          cmp = a.lines_removed - b.lines_removed
          break
        case 'net_lines':
          cmp = (a.lines_added - a.lines_removed) - (b.lines_added - b.lines_removed)
          break
        case 'updated_at':
          cmp = (a.updated_at || '').localeCompare(b.updated_at || '')
          break
        case 'created_at':
          cmp = (a.created_at || '').localeCompare(b.created_at || '')
          break
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'context_usage':
          cmp = a.context_usage - b.context_usage
          break
        default:
          cmp = 0
      }
      return sortOrder === 'desc' ? -cmp : cmp
    })

    return result
  }, [chats, searchTerm, modeFilter, archiveFilter, hideZeroChanges, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedChats.length / ITEMS_PER_PAGE)
  const paginatedChats = filteredAndSortedChats.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  const handleDeleteClick = (e: React.MouseEvent, chat: ChatSession) => {
    e.stopPropagation()
    setDeleteConfirm(chat)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDeleteChat(projectPath, deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const toggleSelect = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(chatId)) {
        next.delete(chatId)
      } else {
        next.add(chatId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedChats.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedChats.map((c) => c.id)))
    }
  }

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filteredAndSortedChats.map((c) => c.id)))
  }

  const handleBatchDelete = () => {
    if (selectedIds.size > 0) {
      setBatchDeleteConfirm(true)
    }
  }

  const confirmBatchDelete = () => {
    onDeleteBatch(projectPath, Array.from(selectedIds))
    setSelectedIds(new Set())
    setBatchDeleteConfirm(false)
  }

  const isAllPageSelected = paginatedChats.length > 0 && paginatedChats.every((c) => selectedIds.has(c.id))

  return (
    <div className="space-y-4">
      {/* 搜索和过滤栏 */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索会话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground"
          >
            <option value="all">全部模式</option>
            <option value="agent">Agent</option>
            <option value="chat">Chat</option>
          </select>
          <select
            value={archiveFilter}
            onChange={(e) => setArchiveFilter(e.target.value)}
            className="h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground"
          >
            <option value="all">全部状态</option>
            <option value="active">活跃</option>
            <option value="archived">已归档</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox
              checked={hideZeroChanges}
              onCheckedChange={(checked) => setHideZeroChanges(!!checked)}
            />
            隐藏无修改
          </label>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground"
          >
            <option value="files_changed">变更文件数</option>
            <option value="lines_added">添加行数</option>
            <option value="lines_removed">删除行数</option>
            <option value="net_lines">净增行数</option>
            <option value="updated_at">更新时间</option>
            <option value="created_at">创建时间</option>
            <option value="context_usage">上下文使用</option>
            <option value="name">名称</option>
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="h-9 w-9"
            title={sortOrder === 'desc' ? '降序' : '升序'}
          >
            {sortOrder === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
          </Button>
        </div>
      </div>

      {/* 批量操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={isAllPageSelected}
              onCheckedChange={toggleSelectAll}
            />
            本页全选
          </label>
          {filteredAndSortedChats.length > paginatedChats.length && (
            <Button variant="link" size="sm" onClick={selectAllFiltered} className="text-primary">
              选择全部 {filteredAndSortedChats.length} 项
            </Button>
          )}
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">已选 {selectedIds.size} 项</span>
          )}
        </div>
        {selectedIds.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBatchDelete} className="gap-1">
            <Trash2 size={14} /> 批量删除 ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* 统计信息 */}
      <p className="text-sm text-muted-foreground">
        显示 {paginatedChats.length} / {filteredAndSortedChats.length} 个会话
        {filteredAndSortedChats.length !== chats.length && ` (总共 ${chats.length} 个)`}
      </p>

      {/* 会话列表 */}
      <div className="space-y-2">
        {paginatedChats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            没有找到符合条件的会话
          </div>
        ) : (
          paginatedChats.map((chat) => (
            <Card
              key={chat.id}
              className={cn(
                'p-3 cursor-pointer bg-card border-border hover:border-primary/50 transition-colors',
                selectedIds.has(chat.id) && 'border-primary bg-primary/5'
              )}
              onClick={() => onChatClick(chat, projectName)}
            >
              <div className="flex items-start gap-3">
                <div onClick={(e) => toggleSelect(e, chat.id)} className="pt-1">
                  <Checkbox checked={selectedIds.has(chat.id)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        'gap-1',
                        chat.mode === 'agent'
                          ? 'bg-agent/20 text-agent border-agent/50'
                          : 'bg-chat/20 text-chat border-chat/50'
                      )}
                    >
                      {chat.mode === 'agent' ? <Bot size={12} /> : <MessageCircle size={12} />}
                    </Badge>
                    <span className="text-sm font-medium text-foreground truncate">
                      {chat.name || 'Unnamed'}
                    </span>
                    {chat.is_archived && (
                      <Archive size={14} className="text-muted-foreground" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e) => handleDeleteClick(e, chat)}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    {chat.updated_at && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {chat.updated_at}
                      </span>
                    )}
                    {chat.branch && (
                      <span className="flex items-center gap-1">
                        <GitBranch size={12} /> {chat.branch}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-success/20 text-success border-0">
                      +{formatNumber(chat.lines_added)}
                    </Badge>
                    <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0">
                      -{formatNumber(chat.lines_removed)}
                    </Badge>
                    <Badge variant="secondary" className="bg-info/20 text-info border-0">
                      {chat.files_changed} 文件
                    </Badge>
                  </div>
                  {chat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      {chat.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title="删除会话"
        message={`确定要删除会话 "${deleteConfirm?.name || 'Unnamed'}" 吗？此操作不可恢复。`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <ConfirmDialog
        open={batchDeleteConfirm}
        title="批量删除会话"
        message={`确定要删除选中的 ${selectedIds.size} 个会话吗？此操作不可恢复。`}
        onConfirm={confirmBatchDelete}
        onCancel={() => setBatchDeleteConfirm(false)}
      />
    </div>
  )
}
