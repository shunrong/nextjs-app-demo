"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"

interface Lesson {
  id?: number
  title: string
  subtitle?: string
  startTime: string
  endTime: string
  status: "PENDING" | "COMPLETED"
}

interface LessonManagerProps {
  disabled?: boolean
}

export function LessonManager({ disabled }: LessonManagerProps) {
  const { control, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lessons",
  })

  const lessons = watch("lessons") || []

  const addLesson = () => {
    const newLesson: Lesson = {
      title: "",
      subtitle: "",
      startTime: "",
      endTime: "",
      status: "PENDING",
    }
    append(newLesson)
  }

  const removeLesson = (index: number) => {
    const lesson = lessons[index]
    if (lesson.id) {
      // 如果是已存在的课时，需要确认删除
      if (confirm("确定要删除这个课时吗？")) {
        remove(index)
        toast.success("课时已删除")
      }
    } else {
      // 如果是新添加的课时，直接删除
      remove(index)
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "COMPLETED" ? (
      <Badge variant="default" className="bg-green-500">
        已完成
      </Badge>
    ) : (
      <Badge variant="secondary">未开始</Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            课时管理
          </CardTitle>
          {!disabled && (
            <Button type="button" onClick={addLesson} size="sm">
              <Plus className="size-4 mr-1" />
              添加课时
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="size-12 mx-auto mb-2 opacity-50" />
            <p>暂无课时安排</p>
            {!disabled && (
              <Button type="button" onClick={addLesson} variant="outline" className="mt-2">
                <Plus className="size-4 mr-1" />
                添加第一个课时
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">课时 {index + 1}</Badge>
                      {lessons[index]?.id && (
                        <Badge variant="outline" className="text-xs">
                          ID: {lessons[index].id}
                        </Badge>
                      )}
                      {lessons[index]?.status && getStatusBadge(lessons[index].status)}
                    </div>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLesson(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FormField
                        control={control}
                        name={`lessons.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              课时标题
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="请输入课时标题"
                                disabled={disabled}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FormField
                        control={control}
                        name={`lessons.${index}.subtitle`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>课时描述</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="请输入课时描述（可选）"
                                rows={2}
                                disabled={disabled}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={control}
                      name={`lessons.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            开始时间
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="datetime-local"
                              placeholder="请选择开始时间"
                              disabled={disabled}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`lessons.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            结束时间
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="datetime-local"
                              placeholder="请选择结束时间"
                              disabled={disabled}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={control}
                        name={`lessons.${index}.status`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>课时状态</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={disabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="请选择课时状态" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PENDING">未开始</SelectItem>
                                <SelectItem value="COMPLETED">已完成</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
