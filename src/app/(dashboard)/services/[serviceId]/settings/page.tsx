import { SettingsPageWrapper } from "./settings-page-wrapper";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  // TODO: Fetch service from backend (integrated at merge time)
  const service = {
    id: serviceId,
    name: "",
    slug: "",
    description: "",
  };

  return (
    <div className="p-6">
      <SettingsPageWrapper service={service} />
    </div>
  );
}
