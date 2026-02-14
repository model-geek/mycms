"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";

import { FieldTypePicker } from "./field-type-picker";
import { SubFieldEditor, type SubFieldDef } from "./sub-field-editor";

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
  selectOptions: z.string().optional(),
  multipleSelect: z.boolean().optional(),
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

interface FieldEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FieldEditorData | null;
  onSave: (data: FieldEditorData) => void;
}

interface RepeaterRules {
  subFields?: SubFieldDef[];
}

interface SelectRules {
  options?: string[];
  multipleSelect?: boolean;
}

function parseSubFields(data: FieldEditorData | null | undefined): SubFieldDef[] {
  if (!data || data.kind !== "repeater") return [];
  const rules = data.validationRules as RepeaterRules | null;
  return (rules?.subFields ?? []).map((sf) => ({
    id: sf.id ?? sf.fieldId,
    fieldId: sf.fieldId,
    name: sf.name,
    kind: sf.kind ?? ((sf as unknown as Record<string, unknown>).mycmsKind as string) ?? "text",
    required: sf.required ?? false,
    description: sf.description,
    validationRules: sf.validationRules,
  }));
}

function parseSelectRules(data: FieldEditorData | null | undefined): SelectRules | null {
  if (!data || data.kind !== "select") return null;
  return data.validationRules as SelectRules | null;
}

export function FieldEditor({
  open,
  onOpenChange,
  initialData,
  onSave,
}: FieldEditorProps) {
  const selectRules = parseSelectRules(initialData);

  const [subFields, setSubFields] = useState<SubFieldDef[]>(() =>
    parseSubFields(initialData),
  );

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      fieldId: initialData?.fieldId ?? "",
      kind: initialData?.kind ?? "text",
      required: initialData?.required ?? false,
      description: initialData?.description ?? "",
      selectOptions: selectRules?.options?.join("\n") ?? "",
      multipleSelect: selectRules?.multipleSelect ?? false,
    },
  });

  useEffect(() => {
    if (open) {
      const rules = parseSelectRules(initialData);
      form.reset({
        name: initialData?.name ?? "",
        fieldId: initialData?.fieldId ?? "",
        kind: initialData?.kind ?? "text",
        required: initialData?.required ?? false,
        description: initialData?.description ?? "",
        selectOptions: rules?.options?.join("\n") ?? "",
        multipleSelect: rules?.multipleSelect ?? false,
      });
      setSubFields(parseSubFields(initialData));
    }
  }, [open, initialData, form]);

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

    if (values.kind === "select" && values.selectOptions) {
      data.validationRules = {
        options: values.selectOptions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        ...(values.multipleSelect ? { multipleSelect: true } : {}),
      };
    }

    if (values.kind === "repeater") {
      data.validationRules = {
        subFields: subFields.map((sf) => ({
          fieldId: sf.fieldId,
          name: sf.name,
          kind: sf.kind,
          required: sf.required ?? false,
          description: sf.description,
          validationRules: sf.validationRules,
        })),
      };
    }

    onSave(data);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {initialData?.id ? "フィールド編集" : "フィールド追加"}
          </SheetTitle>
        </SheetHeader>
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
              <>
                <FormField
                  control={form.control}
                  name="selectOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>選択肢（改行区切り）</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={"オプション1\nオプション2\nオプション3"}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multipleSelect"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel>複数選択</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {selectedKind === "repeater" && (
              <SubFieldEditor
                subFields={subFields}
                onChange={setSubFields}
              />
            )}

            <SheetFooter>
              <Button type="submit">
                {initialData?.id ? "更新" : "追加"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
