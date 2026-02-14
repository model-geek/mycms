"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/shared/ui/dialog";

import { fetchMicrocmsSchemas, executeMigration } from "../action";
import type { MigrationPreview, MigrationResult } from "../types";

import { StepCredentials } from "./step-credentials";
import { StepPreview } from "./step-preview";
import { StepResult } from "./step-result";

type Step = "credentials" | "preview" | "result";

interface MigrateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MigrateDialog({ open, onOpenChange }: MigrateDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [migrationResult, setMigrationResult] =
    useState<MigrationResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = useCallback(() => {
    setStep("credentials");
    setPreview(null);
    setMigrationResult(null);
  }, []);

  function handleOpenChange(value: boolean) {
    if (!value) reset();
    onOpenChange(value);
  }

  function handleFetch(values: {
    serviceId: string;
    apiKey: string;
    endpoints: string;
    serviceName: string;
    serviceSlug: string;
    includeContent: boolean;
  }) {
    startTransition(async () => {
      const result = await fetchMicrocmsSchemas(values);
      if (result.success) {
        setPreview(result.data);
        setStep("preview");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleExecute() {
    if (!preview) return;
    startTransition(async () => {
      const result = await executeMigration(preview);
      if (result.success) {
        setMigrationResult(result.data);
        setStep("result");
        toast.success("移行が完了しました");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && step === "credentials" && (
          <StepCredentials isPending={isPending} onSubmit={handleFetch} />
        )}
        {step === "preview" && preview && (
          <StepPreview
            preview={preview}
            isPending={isPending}
            onExecute={handleExecute}
            onBack={() => setStep("credentials")}
          />
        )}
        {step === "result" && migrationResult && preview && (
          <StepResult
            result={migrationResult}
            serviceName={preview.serviceName}
            onClose={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
