import { notFound } from "next/navigation";
import { ServiceProvider } from "@/infrastructure/services/service-context";

export default async function ServiceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  // TODO: Fetch service from database
  // For now, use placeholder data
  const service = {
    serviceId,
    serviceName: "サービス",
    serviceSlug: serviceId,
  };

  if (!service) {
    notFound();
  }

  return (
    <ServiceProvider service={service}>
      {children}
    </ServiceProvider>
  );
}
