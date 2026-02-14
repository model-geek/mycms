"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/switch";

import type { ApiSchema, CustomField } from "@/features/content-hub/model";
import { FieldTypePicker } from "./field-type-picker";

const fieldSchema = z.object({
  name: z.string().min(1, "表示名は必須です"),
  fieldId: z
    .string()
    .min(1, "フィールドIDは必須です")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "英数字とアンダースコアのみ使用可能です"
    ),
  kind: z.string().min(1, "型を選択してください"),
  required: z.boolean(),
  description: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

export interface FieldEditorData {
  id?: string;
  name: string;
  fieldId: string;
  kind: string;
  required: boolean;
  description?: string;
  validationRules?: unknown;
}

interface SelectItemEntry {
  id: string;
  value: string;
}

interface SizeLimit {
  min?: number;
  max?: number;
}

interface FieldEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FieldEditorData | null;
  onSave: (data: FieldEditorData) => void;
  formKey?: number;
  serviceId?: string;
  apiSchemaId?: string;
  apiSchemas?: ApiSchema[];
  customFields?: CustomField[];
}

function handleNumberInput(
  setter: (fn: (prev: SizeLimit) => SizeLimit) => void,
  key: "min" | "max",
  rawValue: string,
) {
  if (rawValue === "") {
    setter((prev) => ({ ...prev, [key]: undefined }));
    return;
  }
  const num = Number(rawValue);
  if (!Number.isNaN(num)) {
    setter((prev) => ({ ...prev, [key]: num }));
  }
}

function parseSelectItems(
  data: FieldEditorData | null | undefined,
): { items: SelectItemEntry[]; multipleSelect: boolean } {
  if (!data || data.kind !== "select")
    return { items: [], multipleSelect: false };
  const rules = (data.validationRules ?? {}) as Record<string, unknown>;
  const items = rules.selectItems as SelectItemEntry[] | undefined;
  const legacyOptions = rules.options as string[] | undefined;
  const selectItems = items
    ? items
    : legacyOptions
      ? legacyOptions.map((o) => ({ id: crypto.randomUUID(), value: o }))
      : [];
  return {
    items: selectItems,
    multipleSelect: (rules.multipleSelect as boolean) ?? false,
  };
}

export function FieldEditor({
  open,
  onOpenChange,
  initialData,
  onSave,
  formKey,
  apiSchemas = [],
  customFields = [],
}: FieldEditorProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {initialData?.id ? "フィールド編集" : "フィールド追加"}
          </SheetTitle>
        </SheetHeader>
        <FieldEditorForm
          key={formKey}
          initialData={initialData}
          onSave={(data) => {
            onSave(data);
            onOpenChange(false);
          }}
          apiSchemas={apiSchemas}
          customFields={customFields}
        />
      </SheetContent>
    </Sheet>
  );
}

interface FieldEditorFormProps {
  initialData?: FieldEditorData | null;
  onSave: (data: FieldEditorData) => void;
  apiSchemas: ApiSchema[];
  customFields: CustomField[];
}

function FieldEditorForm({
  initialData,
  onSave,
  apiSchemas,
  customFields,
}: FieldEditorFormProps) {
  const parsedSelect = parseSelectItems(initialData);
  const rules = (initialData?.validationRules ?? {}) as Record<
    string,
    unknown
  >;
  const kind = initialData?.kind;

  const [selectItems, setSelectItems] = useState<SelectItemEntry[]>(
    parsedSelect.items,
  );
  const [multipleSelect, setMultipleSelect] = useState(
    parsedSelect.multipleSelect,
  );

  const [referencedApiEndpoint, setReferencedApiEndpoint] = useState(
    kind === "relation" || kind === "relationList"
      ? ((rules.referencedApiEndpoint as string) ?? "")
      : "",
  );

  const [textUnique, setTextUnique] = useState(
    kind === "text" ? ((rules.unique as boolean) ?? false) : false,
  );
  const [textPatternMatch, setTextPatternMatch] = useState(
    kind === "text" ? ((rules.patternMatch as string) ?? "") : "",
  );
  const [textSizeLimit, setTextSizeLimit] = useState<SizeLimit>(
    kind === "text"
      ? {
          min: (rules.textSizeLimit as SizeLimit | undefined)?.min,
          max: (rules.textSizeLimit as SizeLimit | undefined)?.max,
        }
      : {},
  );

  const [textAreaSizeLimit, setTextAreaSizeLimit] = useState<SizeLimit>(
    kind === "textArea"
      ? {
          min: (rules.textSizeLimit as SizeLimit | undefined)?.min,
          max: (rules.textSizeLimit as SizeLimit | undefined)?.max,
        }
      : {},
  );

  const [numberSizeLimit, setNumberSizeLimit] = useState<SizeLimit>(
    kind === "number"
      ? {
          min: (rules.numberSizeLimit as SizeLimit | undefined)?.min,
          max: (rules.numberSizeLimit as SizeLimit | undefined)?.max,
        }
      : {},
  );

  const [selectedCustomFieldCreatedAt, setSelectedCustomFieldCreatedAt] =
    useState(
      kind === "custom"
        ? ((rules.customFieldCreatedAt as string) ?? "")
        : "",
    );

  const [repeaterCustomFieldIds, setRepeaterCustomFieldIds] = useState<
    string[]
  >(kind === "repeater" ? ((rules.customFieldIds as string[]) ?? []) : []);
  const [repeaterMinCount, setRepeaterMinCount] = useState<
    number | undefined
  >(
    kind === "repeater"
      ? ((rules.minCount as number | undefined) ?? undefined)
      : undefined,
  );
  const [repeaterMaxCount, setRepeaterMaxCount] = useState<
    number | undefined
  >(
    kind === "repeater"
      ? ((rules.maxCount as number | undefined) ?? undefined)
      : undefined,
  );

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      fieldId: initialData?.fieldId ?? "",
      kind: initialData?.kind ?? "text",
      required: initialData?.required ?? false,
      description: initialData?.description ?? "",
    },
  });

  const selectedKind = useWatch({ control: form.control, name: "kind" });

  function handleSubmit(values: FieldFormValues) {
    const data: FieldEditorData = {
      id: initialData?.id,
      name: values.name,
      fieldId: values.fieldId,
      kind: values.kind,
      required: values.required,
      description: values.description,
    };

    switch (values.kind) {
      case "select": {
        const filteredItems = selectItems.filter((item) =>
          item.value.trim(),
        );
        data.validationRules = {
          selectItems: filteredItems,
          multipleSelect,
          selectInitialValue: [],
        };
        break;
      }
      case "relation":
      case "relationList": {
        if (referencedApiEndpoint) {
          data.validationRules = { referencedApiEndpoint };
        }
        break;
      }
      case "text": {
        const textRules: Record<string, unknown> = {};
        if (textUnique) textRules.unique = true;
        if (textPatternMatch.trim())
          textRules.patternMatch = textPatternMatch.trim();
        const limit: Record<string, number> = {};
        if (textSizeLimit.min != null) limit.min = textSizeLimit.min;
        if (textSizeLimit.max != null) limit.max = textSizeLimit.max;
        if (Object.keys(limit).length > 0) textRules.textSizeLimit = limit;
        if (Object.keys(textRules).length > 0)
          data.validationRules = textRules;
        break;
      }
      case "textArea": {
        const limit: Record<string, number> = {};
        if (textAreaSizeLimit.min != null)
          limit.min = textAreaSizeLimit.min;
        if (textAreaSizeLimit.max != null)
          limit.max = textAreaSizeLimit.max;
        if (Object.keys(limit).length > 0) {
          data.validationRules = { textSizeLimit: limit };
        }
        break;
      }
      case "number": {
        const limit: Record<string, number> = {};
        if (numberSizeLimit.min != null) limit.min = numberSizeLimit.min;
        if (numberSizeLimit.max != null) limit.max = numberSizeLimit.max;
        if (Object.keys(limit).length > 0) {
          data.validationRules = { numberSizeLimit: limit };
        }
        break;
      }
      case "custom": {
        if (selectedCustomFieldCreatedAt) {
          data.validationRules = {
            customFieldCreatedAt: selectedCustomFieldCreatedAt,
          };
        }
        break;
      }
      case "repeater": {
        const repeaterRules: Record<string, unknown> = {};
        if (repeaterCustomFieldIds.length > 0) {
          repeaterRules.customFieldIds = repeaterCustomFieldIds;
        }
        if (repeaterMinCount != null)
          repeaterRules.minCount = repeaterMinCount;
        if (repeaterMaxCount != null)
          repeaterRules.maxCount = repeaterMaxCount;
        if (Object.keys(repeaterRules).length > 0)
          data.validationRules = repeaterRules;
        break;
      }
    }

    onSave(data);
    form.reset();
  }

  function addSelectItem() {
    setSelectItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), value: "" },
    ]);
  }

  function removeSelectItem(index: number) {
    setSelectItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSelectItem(index: number, value: string) {
    setSelectItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value } : item)),
    );
  }

  function toggleRepeaterCustomField(cfId: string) {
    setRepeaterCustomFieldIds((prev) =>
      prev.includes(cfId)
        ? prev.filter((id) => id !== cfId)
        : [...prev, cfId],
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>表示名</FormLabel>
              <FormControl>
                <Input {...field} placeholder="タイトル" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fieldId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>フィールドID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>型</FormLabel>
              <FormControl>
                <FieldTypePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!!initialData?.id}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel>必須</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Input {...field} placeholder="フィールドの説明" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedKind === "select" && (
          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">選択肢</Label>
            {selectItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <Input
                  value={item.value}
                  onChange={(e) =>
                    updateSelectItem(index, e.target.value)
                  }
                  placeholder={`選択肢 ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSelectItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addSelectItem}
            >
              <Plus className="mr-1 h-4 w-4" />
              選択肢を追加
            </Button>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm">複数選択</Label>
              <Switch
                checked={multipleSelect}
                onCheckedChange={setMultipleSelect}
              />
            </div>
          </div>
        )}

        {(selectedKind === "relation" ||
          selectedKind === "relationList") && (
          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">参照先API</Label>
            {apiSchemas.length > 0 ? (
              <Select
                value={referencedApiEndpoint || undefined}
                onValueChange={setReferencedApiEndpoint}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="APIエンドポイントを選択" />
                </SelectTrigger>
                <SelectContent>
                  {apiSchemas.map((schema) => (
                    <SelectItem
                      key={schema.id}
                      value={schema.endpoint}
                    >
                      {schema.name} ({schema.endpoint})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground text-sm">
                利用可能なAPIスキーマがありません
              </p>
            )}
          </div>
        )}

        {selectedKind === "text" && (
          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">バリデーション</Label>
            <div className="flex items-center justify-between">
              <Label className="text-sm">ユニーク</Label>
              <Switch
                checked={textUnique}
                onCheckedChange={setTextUnique}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">パターン（正規表現）</Label>
              <Input
                value={textPatternMatch}
                onChange={(e) => setTextPatternMatch(e.target.value)}
                placeholder="^[a-z]+$"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-sm">最小文字数</Label>
                <Input
                  type="number"
                  value={textSizeLimit.min ?? ""}
                  onChange={(e) =>
                    handleNumberInput(
                      setTextSizeLimit,
                      "min",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">最大文字数</Label>
                <Input
                  type="number"
                  value={textSizeLimit.max ?? ""}
                  onChange={(e) =>
                    handleNumberInput(
                      setTextSizeLimit,
                      "max",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        {selectedKind === "textArea" && (
          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">バリデーション</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-sm">最小文字数</Label>
                <Input
                  type="number"
                  value={textAreaSizeLimit.min ?? ""}
                  onChange={(e) =>
                    handleNumberInput(
                      setTextAreaSizeLimit,
                      "min",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">最大文字数</Label>
                <Input
                  type="number"
                  value={textAreaSizeLimit.max ?? ""}
                  onChange={(e) =>
                    handleNumberInput(
                      setTextAreaSizeLimit,
                      "max",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        {selectedKind === "number" && (
          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">バリデーション</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-sm">最小値</Label>
                <Input
                  type="number"
                  value={numberSizeLimit.min ?? ""}
                  onChange={(e) =>
                    handleNumberInput(
                      setNumberSizeLimit,
                      "min",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">最大値</Label>
                <Input
                  type="number"
                  value={numberSizeLimit.max ?? ""}
                  onChange={(e) =>
                    handleNumberInput(
                      setNumberSizeLimit,
                      "max",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        {selectedKind === "custom" && (
          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">
              カスタムフィールド
            </Label>
            {customFields.length > 0 ? (
              <Select
                value={selectedCustomFieldCreatedAt || undefined}
                onValueChange={setSelectedCustomFieldCreatedAt}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="カスタムフィールドを選択" />
                </SelectTrigger>
                <SelectContent>
                  {customFields.map((cf) => {
                    const createdAtValue =
                      cf.createdAt instanceof Date
                        ? cf.createdAt.toISOString()
                        : String(cf.createdAt);
                    return (
                      <SelectItem
                        key={cf.id}
                        value={createdAtValue}
                      >
                        {cf.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground text-sm">
                カスタムフィールドがありません
              </p>
            )}
          </div>
        )}

        {selectedKind === "repeater" && (
          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">
              カスタムフィールド
            </Label>
            {customFields.length > 0 ? (
              <div className="space-y-2">
                {customFields.map((cf) => (
                  <div
                    key={cf.id}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={`repeater-cf-${cf.id}`}
                      checked={repeaterCustomFieldIds.includes(cf.id)}
                      onCheckedChange={() =>
                        toggleRepeaterCustomField(cf.id)
                      }
                    />
                    <Label
                      htmlFor={`repeater-cf-${cf.id}`}
                      className="text-sm font-normal"
                    >
                      {cf.name}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                カスタムフィールドがありません
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-sm">最小件数</Label>
                <Input
                  type="number"
                  value={repeaterMinCount ?? ""}
                  onChange={(e) =>
                    setRepeaterMinCount(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">最大件数</Label>
                <Input
                  type="number"
                  value={repeaterMaxCount ?? ""}
                  onChange={(e) =>
                    setRepeaterMaxCount(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        <SheetFooter>
          <Button type="submit">
            {initialData?.id ? "更新" : "追加"}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
