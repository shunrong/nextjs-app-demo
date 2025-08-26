import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form"
import { useState, useEffect } from "react"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface BaseFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: FieldPath<T>
  label: string
  description?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

// 文本输入字段
interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type?: "text" | "email" | "tel" | "password" | "url"
}

export function TextField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
}: TextFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 文本域字段
interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  rows?: number
}

export function TextareaField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  rows = 3,
}: TextareaFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 选择字段
interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: Array<{ label: string; value: string }>
}

export function SelectField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  options,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 日期字段
export function DateField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
}: BaseFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="date"
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 单选字段
interface RadioFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: Array<{ label: string; value: string }>
}

export function RadioField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  disabled = false,
  required = false,
  options,
}: RadioFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex  space-y-1"
              disabled={disabled}
            >
              {options.map(option => (
                <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 数字输入字段
interface NumberFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  min?: number
  max?: number
  step?: number
}

export function NumberField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  min,
  max,
  step,
}: NumberFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              value={field.value ?? ""}
              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 日期时间字段
export function DateTimeField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
}: BaseFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="datetime-local"
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 异步选择字段
interface AsyncSelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  apiEndpoint: string
  valueKey?: string
  labelKey?: string
}

export function AsyncSelectField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  apiEndpoint,
  valueKey = "id",
  labelKey = "name",
}: AsyncSelectFieldProps<T>) {
  const [options, setOptions] = useState<Array<Record<string, string | number>>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      try {
        const response = await fetch(apiEndpoint)
        const result = await response.json()
        if (result.success) {
          setOptions(result.data)
        }
      } catch (error) {
        console.error("获取选项失败:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [apiEndpoint])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <Select
            onValueChange={value => field.onChange(parseInt(value))}
            value={field.value ? String(field.value) : ""}
            disabled={disabled || loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "加载中..." : placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option[valueKey]} value={String(option[valueKey])}>
                  {option[labelKey]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
