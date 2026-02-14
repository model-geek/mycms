import { notFound } from "next/navigation";
import { ServiceProvider } from "@/infrastructure/services/service-context";
import { getServiceById } from "@/infrastructure/services/query";

export default async function ServiceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const dbService = await getServiceById(serviceId);

  if (!dbService) {
    notFound();
  }

  const service = {
    serviceId: dbService.id,
    serviceName: dbService.name,
    serviceSlug: dbService.slug,
  };

  return (
    <ServiceProvider service={service}>
      {children}
    </ServiceProvider>
  );
}
