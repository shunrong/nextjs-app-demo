export type FormMode = "view" | "create" | "edit" | "copy"

export interface FormConfig {
  mode: FormMode
  readonly: boolean
  showActions: boolean
  submitText: string
}

export const FORM_CONFIGS: Record<FormMode, FormConfig> = {
  view: {
    mode: "view",
    readonly: true,
    showActions: false,
    submitText: "",
  },
  create: {
    mode: "create",
    readonly: false,
    showActions: true,
    submitText: "创建",
  },
  edit: {
    mode: "edit",
    readonly: false,
    showActions: true,
    submitText: "保存",
  },
  copy: {
    mode: "copy",
    readonly: false,
    showActions: true,
    submitText: "创建副本",
  },
}
