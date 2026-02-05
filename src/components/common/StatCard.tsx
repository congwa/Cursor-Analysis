/**
 * 统计卡片组件
 */
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  subtitle?: string
  color?: string
  className?: string
}

export function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = '#58a6ff',
  className 
}: StatCardProps) {
  return (
    <Card className={cn(
      'bg-card border-border hover:border-primary/50 transition-colors',
      className
    )}>
      <CardContent className="flex items-center gap-4 p-4">
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-semibold text-foreground">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
