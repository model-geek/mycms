"use client";

import { useTransition } from "react";

import { SchemaBuilder } from "@/features/content-hub/manage-schema/components/schema-builder";
import type { FieldItem } from "@/features/content-hub/manage-schema/components/sortable-field-list";

interface SchemaBuilderWrapperProps {
  serviceId: string;
  apiId: string;
  schemaName: string;
  initialFields: FieldItem[];
}

export function SchemaBuilderWrapper({
  serviceId,
  apiId,
  schemaName,
  initialFields,
}: SchemaBuilderWrapperProps) {
  const [isPending, startTransition] = useTransition();

  function handleSave(fields: FieldItem[]) {
    startTransition(async () => {
      // TODO: Call server action to save schema fields
      void serviceId;
      void apiId;
      void fields;
    });
  }

  return (
    <SchemaBuilder
      schemaName={schemaName}
      initialFields={initialFields}
      onSave={handleSave}
      isPending={isPending}
    />
  );
}
