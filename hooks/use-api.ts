"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

interface ApiResponse<T> {
  success: boolean
  data: T
  total?: number
  page?: number
  totalPages?: number
  error?: string
}

interface UseApiOptions {
  page?: number
  limit?: number
  search?: string
  enabled?: boolean
}

export function useApi<T>(endpoint: string, options: UseApiOptions = {}) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState<boolean | undefined>(undefined)
  const [total, setTotal] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const { page = 1, limit = 10, search = "", enabled = true } = options

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })

      const response = await fetch(`${endpoint}?${params}`)
      const result: ApiResponse<T[]> = await response.json()

      if (response.ok && result.success) {
        setData(result.data)
        setTotal(result.total || 0)
      } else {
        const message = result.error || "获取数据失败"
        setError(message)
        toast.error(message, {
          action: {
            label: "重试",
            onClick: () => {
              // 立即重试
              fetchData()
            },
          },
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "网络错误"
      setError(message)
      toast.error(message, {
        action: {
          label: "重试",
          onClick: () => {
            fetchData()
          },
        },
      })
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, limit, search, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    total,
    refetch: fetchData,
  }
}
