"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { CreateApiSchemaForm } from "@/features/content-hub/manage-schema/components/create-api-schema-form";

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
      // TODO: Call server action to create API schema
      // const result = await createApiSchema({ ...values, serviceId });
      // router.push(`/services/${serviceId}/apis/${result.id}/schema`);
      void values;
      void serviceId;
      router.push(`/services/${serviceId}/apis`);
    });
  }

  return <CreateApiSchemaForm onSubmit={handleSubmit} isPending={isPending} />;
}
