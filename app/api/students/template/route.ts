import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { Gender } from "@/lib/enums"

export async function GET() {
  try {
    // 创建模板数据
    const templateData = [
      {
        学生姓名: "张三",
        手机号: "13800138001",
        性别: Gender.MALE,
      },
      {
        学生姓名: "李四",
        手机号: "13800138002",
        性别: Gender.FEMALE,
      },
    ]

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)

    // 设置列宽
    ws["!cols"] = [
      { wch: 15 }, // 学生姓名
      { wch: 30 }, // 手机号
      { wch: 10 }, // 性别
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
