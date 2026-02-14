"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export const FIELD_TYPES = {
  text: { label: "テキスト", description: "1行のテキスト入力" },
  textArea: { label: "テキストエリア", description: "複数行のテキスト入力" },
  number: { label: "数値", description: "数値入力" },
  boolean: { label: "真偽値", description: "ON/OFFの切り替え" },
  select: { label: "セレクト", description: "選択肢から1つ選ぶ" },
  date: { label: "日付", description: "日付の入力" },
  richEditor: {
    label: "リッチエディタ",
    description: "リッチテキストエディタ (Phase 3)",
  },
  media: { label: "メディア", description: "画像・ファイル (Phase 4)" },
  relation: {
    label: "リレーション",
    description: "他コンテンツとの関連 (Phase 4)",
  },
} as const;

export type FieldKind = keyof typeof FIELD_TYPES;

interface FieldTypePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function FieldTypePicker({ value, onChange }: FieldTypePickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="フィールドの型を選択" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(FIELD_TYPES).map(([key, type]) => (
          <SelectItem key={key} value={key}>
            <span className="font-medium">{type.label}</span>
            <span className="text-muted-foreground ml-2 text-xs">
              {type.description}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
