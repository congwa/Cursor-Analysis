/**
 * 分页组件
 */
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        title="首页"
        className="h-8 w-8"
      >
        <ChevronsLeft size={16} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        title="上一页"
        className="h-8 w-8"
      >
        <ChevronLeft size={16} />
      </Button>
      
      <span className="px-3 text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        title="下一页"
        className="h-8 w-8"
      >
        <ChevronRight size={16} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        title="末页"
        className="h-8 w-8"
      >
        <ChevronsRight size={16} />
      </Button>
    </div>
  )
}
