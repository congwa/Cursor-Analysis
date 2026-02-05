/**
 * Cursor Analysis - 主应用组件
 * 
 * macOS Cursor IDE 使用分析工具
 */
import { useEffect } from 'react'
import { 
  RefreshCw, 
  Search,
  BarChart3,
  HardDrive,
  FolderOpen,
  Layers,
  Database,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatDetailModal } from '@/components/dialogs/ChatDetailModal'
import {
  OverviewTab,
  StorageTab,
  DatabaseTab,
  ProjectsTab,
  WorkspacesTab,
  TrashTab,
} from '@/components/tabs'
import { useAppStore } from '@/stores/appStore'
import type { TabType, ChatSession } from '@/types'

export default function App() {
  const {
    data,
    loading,
    deleting,
    deleteProgress,
    error,
    activeTab,
    appVersion,
    trashItems,
    selectedChat,
    setActiveTab,
    setSelectedChat,
    loadData,
    loadTrash,
  } = useAppStore()

  // 初始化加载数据
  useEffect(() => {
    loadData()
  }, [loadData])

  // 处理会话点击
  const handleChatClick = (chat: ChatSession, projectName: string) => {
    setSelectedChat({ chat, projectName })
  }

  // 关闭弹窗
  const closeModal = () => {
    setSelectedChat(null)
  }

  // 切换 Tab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType)
    if (tab === 'trash') {
      loadTrash()
    }
  }

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">正在分析 Cursor 数据...</p>
        </div>
      </div>
    )
  }

  // 删除进度遮罩 (不阻塞页面，显示在顶部)
  const DeleteProgressOverlay = deleting && deleteProgress ? (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 shadow-lg">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="text-foreground font-medium">
            正在删除 ({deleteProgress.current}/{deleteProgress.total})
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-2 truncate">
          当前: {deleteProgress.currentName}
        </p>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(deleteProgress.current / deleteProgress.total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  ) : null

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">加载失败: {error}</p>
          <Button onClick={loadData}>重试</Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 删除进度条 */}
      {DeleteProgressOverlay}
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Cursor Analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cursor IDE 使用分析工具
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw size={16} /> 刷新
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 size={16} /> 概览
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HardDrive size={16} /> 存储
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FolderOpen size={16} /> 项目
            </TabsTrigger>
            <TabsTrigger value="workspaces" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Layers size={16} /> 工作区
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database size={16} /> 数据库
            </TabsTrigger>
            <TabsTrigger value="trash" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trash2 size={16} /> 垃圾桶
              {trashItems.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                  {trashItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <OverviewTab data={data} />
          </TabsContent>

          <TabsContent value="storage" className="mt-0">
            <StorageTab data={data} />
          </TabsContent>

          <TabsContent value="projects" className="mt-0">
            <ProjectsTab onChatClick={handleChatClick} />
          </TabsContent>

          <TabsContent value="workspaces" className="mt-0">
            <WorkspacesTab onChatClick={handleChatClick} />
          </TabsContent>

          <TabsContent value="database" className="mt-0">
            <DatabaseTab data={data} />
          </TabsContent>

          <TabsContent value="trash" className="mt-0">
            <TrashTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-3 text-center">
        <p className="text-sm text-muted-foreground">
          Cursor Analysis v{appVersion} - Made for macOS
        </p>
      </footer>

      {/* 会话详情弹窗 */}
      <ChatDetailModal
        chat={selectedChat?.chat ?? null}
        projectName={selectedChat?.projectName}
        open={!!selectedChat}
        onClose={closeModal}
      />
    </div>
  )
}
