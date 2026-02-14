import { cookies, headers } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { Topbar } from "@/shared/components/topbar";
import { auth } from "@/infrastructure/auth/auth-server";
import { getServicesByOwner } from "@/infrastructure/services/query";

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

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar services={services.map((s) => ({ id: s.id, name: s.name }))} />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
