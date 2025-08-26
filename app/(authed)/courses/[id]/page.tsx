import { CourseForm } from "@/components/forms/CourseForm"
import { FormMode } from "@/types/form"

export default function CourseDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { mode?: string }
}) {
  const isNew = params.id === "new"
  const mode = (isNew ? "create" : (searchParams.mode as FormMode) || "view") as FormMode

  return <CourseForm id={isNew ? undefined : params.id} mode={mode} />
}
