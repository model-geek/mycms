import { notFound } from "next/navigation";
import { getServiceById } from "@/infrastructure/services/query";

import { SettingsPageWrapper } from "./settings-page-wrapper";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const dbService = await getServiceById(serviceId);

  if (!dbService) {
    notFound();
  }

  const service = {
    id: dbService.id,
    name: dbService.name,
    slug: dbService.slug,
    description: dbService.description ?? "",
  };

  return (
    <div className="p-6">
      <SettingsPageWrapper service={service} />
    </div>
  );
}
