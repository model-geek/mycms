"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const FIELD_TYPE_OPTIONS: Record<string, { label: string; description: string }> = {
  text: { label: "テキスト", description: "1行のテキスト入力" },
  textArea: { label: "テキストエリア", description: "複数行のテキスト入力" },
  number: { label: "数値", description: "数値入力" },
  boolean: { label: "真偽値", description: "ON/OFFの切り替え" },
  select: { label: "セレクト", description: "選択肢から選ぶ" },
  date: { label: "日付", description: "日付の入力" },
  richEditor: { label: "リッチエディタ", description: "リッチテキストエディタ" },
  media: { label: "メディア", description: "画像・ファイル" },
  mediaList: { label: "メディアリスト", description: "複数の画像・ファイル" },
  repeater: { label: "繰り返し", description: "子フィールドの繰り返し" },
  relation: { label: "リレーション", description: "他コンテンツとの関連" },
  relationList: { label: "リレーションリスト", description: "他コンテンツとの関連（複数）" },
  custom: { label: "カスタム", description: "カスタムフィールド" },
};

interface FieldTypePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  excludeKinds?: Set<string>;
}

export function FieldTypePicker({ value, onChange, disabled, excludeKinds }: FieldTypePickerProps) {
  const entries = excludeKinds
    ? Object.entries(FIELD_TYPE_OPTIONS).filter(([key]) => !excludeKinds.has(key))
    : Object.entries(FIELD_TYPE_OPTIONS);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="フィールドの型を選択" />
      </SelectTrigger>
      <SelectContent>
        {entries.map(([key, type]) => (
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
