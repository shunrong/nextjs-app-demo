import { TeacherForm } from "@/components/forms/TeacherForm"
import { FormMode } from "@/types/form"

export default async function TeacherDetailPage({
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

  return <TeacherForm id={isNew ? undefined : id} mode={mode} />
}
