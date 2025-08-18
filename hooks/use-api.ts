"use client"

import { useState, useEffect } from "react"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const { page = 1, limit = 10, search = "", enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
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
          setTotalPages(result.totalPages || 0)
        } else {
          setError(result.error || "获取数据失败")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "网络错误")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint, page, limit, search, enabled])

  return {
    data,
    loading,
    error,
    total,
    totalPages,
  }
}
