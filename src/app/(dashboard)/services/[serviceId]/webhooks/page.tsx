import { WebhookList } from "@/features/webhooks/manage-webhooks/components/webhook-list";
import { listWebhooks } from "@/features/webhooks/manage-webhooks/query";

export default async function WebhooksPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const webhooks = await listWebhooks(serviceId);

  return (
    <div className="p-6">
      <WebhookList serviceId={serviceId} webhooks={webhooks} />
    </div>
  );
}
