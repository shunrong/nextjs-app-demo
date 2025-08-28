import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-lg">
          <div className="p-6">
            <Skeleton className="h-5 w-20 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function Empty() {
  return <div className="h-64 text-center text-muted-foreground">暂无数据</div>
}

type DataCardsProps<T> = {
  data: T[]
  loading?: boolean
  renderContent: (item: T) => React.ReactNode
}

export function DataCards<T>({ data, loading = true, renderContent }: DataCardsProps<T>) {
  if (loading === undefined) return null
  if (loading) return <Loading />
  if (data.length === 0) return <Empty />
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map(item => renderContent(item))}
    </div>
  )
}
