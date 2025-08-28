import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, Table as TableIcon } from "lucide-react"

export function ViewToggle({ tab, setTab }: { tab: string; setTab: (tab: string) => void }) {
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="card" aria-label="卡片视图">
          <LayoutGrid className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="table" aria-label="表格视图">
          <TableIcon className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
