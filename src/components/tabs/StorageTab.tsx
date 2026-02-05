/**
 * 存储 Tab 组件
 */
import { HardDrive, Database, FolderOpen, Lightbulb } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/common/StatCard'
import { formatSize } from '@/lib/format'
import { chartColors } from '@/design-system/tokens'
import type { AnalysisResult } from '@/types'

interface StorageTabProps {
  data: AnalysisResult
}

export function StorageTab({ data }: StorageTabProps) {
  const storageChartData = [
    {
      name: 'globalStorage',
      size: data.storage.global_storage_size,
      label: data.storage.global_storage_size_human,
    },
    {
      name: 'History',
      size: data.storage.history_size,
      label: data.storage.history_size_human,
    },
    {
      name: 'workspaceStorage',
      size: data.storage.workspace_storage_size,
      label: data.storage.workspace_storage_size_human,
    },
  ]

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={HardDrive}
          title="总存储"
          value={data.storage.total_size_human}
          color={chartColors[0]}
        />
        <StatCard
          icon={Database}
          title="globalStorage"
          value={data.storage.global_storage_size_human}
          subtitle="扩展和状态数据"
          color={chartColors[1]}
        />
        <StatCard
          icon={FolderOpen}
          title="History"
          value={data.storage.history_size_human}
          subtitle="文件编辑历史"
          color={chartColors[2]}
        />
        <StatCard
          icon={FolderOpen}
          title="workspaceStorage"
          value={data.storage.workspace_storage_size_human}
          subtitle="工作区数据"
          color={chartColors[3]}
        />
      </div>

      {/* 存储分布图表 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">存储空间分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storageChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="name" stroke="#8b949e" />
              <YAxis tickFormatter={(v) => formatSize(v)} stroke="#8b949e" />
              <Tooltip
                formatter={(v) => formatSize(Number(v))}
                contentStyle={{
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="size" fill={chartColors[0]}>
                {storageChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 清理建议 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Lightbulb size={18} /> 清理建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <span className="font-medium text-foreground">state.vscdb.backup</span>
                <span className="text-muted-foreground">
                  : {formatSize(data.storage.state_vscdb_backup_size)} - 可以安全删除
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <span className="font-medium text-foreground">History</span>
                <span className="text-muted-foreground">
                  : {data.storage.history_size_human} - 可删除超过30天的历史
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <span className="font-medium text-foreground">state.vscdb</span>
                <span className="text-muted-foreground">
                  : {formatSize(data.storage.state_vscdb_size)} - 包含所有对话历史
                </span>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
