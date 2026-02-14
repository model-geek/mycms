"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/shared/ui/dialog";

import {
  fetchMicrocmsSchemas,
  executeMigrationSchemas,
  migrateContentBatch,
} from "../action";
import type { MigrationPreview, MigrationResult } from "../types";

import { StepCredentials } from "./step-credentials";
import type { MigrationProgress } from "./step-migrating";
import { StepMigrating } from "./step-migrating";
import { StepPreview } from "./step-preview";
import { StepResult } from "./step-result";

type Step = "credentials" | "preview" | "migrating" | "result";

const BATCH_SIZE = 5;

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
  const [progress, setProgress] = useState<MigrationProgress>({
    phase: "schemas",
    contentMigrated: 0,
    contentTotal: 0,
    mediaCount: 0,
  });
  const [isPending, startTransition] = useTransition();
  const isMigrating = useRef(false);

  const reset = useCallback(() => {
    setStep("credentials");
    setPreview(null);
    setMigrationResult(null);
    setProgress({
      phase: "schemas",
      contentMigrated: 0,
      contentTotal: 0,
      mediaCount: 0,
    });
  }, []);

  function handleOpenChange(value: boolean) {
    // 移行中はダイアログを閉じさせない
    if (isMigrating.current) return;
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
    isMigrating.current = true;
    setStep("migrating");
    setProgress({
      phase: "schemas",
      contentMigrated: 0,
      contentTotal: 0,
      mediaCount: 0,
    });

    // async 移行処理（useTransition 外で実行してリアルタイム更新）
    void runMigration(preview);
  }

  async function runMigration(previewData: MigrationPreview) {
    try {
      // Phase 1: スキーマ移行
      const schemaResult = await executeMigrationSchemas(previewData);
      if (!schemaResult.success) {
        toast.error(schemaResult.error);
        isMigrating.current = false;
        setStep("preview");
        return;
      }

      const { serviceId, schemas } = schemaResult.data;

      // コンテンツ移行が不要な場合
      if (
        !previewData.includeContent ||
        !previewData.microcmsServiceId ||
        !previewData.microcmsApiKey
      ) {
        setMigrationResult({
          serviceId,
          contentCount: 0,
          mediaCount: 0,
        });
        setStep("result");
        toast.success("移行が完了しました");
        router.refresh();
        isMigrating.current = false;
        return;
      }

      // Phase 2: コンテンツ移行（バッチ処理）
      const contentTotal = schemas.reduce(
        (sum, s) => sum + s.contentCount,
        0,
      );
      let contentMigrated = 0;
      let totalMedia = 0;
      const debugParts: string[] = [];

      setProgress({
        phase: "content",
        contentMigrated: 0,
        contentTotal,
        mediaCount: 0,
      });

      for (const schema of schemas) {
        if (schema.contentCount === 0) continue;

        for (
          let offset = 0;
          offset < schema.contentCount;
          offset += BATCH_SIZE
        ) {
          const batchResult = await migrateContentBatch({
            microcmsServiceId: previewData.microcmsServiceId,
            microcmsApiKey: previewData.microcmsApiKey,
            dbServiceId: serviceId,
            endpoint: schema.endpoint,
            schemaId: schema.schemaId,
            fields: schema.fields,
            offset,
            limit: BATCH_SIZE,
          });

          if (!batchResult.success) {
            debugParts.push(`batch error at offset=${offset}: ${batchResult.error}`);
            continue;
          }

          contentMigrated += batchResult.data.migrated;
          totalMedia += batchResult.data.mediaCount;
          if (batchResult.data.debugInfo) {
            debugParts.push(batchResult.data.debugInfo);
          }

          setProgress({
            phase: "content",
            currentEndpoint: schema.endpoint,
            contentMigrated,
            contentTotal,
            mediaCount: totalMedia,
          });
        }
      }

      setMigrationResult({
        serviceId,
        contentCount: contentMigrated,
        mediaCount: totalMedia,
        debugInfo:
          debugParts.length > 0 ? debugParts.join("\n") : undefined,
      });
      setStep("result");
      toast.success("移行が完了しました");
      router.refresh();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "移行の実行に失敗しました";
      toast.error(msg);
      setStep("preview");
    } finally {
      isMigrating.current = false;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        showCloseButton={step !== "migrating"}
        onPointerDownOutside={
          step === "migrating" ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          step === "migrating" ? (e) => e.preventDefault() : undefined
        }
      >
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
        {step === "migrating" && <StepMigrating progress={progress} />}
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
