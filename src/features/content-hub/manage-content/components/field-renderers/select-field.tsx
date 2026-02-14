"use client";

import type { Control, FieldValues } from "react-hook-form";

import { Checkbox } from "@/shared/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import type { SchemaFieldDef } from "./types";

interface SelectItemEntry {
  id: string;
  value: string;
}

interface SelectFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

function getOptions(field: SchemaFieldDef): string[] {
  const rules = field.validationRules as {
    selectItems?: SelectItemEntry[];
    options?: string[];
    multipleSelect?: boolean;
  } | null;

  if (rules?.selectItems) {
    return rules.selectItems.map((item) => item.value);
  }
  return rules?.options ?? [];
}

function getIsMultiple(field: SchemaFieldDef): boolean {
  const rules = field.validationRules as {
    multipleSelect?: boolean;
  } | null;
  return rules?.multipleSelect === true;
}

export function SelectField({ field, control }: SelectFieldProps) {
  const options = getOptions(field);
  const isMultiple = getIsMultiple(field);

  if (isMultiple) {
    return (
      <FormField
        control={control}
        name={field.fieldId}
        render={({ field: formField }) => {
          const selected: string[] = Array.isArray(formField.value)
            ? formField.value
            : [];

          function toggle(option: string) {
            const next = selected.includes(option)
              ? selected.filter((v) => v !== option)
              : [...selected, option];
            formField.onChange(next);
          }

          return (
            <FormItem>
              <FormLabel>
                {field.name}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FormLabel>
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <Checkbox
                      id={`${field.fieldId}-${option}`}
                      checked={selected.includes(option)}
                      onCheckedChange={() => toggle(option)}
                    />
                    <Label
                      htmlFor={`${field.fieldId}-${option}`}
                      className="text-sm font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => {
        const currentValue: string[] = Array.isArray(formField.value)
          ? formField.value
          : [];
        const displayValue = currentValue[0] ?? "";

        return (
          <FormItem>
            <FormLabel>
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
            <Select
              value={displayValue || undefined}
              onValueChange={(val) => formField.onChange([val])}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
