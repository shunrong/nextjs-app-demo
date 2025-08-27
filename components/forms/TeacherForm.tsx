"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { TextField, SelectField, RadioField } from "@/components/forms/FormField"
import { teacherSchema, type TeacherFormData } from "@/lib/schemas/teacher"
import { FORM_CONFIGS, type FormMode } from "@/types/form"
import { Gender, genderLabels, Job, jobLabels } from "@/lib/enums"

interface TeacherFormProps {
  id?: string | number
  mode: FormMode
  initialData?: TeacherFormData | null
}

export function TeacherForm({ id, mode, initialData }: TeacherFormProps) {
  const router = useRouter()
  const config = FORM_CONFIGS[mode]

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      phone: "",
      gender: Gender.MALE,
      job: Job.TEACHER,
      avatar: "",
    },
  })

  // 数据初始化
  useEffect(() => {
    if (mode === "create") {
      // 新建模式 - 使用默认值
      form.reset({
        name: "",
        phone: "",
        gender: Gender.MALE,
        job: Job.TEACHER,
        avatar: "",
      })
    } else if (initialData) {
      // 查看/编辑模式
      form.reset(initialData)
    } else if (id) {
      // 从 API 获取数据
      fetchTeacherData(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode, initialData])

  const fetchTeacherData = useCallback(
    async (teacherId: string | number) => {
      try {
        const response = await fetch(`/api/teachers/${teacherId}`)
        const result = await response.json()
        if (result.success) {
          form.reset(result.data)
        } else {
          throw new Error(result.error)
        }
      } catch {
        toast.error("获取数据失败，请稍后重试")
      }
    },
    [form]
  )

  const onSubmit = async (data: TeacherFormData) => {
    try {
      const endpoint = mode === "edit" ? `/api/teachers/${id}` : "/api/teachers"
      const method = mode === "edit" ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(mode === "edit" ? "教师信息已更新" : "教师已创建")
        router.push("/teachers")
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
        return "录入教师"
      case "edit":
        return `编辑教师${name ? ` - ${name}` : ""}`
      case "view":
        return `教师详情${name ? ` - ${name}` : ""}`
      default:
        return "教师信息"
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/teachers")}>
            返回列表
          </Button>

          {mode === "view" && (
            <Button variant="outline" onClick={() => router.push(`/teachers/${id}?mode=edit`)}>
              编辑
            </Button>
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
                placeholder="请输入教师姓名"
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

              <SelectField
                form={form}
                name="job"
                label="职位"
                placeholder="请选择职位"
                options={Object.entries(jobLabels).map(([value, label]) => ({
                  label,
                  value,
                }))}
                required
                disabled={config.readonly}
              />

              <div className="md:col-span-2">
                <RadioField
                  form={form}
                  name="gender"
                  label="性别"
                  options={Object.entries(genderLabels).map(([value, label]) => ({
                    label,
                    value,
                  }))}
                  disabled={config.readonly}
                />
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          {config.showActions && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/teachers")}>
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
