"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { TextField, SelectField, DateField, RadioField } from "@/components/forms/FormField"
import { studentSchema, type StudentFormData } from "@/lib/schemas/student"
import { FORM_CONFIGS, type FormMode } from "@/types/form"

interface StudentFormProps {
  id?: string | number
  mode: FormMode
  initialData?: StudentFormData | null
}

export function StudentForm({ id, mode, initialData }: StudentFormProps) {
  const router = useRouter()
  const config = FORM_CONFIGS[mode]

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      gender: null,
      birth: "",
      parentName1: "",
      parentPhone1: "",
      parentRole1: "",
      parentName2: "",
      parentPhone2: "",
      parentRole2: "",
      photo: "",
    },
  })

  // 数据初始化
  useEffect(() => {
    if (mode === "create") {
      // 新建模式 - 使用默认值
      form.reset({
        name: "",
        phone: "",
        email: "",
        gender: null,
        birth: "",
        parentName1: "",
        parentPhone1: "",
        parentRole1: "",
        parentName2: "",
        parentPhone2: "",
        parentRole2: "",
        photo: "",
      })
    } else if (mode === "copy" && initialData) {
      // 复制模式 - 清除某些字段
      form.reset({
        ...initialData,
        name: `${initialData.name} - 副本`,
        phone: "", // 手机号需要重新填写
        parentPhone1: "", // 家长手机号也需要重新填写
      })
    } else if (initialData) {
      // 查看/编辑模式
      form.reset(initialData)
    } else if (id) {
      // 从 API 获取数据
      fetchStudentData(id)
    }
  }, [id, mode, initialData, form])

  const fetchStudentData = async (studentId: string | number) => {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      const result = await response.json()
      if (result.success) {
        form.reset(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error("获取数据失败，请稍后重试")
    }
  }

  const onSubmit = async (data: StudentFormData) => {
    try {
      const endpoint = mode === "edit" ? `/api/students/${id}` : "/api/students"
      const method = mode === "edit" ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(mode === "edit" ? "学生信息已更新" : "学生已创建")
        router.push("/students")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败，请稍后重试")
    }
  }

  const getTitle = () => {
    const name = form.watch("name")
    switch (mode) {
      case "create":
        return "录入学生"
      case "edit":
        return `编辑学生${name ? ` - ${name}` : ""}`
      case "copy":
        return `复制学生${name ? ` - ${name}` : ""}`
      case "view":
        return `学生详情${name ? ` - ${name}` : ""}`
      default:
        return "学生信息"
    }
  }

  // 性别选项
  const genderOptions = [
    { label: "男", value: "MALE" },
    { label: "女", value: "FEMALE" },
  ]

  // 关系选项
  const relationOptions = [
    { label: "父亲", value: "父亲" },
    { label: "母亲", value: "母亲" },
    { label: "祖父", value: "祖父" },
    { label: "祖母", value: "祖母" },
    { label: "外祖父", value: "外祖父" },
    { label: "外祖母", value: "外祖母" },
    { label: "其他", value: "其他" },
  ]

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/students")}>
            返回列表
          </Button>

          {mode === "view" && (
            <>
              <Button variant="outline" onClick={() => router.push(`/students/${id}?mode=edit`)}>
                编辑
              </Button>
              <Button variant="outline" onClick={() => router.push(`/students/${id}?mode=copy`)}>
                复制
              </Button>
            </>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <TextField
                form={form}
                name="name"
                label="姓名"
                placeholder="请输入学生姓名"
                required
                disabled={config.readonly}
              />

              <TextField
                form={form}
                name="phone"
                label="手机号"
                type="tel"
                placeholder="请输入手机号"
                required
                disabled={config.readonly}
              />

              <TextField
                form={form}
                name="email"
                label="邮箱"
                type="email"
                placeholder="请输入邮箱地址"
                disabled={config.readonly}
              />

              <DateField form={form} name="birth" label="出生日期" disabled={config.readonly} />

              <div className="md:col-span-2">
                <RadioField
                  form={form}
                  name="gender"
                  label="性别"
                  options={genderOptions}
                  disabled={config.readonly}
                />
              </div>
            </CardContent>
          </Card>

          {/* 家长信息 */}
          <Card>
            <CardHeader>
              <CardTitle>家长信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 第一家长 */}
              <div className="grid gap-4 md:grid-cols-3">
                <TextField
                  form={form}
                  name="parentName1"
                  label="家长姓名"
                  placeholder="请输入家长姓名"
                  required
                  disabled={config.readonly}
                />

                <TextField
                  form={form}
                  name="parentPhone1"
                  label="家长手机号"
                  type="tel"
                  placeholder="请输入家长手机号"
                  required
                  disabled={config.readonly}
                />

                <SelectField
                  form={form}
                  name="parentRole1"
                  label="与学生关系"
                  placeholder="请选择关系"
                  options={relationOptions}
                  required
                  disabled={config.readonly}
                />
              </div>

              {/* 家长（备选） */}
              <div className="grid gap-4 md:grid-cols-3">
                <TextField
                  form={form}
                  name="parentName2"
                  label="家长姓名（备选）"
                  placeholder="请输入家长姓名"
                  disabled={config.readonly}
                />

                <TextField
                  form={form}
                  name="parentPhone2"
                  label="家长手机号（备选）"
                  type="tel"
                  placeholder="请输入家长手机号"
                  disabled={config.readonly}
                />

                <SelectField
                  form={form}
                  name="parentRole2"
                  label="与学生关系（备选）"
                  placeholder="请选择关系"
                  options={relationOptions}
                  disabled={config.readonly}
                />
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          {config.showActions && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/students")}>
                取消
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "保存中..." : config.submitText}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
