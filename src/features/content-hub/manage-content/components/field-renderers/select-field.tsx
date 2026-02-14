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

interface SelectFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function SelectField({ field, control }: SelectFieldProps) {
  const rules = field.validationRules as {
    options?: string[];
    multipleSelect?: boolean;
  } | null;
  const options = rules?.options ?? [];
  const isMultiple = rules?.multipleSelect === true;

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
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.name}
            {field.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </FormLabel>
          <Select
            onValueChange={formField.onChange}
            defaultValue={formField.value}
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
      )}
    />
  );
}
