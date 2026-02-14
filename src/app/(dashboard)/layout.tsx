import { cookies, headers } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { Topbar } from "@/shared/components/topbar";
import { auth } from "@/infrastructure/auth/auth-server";
import { getServicesByOwner } from "@/infrastructure/services/query";
import { getApiSchemasByService } from "@/features/content-hub/manage-schema/query";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieStore, session] = await Promise.all([
    cookies(),
    auth.api.getSession({ headers: await headers() }),
  ]);
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const services = session
    ? await getServicesByOwner(session.user.id)
    : [];

  // Fetch APIs for all services in parallel
  const apisByService: Record<string, { id: string; name: string; endpoint: string }[]> = {};
  if (services.length > 0) {
    const allApis = await Promise.all(
      services.map((s) => getApiSchemasByService(s.id))
    );
    for (let i = 0; i < services.length; i++) {
      apisByService[services[i].id] = allApis[i].map((a) => ({
        id: a.id,
        name: a.name,
        endpoint: a.endpoint,
      }));
    }
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        services={services.map((s) => ({ id: s.id, name: s.name }))}
        apisByService={apisByService}
      />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
