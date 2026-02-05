/**
 * 概览 Tab 组件
 */
import {
  FolderOpen,
  MessageSquare,
  Code,
  Trash2,
  FileCode,
  HardDrive,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/common/StatCard'
import { formatNumber } from '@/lib/format'
import { chartColors } from '@/design-system/tokens'
import type { AnalysisResult } from '@/types'

interface OverviewTabProps {
  data: AnalysisResult
}

export function OverviewTab({ data }: OverviewTabProps) {
  const modeChartData = [
    { name: 'Agent 模式', value: data.overview.agent_mode_count },
    { name: 'Chat 模式', value: data.overview.chat_mode_count },
  ]

  const topProjects = data.projects.slice(0, 10).map((p) => ({
    name: p.name,
    fullName: p.name,
    added: p.lines_added,
    removed: p.lines_removed,
  }))

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={FolderOpen}
          title="项目数量"
          value={data.overview.total_projects}
          color={chartColors[0]}
        />
        <StatCard
          icon={MessageSquare}
          title="聊天会话"
          value={data.overview.total_chats}
          color={chartColors[1]}
        />
        <StatCard
          icon={Code}
          title="添加代码"
          value={`+${formatNumber(data.overview.total_lines_added)}`}
          subtitle="行"
          color="#3fb950"
        />
        <StatCard
          icon={Trash2}
          title="删除代码"
          value={`-${formatNumber(data.overview.total_lines_removed)}`}
          subtitle="行"
          color="#f85149"
        />
        <StatCard
          icon={FileCode}
          title="净增代码"
          value={formatNumber(data.overview.net_lines)}
          subtitle="行"
          color={chartColors[4]}
        />
        <StatCard
          icon={HardDrive}
          title="总存储"
          value={data.storage.total_size_human}
          color={chartColors[2]}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 模式分布饼图 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">模式使用分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={modeChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {modeChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#a371f7' : '#58a6ff'}
                    />
                  ))}
                </Pie>
                <Tooltip
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

        {/* 项目贡献柱状图 */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">项目代码贡献 Top 10</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProjects} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatNumber(v)}
                  stroke="#8b949e"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={180}
                  tick={{ fontSize: 12, fill: '#8b949e' }}
                  tickFormatter={(value) =>
                    value.length > 20 ? value.slice(0, 18) + '...' : value
                  }
                  stroke="#8b949e"
                />
                <Tooltip
                  formatter={(v) => formatNumber(Number(v))}
                  labelFormatter={(label) => `项目: ${label}`}
                  contentStyle={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="added" fill="#3fb950" name="添加行数" />
                <Bar dataKey="removed" fill="#f85149" name="删除行数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
