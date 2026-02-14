"use client";

import { Download } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/shared/ui/button";

import { exportSchema } from "../export-action";

interface SchemaExportButtonProps {
  apiSchemaId: string;
  serviceId: string;
  schemaName: string;
}

export function SchemaExportButton({
  apiSchemaId,
  serviceId,
  schemaName,
}: SchemaExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportSchema(apiSchemaId, serviceId);
      if (!result.success) {
        throw new Error(result.error);
      }

      const json = JSON.stringify(result.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${schemaName}-schema.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Export failure is visible to user via the download not happening
    } finally {
      setIsExporting(false);
    }
  }, [apiSchemaId, serviceId, schemaName]);

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      <Download className="size-4" />
      {isExporting ? "エクスポート中..." : "エクスポート"}
    </Button>
  );
}
