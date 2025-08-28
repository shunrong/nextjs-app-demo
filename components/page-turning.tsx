import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export function PageTurning(props: {
  current: number
  size: number
  total?: number
  onChange: (current: number) => void
}) {
  const { current, size, total = 0, onChange } = props
  const max = Math.ceil(total / size)
  if (max <= 1) return null

  const canPrev = current > 1
  const canNext = current < max
  const start = Math.max(2, current - 1)
  const end = Math.min(max - 1, current + 1)
  const showLeftEllipsis = start > 2
  const showRightEllipsis = end < max - 1

  return (
    <Pagination className="flex items-center justify-end gap-4">
      <div className="text-sm ">共 {total} 条</div>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={e => {
              e.preventDefault()
              if (canPrev) onChange(current - 1)
            }}
            className={!canPrev ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink
            href="#"
            isActive={current === 1}
            onClick={e => {
              e.preventDefault()
              onChange(1)
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>

        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i).map(n => (
          <PaginationItem key={n}>
            <PaginationLink
              href="#"
              isActive={current === n}
              onClick={e => {
                e.preventDefault()
                onChange(n)
              }}
            >
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {max > 1 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              isActive={current === max}
              onClick={e => {
                e.preventDefault()
                onChange(max)
              }}
            >
              {max}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={e => {
              e.preventDefault()
              if (canNext) onChange(current + 1)
            }}
            className={!canNext ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
