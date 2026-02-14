"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { SchemaFieldDef } from "./components/field-renderers";

function buildZodSchema(fields: SchemaFieldDef[]) {
  const shape: Record<string, z.ZodType> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodType;

    switch (field.kind) {
      case "text":
      case "textArea":
      case "select":
        fieldSchema = field.required
          ? z.string().min(1, `${field.name}は必須です`)
          : z.string().optional();
        break;
      case "number":
        fieldSchema = field.required
          ? z.number({ error: `${field.name}は必須です` })
          : z.number().optional();
        break;
      case "boolean":
        fieldSchema = z.boolean().optional();
        break;
      case "date":
        fieldSchema = field.required
          ? z.string().min(1, `${field.name}は必須です`)
          : z.string().optional();
        break;
      default:
        fieldSchema = z.unknown().optional();
    }

    shape[field.fieldId] = fieldSchema;
  }

  return z.object(shape);
}

function buildDefaultValues(
  fields: SchemaFieldDef[],
  existingData?: Record<string, unknown> | null
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const field of fields) {
    const existing = existingData?.[field.fieldId];
    if (existing !== undefined) {
      defaults[field.fieldId] = existing;
      continue;
    }

    switch (field.kind) {
      case "text":
      case "textArea":
      case "select":
      case "date":
        defaults[field.fieldId] = "";
        break;
      case "number":
        defaults[field.fieldId] = 0;
        break;
      case "boolean":
        defaults[field.fieldId] = false;
        break;
      default:
        defaults[field.fieldId] = undefined;
    }
  }

  return defaults;
}

interface UseContentFormOptions {
  fields: SchemaFieldDef[];
  existingData?: Record<string, unknown> | null;
}

export function useContentForm({ fields, existingData }: UseContentFormOptions) {
  const schema = useMemo(() => buildZodSchema(fields), [fields]);
  const defaultValues = useMemo(
    () => buildDefaultValues(fields, existingData),
    [fields, existingData]
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const getFormData = useCallback(() => {
    return form.getValues();
  }, [form]);

  return { form, getFormData };
}
