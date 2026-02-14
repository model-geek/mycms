import { redirect } from "next/navigation";

export default async function ServiceDashboardPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  redirect(`/services/${serviceId}/apis`);
}
