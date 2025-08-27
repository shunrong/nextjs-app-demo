/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { ParentRole, Role } from "@/lib/enums"

interface StudentImportData {
  name: string
  phone: string
  gender: number
}

interface ImportResult {
  success: boolean
  total: number
  imported: number
  skipped: number
  errors: string[]
  details: {
    imported: StudentImportData[]
    skipped: { data: any; reason: string }[]
    failed: { data: any; error: string }[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "请选择要上传的文件" }, { status: 400 })
    }

    // 验证文件类型
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return NextResponse.json(
        { success: false, error: "请上传Excel文件（.xlsx或.xls格式）" },
        { status: 400 }
      )
    }

    // 读取文件
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // 转换为JSON数据
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    if (rawData.length < 2) {
      return NextResponse.json(
        { success: false, error: "Excel文件为空或格式不正确" },
        { status: 400 }
      )
    }

    // 解析表头和数据
    const headers = rawData[0] as string[]
    const rows = rawData.slice(1) as (string | number | null)[][]

    // 验证必需的列
    const requiredColumns = ["学生姓名", "手机号"]
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))

    if (missingColumns.length > 0) {
      return NextResponse.json(
        { success: false, error: `缺少必需的列: ${missingColumns.join(", ")}` },
        { status: 400 }
      )
    }

    // 获取列索引
    const nameIndex = headers.indexOf("学生姓名")
    const phoneIndex = headers.indexOf("手机号")
    const genderIndex = headers.indexOf("性别")

    // 解析数据
    const students: StudentImportData[] = []
    const skippedRows: { data: object; reason: string }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // Excel行号（从2开始，因为第1行是表头）

      // 跳过空行
      if (!row || row.every(cell => !cell || cell.toString().trim() === "")) {
        continue
      }

      const name = row[nameIndex]?.toString().trim()
      const phone = row[phoneIndex]?.toString().trim()
      const gender = Number(row[genderIndex]?.toString().trim())

      // 验证必需字段
      if (!name) {
        skippedRows.push({
          data: row,
          reason: `第${rowNum}行：学生姓名不能为空`,
        })
        continue
      }

      if (!phone) {
        skippedRows.push({
          data: row,
          reason: `第${rowNum}行：手机号不能为空`,
        })
        continue
      }

      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        skippedRows.push({
          data: row,
          reason: `第${rowNum}行：手机号格式不正确`,
        })
        continue
      }

      students.push({
        name,
        phone,
        gender,
      })
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          // 发送初始信息
          const totalStudents = students.length + skippedRows.length
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "init",
                total: totalStudents,
                validStudents: students.length,
                skippedStudents: skippedRows.length,
              })}\n\n`
            )
          )

          // 批量导入数据并发送进度
          const result = await importStudentsToDatabase(
            students,
            (processed, total, currentStudent) => {
              const progress = Math.round((processed / total) * 100)
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    processed,
                    total,
                    progress,
                    currentStudent,
                  })}\n\n`
                )
              )
            }
          )

          // 发送最终结果
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                ...result,
                skipped: skippedRows.length,
                success: true,
                details: {
                  ...result.details,
                  skipped: skippedRows,
                },
              })}\n\n`
            )
          )

          controller.close()
        } catch (error) {
          console.error("导入失败:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "导入失败，请稍后重试",
              })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("导入失败:", error)
    return NextResponse.json({ success: false, error: "导入失败，请稍后重试" }, { status: 500 })
  }
}

async function importStudentsToDatabase(
  students: StudentImportData[],
  onProgress?: (processed: number, total: number, currentStudent: string) => void
): Promise<Omit<ImportResult, "skipped">> {
  const imported: StudentImportData[] = []
  const failed: { data: StudentImportData; error: string }[] = []

  // 默认密码
  const defaultPassword = await bcrypt.hash("123456", 10)

  for (let i = 0; i < students.length; i++) {
    const student = students[i]

    try {
      // 发送进度更新
      if (onProgress) {
        onProgress(i, students.length, student.name)
      }

      // 检查用户是否已存在
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ phone: student.phone }],
        },
      })

      if (existingUser) {
        failed.push({
          data: student,
          error: `手机号 ${student.phone} 已存在`,
        })
        continue
      }

      // 创建用户和学生记录（使用事务）
      await prisma.$transaction(async tx => {
        // 创建用户
        const newUser = await tx.user.create({
          data: {
            phone: student.phone,
            name: student.name,
            password: defaultPassword,
            role: Role.STUDENT,
            gender: student.gender,
          },
        })

        // 创建学生记录
        await tx.student.create({
          data: {
            userId: newUser.id,
            parentPhone1: student.phone,
            parentName1: `${student.name}妈妈`,
            parentRole1: ParentRole.MOTHER,
          },
        })
      })

      imported.push(student)
    } catch (error) {
      console.error(`导入学生 ${student.name} 失败:`, error)
      failed.push({
        data: student,
        error: error instanceof Error ? error.message : "未知错误",
      })
    }
  }

  // 发送最终进度
  if (onProgress) {
    onProgress(students.length, students.length, "完成")
  }

  return {
    success: true,
    total: students.length,
    imported: imported.length,
    errors: failed.map(f => f.error),
    details: {
      imported,
      failed,
      skipped: [],
    },
  }
}
