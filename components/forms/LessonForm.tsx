"use client"

import { useState } from "react"
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
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Plus, Trash2, Calendar, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { LessonStatus } from "@/lib/enums"

interface Lesson {
  id?: number
  title: string
  subtitle?: string
  startTime: string
  endTime: string
  status: LessonStatus
}

interface LessonFormProps {
  disabled?: boolean
}

export function LessonForm({ disabled }: LessonFormProps) {
  const [isOpen, setIsOpen] = useState(true)
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
      status: LessonStatus.PENDING,
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

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
                <Calendar className="size-5" />
                课时管理 ({fields.length}节课)
              </CardTitle>
              {!disabled && (
                <Button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    addLesson()
                  }}
                  size="sm"
                >
                  <Plus className="size-4 mr-1" />
                  添加课时
                </Button>
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">序号</TableHead>
                      <TableHead className="min-w-[200px]">课时标题</TableHead>
                      <TableHead className="min-w-[150px]">描述</TableHead>
                      <TableHead className="min-w-[120px]">开始时间</TableHead>
                      <TableHead className="min-w-[120px]">结束时间</TableHead>
                      <TableHead className="w-24">状态</TableHead>
                      {!disabled && <TableHead className="w-20">操作</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <span>{index + 1}</span>
                            {lessons[index]?.id && (
                              <Badge variant="outline" className="text-xs">
                                ID:{lessons[index].id}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <FormField
                            control={control}
                            name={`lessons.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="请输入课时标题"
                                    disabled={disabled}
                                    value={field.value ?? ""}
                                    className="border-0 shadow-none focus-visible:ring-1"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <FormField
                            control={control}
                            name={`lessons.${index}.subtitle`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="课时描述（可选）"
                                    disabled={disabled}
                                    value={field.value ?? ""}
                                    rows={2}
                                    className="border-0 shadow-none focus-visible:ring-1 resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <FormField
                            control={control}
                            name={`lessons.${index}.startTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="datetime-local"
                                    disabled={disabled}
                                    value={field.value ?? ""}
                                    className="border-0 shadow-none focus-visible:ring-1"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <FormField
                            control={control}
                            name={`lessons.${index}.endTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="datetime-local"
                                    disabled={disabled}
                                    value={field.value ?? ""}
                                    className="border-0 shadow-none focus-visible:ring-1"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <FormField
                            control={control}
                            name={`lessons.${index}.status`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={disabled}
                                >
                                  <FormControl>
                                    <SelectTrigger className="border-0 shadow-none focus:ring-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="PENDING">
                                      <Badge variant="secondary">未开始</Badge>
                                    </SelectItem>
                                    <SelectItem value="COMPLETED">
                                      <Badge variant="default" className="bg-green-500">
                                        已完成
                                      </Badge>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {!disabled && (
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLesson(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
