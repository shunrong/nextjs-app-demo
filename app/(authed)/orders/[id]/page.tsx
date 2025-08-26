import { OrderForm } from "@/components/forms/OrderForm"
import { FormMode } from "@/types/form"

export default function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { mode?: string }
}) {
  const isNew = params.id === "new"
  const mode = (isNew ? "create" : (searchParams.mode as FormMode) || "view") as FormMode

  return <OrderForm id={isNew ? undefined : params.id} mode={mode} />
}
