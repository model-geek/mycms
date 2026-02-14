"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { SettingsForm } from "@/infrastructure/services/settings-form";

interface SettingsPageWrapperProps {
  service: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
}

export function SettingsPageWrapper({ service }: SettingsPageWrapperProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(
    (data: { name: string; slug: string; description: string }) => {
      setError(null);
      startTransition(async () => {
        const { updateService } = await import(
          "@/infrastructure/services/action"
        );
        const result = await updateService(service.id, data);
        if (!result.success) {
          setError(result.error);
        }
      });
    },
    [service.id],
  );

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      const { deleteService } = await import(
        "@/infrastructure/services/action"
      );
      const result = await deleteService(service.id);
      if (result.success) {
        router.push("/services");
      } else {
        setError(result.error);
      }
    });
  }, [service.id, router]);

  return (
    <SettingsForm
      service={service}
      error={error}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
