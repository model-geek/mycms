"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { CreateApiSchemaForm } from "@/features/content-hub/manage-schema/components/create-api-schema-form";
import { createApiSchema } from "@/features/content-hub/manage-schema/action";

interface NewApiSchemaFormWrapperProps {
  serviceId: string;
}

export function NewApiSchemaFormWrapper({
  serviceId,
}: NewApiSchemaFormWrapperProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(values: {
    name: string;
    endpoint: string;
    type: string;
  }) {
    startTransition(async () => {
      const result = await createApiSchema({ ...values, serviceId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("APIスキーマを作成しました");
      router.push(`/services/${serviceId}/apis/${result.data.id}/schema`);
    });
  }

  return <CreateApiSchemaForm onSubmit={handleSubmit} isPending={isPending} />;
}
