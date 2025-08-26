import { StudentForm } from "@/components/forms/StudentForm"
import { FormMode } from "@/types/form"

export default function StudentDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { mode?: string }
}) {
  const isNew = params.id === "new"
  const mode = (isNew ? "create" : (searchParams.mode as FormMode) || "view") as FormMode

  return <StudentForm id={isNew ? undefined : params.id} mode={mode} />
}
