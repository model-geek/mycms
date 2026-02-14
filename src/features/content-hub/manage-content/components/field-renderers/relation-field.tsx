"use client";

import { useState } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import type { SchemaFieldDef } from "./types";

interface RelationFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

interface RelationOption {
  id: string;
  title: string;
}

export function RelationField({ field, control }: RelationFieldProps) {
  const [open, setOpen] = useState(false);

  // Placeholder options - actual data fetching via server actions
  const options: RelationOption[] = [];

  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => {
        const selected = options.find((o) => o.id === formField.value);

        return (
          <FormItem className="flex flex-col">
            <FormLabel>
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between font-normal"
                    >
                      {selected ? selected.title : "コンテンツを選択..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <Command>
                      <CommandInput placeholder="検索..." />
                      <CommandList>
                        <CommandEmpty>
                          コンテンツが見つかりません
                        </CommandEmpty>
                        <CommandGroup>
                          {options.map((option) => (
                            <CommandItem
                              key={option.id}
                              value={option.id}
                              onSelect={() => {
                                formField.onChange(option.id);
                                setOpen(false);
                              }}
                            >
                              {option.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {formField.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => formField.onChange(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
