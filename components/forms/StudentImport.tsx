/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, Download, Users, XCircle, AlertTriangle } from "lucide-react"

interface ImportResult {
  success: boolean
  total: number
  imported: number
  skipped: number
  errors: string[]
  details: {
    imported: any
    skipped: { data: any; reason: string }[]
    failed: { data: any; error: string }[]
  }
}

export function StudentImport() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressInfo, setProgressInfo] = useState<{
    processed: number
    total: number
    currentStudent: string
  } | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // 验证文件类型
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error("请选择Excel文件（.xlsx或.xls格式）")
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch("/api/students/template")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "student_template.xlsx"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("模板下载成功")
      } else {
        throw new Error("下载失败")
      }
    } catch {
      toast.error("模板下载失败")
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error("请先选择文件")
      return
    }

    setImporting(true)
    setProgress(0)
    setProgressInfo(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/students/import", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "请求失败")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("无法读取响应流")
      }

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))

              switch (data.type) {
                case "init":
                  setProgressInfo({
                    processed: 0,
                    total: data.validStudents,
                    currentStudent: "准备导入...",
                  })
                  break

                case "progress":
                  setProgress(data.progress)
                  setProgressInfo({
                    processed: data.processed + 1,
                    total: data.total,
                    currentStudent: data.currentStudent,
                  })
                  break

                case "complete":
                  setProgress(100)
                  setResult(data)
                  toast.success(`导入完成！成功导入 ${data.imported} 个学生`)
                  break

                case "error":
                  throw new Error(data.error)
              }
            } catch (parseError) {
              console.error("解析进度数据失败:", parseError)
            }
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "导入失败")
    } finally {
      setImporting(false)
      setTimeout(() => {
        setProgress(0)
        setProgressInfo(null)
      }, 2000)
    }
  }

  const resetImport = () => {
    setFile(null)
    setResult(null)
    setProgress(0)
    setProgressInfo(null)
    // 重置文件输入
    const fileInput = document.getElementById("file-input") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            批量导入学生
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 下载模板 */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="size-4 mr-2" />
              下载Excel模板
            </Button>
            <span className="text-sm text-muted-foreground">
              请先下载模板，按模板格式填写学生信息
            </span>
          </div>

          {/* 文件上传 */}
          <div className="space-y-2">
            <label htmlFor="file-input" className="text-sm font-medium">
              选择Excel文件
            </label>
            <div className="flex items-center gap-4">
              <Input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={importing}
                className="w-auto"
              />
              {file && (
                <Badge variant="outline">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Badge>
              )}
            </div>
          </div>

          {/* 进度条 */}
          {importing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>导入进度</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {progressInfo && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>
                      已处理: {progressInfo.processed} / {progressInfo.total}
                    </span>
                    <span>当前: {progressInfo.currentStudent}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex items-center gap-2"
            >
              <Upload className="size-4" />
              {importing ? "导入中..." : "开始导入"}
            </Button>
            {(file || result) && (
              <Button variant="outline" onClick={resetImport} disabled={importing}>
                重新选择
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 导入结果 */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              导入结果
              {result.imported > 0 && (
                <Badge variant="default" className="bg-green-500">
                  成功导入 {result.imported} 个
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 统计信息 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{result.total + result.skipped}</div>
                <div className="text-sm text-muted-foreground">总计</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-muted-foreground">成功</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                <div className="text-sm text-muted-foreground">跳过</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {result.details.failed.length}
                </div>
                <div className="text-sm text-muted-foreground">失败</div>
              </div>
            </div>

            {/* 错误详情 */}
            {(result.details.skipped.length > 0 || result.details.failed.length > 0) && (
              <div className="space-y-4">
                <h4 className="font-medium">详细信息</h4>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">状态</TableHead>
                      <TableHead>学生姓名</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>原因</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.details.skipped.map((item, index) => (
                      <TableRow key={`skipped-${index}`}>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <AlertTriangle className="size-3" />
                            跳过
                          </Badge>
                        </TableCell>
                        <TableCell>{item.data[0] || "-"}</TableCell>
                        <TableCell>{item.data[1] || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                    {result.details.failed.map((item, index) => (
                      <TableRow key={`failed-${index}`}>
                        <TableCell>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <XCircle className="size-3" />
                            失败
                          </Badge>
                        </TableCell>
                        <TableCell>{item.data.name}</TableCell>
                        <TableCell>{item.data.phone}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.error}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
