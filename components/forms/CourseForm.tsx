"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  AsyncSelectField,
} from "@/components/forms/FormField"
import { courseSchema, type CourseFormData } from "@/lib/schemas/course"
import { FORM_CONFIGS, type FormMode } from "@/types/form"

interface CourseFormProps {
  id?: string | number
  mode: FormMode
  initialData?: CourseFormData | null
}

export function CourseForm({ id, mode, initialData }: CourseFormProps) {
  const router = useRouter()
  const config = FORM_CONFIGS[mode]

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      category: "",
      year: new Date().getFullYear(),
      term: "SPRING",
      price: 0,
      teacherId: 0,
      address: "",
      banner: "",
    },
  })

  // 数据初始化
  useEffect(() => {
    if (mode === "create") {
      // 新建模式 - 使用默认值
      form.reset({
        title: "",
        subtitle: "",
        category: "",
        year: new Date().getFullYear(),
        term: "SPRING",
        price: 0,
        teacherId: 0,
        address: "",
        banner: "",
      })
    } else if (mode === "copy" && initialData) {
      // 复制模式 - 清除某些字段
      form.reset({
        ...initialData,
        title: `${initialData.title} - 副本`,
        year: new Date().getFullYear(), // 新的年份
      })
    } else if (initialData) {
      // 查看/编辑模式
      form.reset(initialData)
    } else if (id) {
      // 从 API 获取数据
      fetchCourseData(id)
    }
  }, [id, mode, initialData, form])

  const fetchCourseData = async (courseId: string | number) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
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

  const onSubmit = async (data: CourseFormData) => {
    try {
      const endpoint = mode === "edit" ? `/api/courses/${id}` : "/api/courses"
      const method = mode === "edit" ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(
          mode === "edit" ? "课程信息已更新" : mode === "copy" ? "课程已复制" : "课程已创建"
        )
        router.push("/courses")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败，请稍后重试")
    }
  }

  const getTitle = () => {
    const title = form.watch("title")
    switch (mode) {
      case "create":
        return "添加课程"
      case "edit":
        return `编辑课程${title ? ` - ${title}` : ""}`
      case "copy":
        return `复制课程${title ? ` - ${title}` : ""}`
      case "view":
        return `课程详情${title ? ` - ${title}` : ""}`
      default:
        return "课程信息"
    }
  }

  // 课程分类选项
  const categoryOptions = [
    { label: "数学", value: "数学" },
    { label: "英语", value: "英语" },
    { label: "物理", value: "物理" },
    { label: "化学", value: "化学" },
    { label: "编程", value: "编程" },
  ]

  // 学期选项
  const termOptions = [
    { label: "春季", value: "SPRING" },
    { label: "暑期", value: "SUMMER" },
    { label: "秋季", value: "AUTUMN" },
    { label: "冬季", value: "WINTER" },
  ]

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/courses")}>
            返回列表
          </Button>

          {mode === "view" && (
            <>
              <Button variant="outline" onClick={() => router.push(`/courses/${id}?mode=edit`)}>
                编辑
              </Button>
              <Button variant="outline" onClick={() => router.push(`/courses/${id}?mode=copy`)}>
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
              <div className="md:col-span-2">
                <TextField
                  form={form}
                  name="title"
                  label="课程标题"
                  placeholder="请输入课程标题"
                  required
                  disabled={config.readonly}
                />
              </div>

              <div className="md:col-span-2">
                <TextareaField
                  form={form}
                  name="subtitle"
                  label="课程副标题"
                  placeholder="请输入课程副标题"
                  rows={3}
                  disabled={config.readonly}
                />
              </div>

              <SelectField
                form={form}
                name="category"
                label="课程分类"
                placeholder="请选择课程分类"
                options={categoryOptions}
                required
                disabled={config.readonly}
              />

              <NumberField
                form={form}
                name="price"
                label="课程价格"
                placeholder="请输入课程价格"
                min={0}
                step={0.01}
                required
                disabled={config.readonly}
              />

              <NumberField
                form={form}
                name="year"
                label="开课年份"
                placeholder="请输入开课年份"
                min={2020}
                max={2030}
                required
                disabled={config.readonly}
              />

              <SelectField
                form={form}
                name="term"
                label="开课学期"
                placeholder="请选择开课学期"
                options={termOptions}
                required
                disabled={config.readonly}
              />

              <div className="md:col-span-2">
                <TextField
                  form={form}
                  name="address"
                  label="上课地点"
                  placeholder="请输入上课地点"
                  disabled={config.readonly}
                />
              </div>
            </CardContent>
          </Card>

          {/* 师资配置 */}
          <Card>
            <CardHeader>
              <CardTitle>师资配置</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <AsyncSelectField
                form={form}
                name="teacherId"
                label="授课教师"
                placeholder="请选择授课教师"
                apiEndpoint="/api/options?type=teachers"
                required
                disabled={config.readonly}
              />
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          {config.showActions && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/courses")}>
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
