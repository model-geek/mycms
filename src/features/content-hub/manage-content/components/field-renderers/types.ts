import type { Control, FieldValues } from "react-hook-form";

export interface SchemaFieldDef {
  id: string;
  fieldId: string;
  name: string;
  kind: string;
  description?: string | null;
  required?: boolean | null;
  position: number;
  validationRules?: unknown;
}

export interface FieldRendererProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}
