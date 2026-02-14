"use client";

import { useState } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { ChevronsUpDown, X } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
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

interface RelationListFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

interface RelationOption {
  id: string;
  title: string;
}

export function RelationListField({ field, control }: RelationListFieldProps) {
  const [open, setOpen] = useState(false);

  // Placeholder options - actual data fetching via server actions
  const options: RelationOption[] = [];

  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => {
        const selectedIds: string[] = formField.value ?? [];

        const handleSelect = (id: string) => {
          if (selectedIds.includes(id)) {
            formField.onChange(selectedIds.filter((v: string) => v !== id));
          } else {
            formField.onChange([...selectedIds, id]);
          }
        };

        const handleRemove = (id: string) => {
          formField.onChange(selectedIds.filter((v: string) => v !== id));
        };

        return (
          <FormItem className="flex flex-col">
            <FormLabel>
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between font-normal"
                    >
                      {selectedIds.length > 0
                        ? `${selectedIds.length} 件選択中`
                        : "コンテンツを選択..."}
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
                              onSelect={() => handleSelect(option.id)}
                            >
                              <span className="flex-1">{option.title}</span>
                              {selectedIds.includes(option.id) && (
                                <Badge variant="secondary" className="ml-2">
                                  選択中
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedIds.map((id: string) => {
                      const option = options.find((o) => o.id === id);
                      return (
                        <Badge key={id} variant="secondary">
                          {option?.title ?? id}
                          <button
                            type="button"
                            className="ml-1 rounded-full outline-none hover:bg-muted"
                            onClick={() => handleRemove(id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
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
