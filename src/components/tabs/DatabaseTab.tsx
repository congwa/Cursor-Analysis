/**
 * 数据库 Tab 组件
 */
import { Database, MessageSquare, Bot } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCard } from '@/components/common/StatCard'
import { formatNumber, formatSize } from '@/lib/format'
import { chartColors } from '@/design-system/tokens'
import type { AnalysisResult } from '@/types'

interface DatabaseTabProps {
  data: AnalysisResult
}

export function DatabaseTab({ data }: DatabaseTabProps) {
  const databaseChartData = [
    { name: '对话气泡', value: data.database.bubble_size, count: data.database.bubble_count },
    { name: '检查点', value: data.database.checkpoint_size, count: data.database.checkpoint_count },
    { name: 'Agent数据', value: data.database.agent_kv_size, count: data.database.agent_kv_count },
    { name: 'Composer', value: data.database.composer_size, count: data.database.composer_count },
  ]

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          title="ItemTable"
          value={formatNumber(data.database.item_table_count)}
          subtitle={formatSize(data.database.item_table_size)}
          color={chartColors[0]}
        />
        <StatCard
          icon={Database}
          title="cursorDiskKV"
          value={formatNumber(data.database.cursor_disk_kv_count)}
          subtitle={formatSize(data.database.cursor_disk_kv_size)}
          color={chartColors[1]}
        />
        <StatCard
          icon={MessageSquare}
          title="对话气泡"
          value={formatNumber(data.database.bubble_count)}
          subtitle={formatSize(data.database.bubble_size)}
          color={chartColors[2]}
        />
        <StatCard
          icon={Bot}
          title="Agent 数据"
          value={formatNumber(data.database.agent_kv_count)}
          subtitle={formatSize(data.database.agent_kv_size)}
          color={chartColors[3]}
        />
      </div>

      {/* 数据库分布图表 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">数据库内容分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={databaseChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {databaseChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatSize(Number(v))}
                contentStyle={{
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 数据库详情表格 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Database size={18} /> 数据库详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">类别</TableHead>
                <TableHead className="text-muted-foreground">记录数</TableHead>
                <TableHead className="text-muted-foreground">大小</TableHead>
                <TableHead className="text-muted-foreground">说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border">
                <TableCell className="font-medium text-foreground">bubbleId</TableCell>
                <TableCell className="text-foreground">{formatNumber(data.database.bubble_count)}</TableCell>
                <TableCell className="text-foreground">{formatSize(data.database.bubble_size)}</TableCell>
                <TableCell className="text-muted-foreground">每条对话消息</TableCell>
              </TableRow>
              <TableRow className="border-border">
                <TableCell className="font-medium text-foreground">checkpointId</TableCell>
                <TableCell className="text-foreground">{formatNumber(data.database.checkpoint_count)}</TableCell>
                <TableCell className="text-foreground">{formatSize(data.database.checkpoint_size)}</TableCell>
                <TableCell className="text-muted-foreground">Agent 模式检查点</TableCell>
              </TableRow>
              <TableRow className="border-border">
                <TableCell className="font-medium text-foreground">agentKv</TableCell>
                <TableCell className="text-foreground">{formatNumber(data.database.agent_kv_count)}</TableCell>
                <TableCell className="text-foreground">{formatSize(data.database.agent_kv_size)}</TableCell>
                <TableCell className="text-muted-foreground">Agent 运行时数据</TableCell>
              </TableRow>
              <TableRow className="border-border">
                <TableCell className="font-medium text-foreground">composerData</TableCell>
                <TableCell className="text-foreground">{formatNumber(data.database.composer_count)}</TableCell>
                <TableCell className="text-foreground">{formatSize(data.database.composer_size)}</TableCell>
                <TableCell className="text-muted-foreground">Composer 会话</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
