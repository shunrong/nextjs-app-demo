import { TeacherForm } from "@/components/forms/TeacherForm"
import { FormMode } from "@/types/form"

export default function TeacherDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { mode?: string }
}) {
  const isNew = params.id === "new"
  const mode = (isNew ? "create" : (searchParams.mode as FormMode) || "view") as FormMode

  return <TeacherForm id={isNew ? undefined : params.id} mode={mode} />
}
