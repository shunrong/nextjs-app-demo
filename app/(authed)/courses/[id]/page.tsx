import { CourseForm } from "@/components/forms/CourseForm"
import { FormMode } from "@/types/form"

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode: queryMode } = await searchParams

  const isNew = id === "new"
  const mode = (isNew ? "create" : (queryMode as FormMode) || "view") as FormMode

  return <CourseForm id={isNew ? undefined : id} mode={mode} />
}
