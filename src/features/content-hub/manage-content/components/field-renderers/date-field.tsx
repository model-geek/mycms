"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { Control, FieldValues } from "react-hook-form";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import type { SchemaFieldDef } from "./types";

interface DateFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function DateField({ field, control }: DateFieldProps) {
  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {field.name}
            {field.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formField.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {formField.value
                    ? format(new Date(formField.value), "PPP", { locale: ja })
                    : "日付を選択"}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  formField.value ? new Date(formField.value) : undefined
                }
                onSelect={(date) =>
                  formField.onChange(date?.toISOString() ?? null)
                }
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
