/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

interface StudentImportData {
  name: string
  phone: string
  gender?: "MALE" | "FEMALE"
  email?: string
}

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

export async function GET() {
  try {
    // 创建模板数据
    const templateData = [
      {
        学生姓名: "张三",
        手机号: "13800138001",
        性别: "男",
        邮箱: "zhangsan@example.com",
      },
      {
        学生姓名: "李四",
        手机号: "13800138002",
        性别: "女",
        邮箱: "lisi@example.com",
      },
    ]

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)

    // 设置列宽
    ws["!cols"] = [
      { wch: 15 }, // 学生姓名
      { wch: 15 }, // 手机号
      { wch: 10 }, // 性别
      { wch: 25 }, // 邮箱
    ]

    // 添加工作表
    XLSX.utils.book_append_sheet(wb, ws, "学生信息")

    // 生成Excel文件
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })

    // 返回文件
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": "attachment; filename=student_template.xlsx",
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  } catch (error) {
    console.error("生成模板失败:", error)
    return NextResponse.json({ success: false, error: "生成模板失败" }, { status: 500 })
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
    const emailIndex = headers.indexOf("邮箱")

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
      const genderStr = row[genderIndex]?.toString().trim()
      const email = row[emailIndex]?.toString().trim()

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

      // 验证性别
      let gender: "MALE" | "FEMALE" | undefined
      if (genderStr) {
        if (genderStr === "男" || genderStr === "MALE") {
          gender = "MALE"
        } else if (genderStr === "女" || genderStr === "FEMALE") {
          gender = "FEMALE"
        } else {
          skippedRows.push({
            data: row,
            reason: `第${rowNum}行：性别格式不正确（请填写"男"或"女"）`,
          })
          continue
        }
      }

      // 验证邮箱格式（如果提供）
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        skippedRows.push({
          data: row,
          reason: `第${rowNum}行：邮箱格式不正确`,
        })
        continue
      }

      students.push({
        name,
        phone,
        gender,
        email: email || undefined,
      })
    }

    // 批量导入数据
    const result = await importStudentsToDatabase(students)

    return NextResponse.json({
      ...result,
      skipped: skippedRows.length,
      success: true,
      details: {
        ...result.details,
        skipped: skippedRows,
      },
    })
  } catch (error) {
    console.error("导入失败:", error)
    return NextResponse.json({ success: false, error: "导入失败，请稍后重试" }, { status: 500 })
  }
}

async function importStudentsToDatabase(
  students: StudentImportData[]
): Promise<Omit<ImportResult, "skipped">> {
  const imported: StudentImportData[] = []
  const failed: { data: StudentImportData; error: string }[] = []

  // 默认密码
  const defaultPassword = await bcrypt.hash("123456", 10)

  for (const student of students) {
    try {
      // 检查用户是否已存在
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ phone: student.phone }, ...(student.email ? [{ email: student.email }] : [])],
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
            email: student.email,
            password: defaultPassword,
            role: "STUDENT",
            gender: student.gender,
          },
        })

        // 创建学生记录
        await tx.student.create({
          data: {
            userId: newUser.id,
            parentName1: `${student.name}妈妈`,
            parentPhone1: student.phone,
            parentRole1: "MOTHER",
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
