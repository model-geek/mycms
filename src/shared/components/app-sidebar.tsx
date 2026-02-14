"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  FileText,
  Image,
  Key,
  Webhook,
  Users,
  Settings,
  LayoutDashboard,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Check,
  ArrowLeftRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { UserMenu } from "@/infrastructure/auth/user-menu";

type SidebarService = { id: string; name: string };
type SidebarApi = { id: string; name: string; endpoint: string };

const settingsItems = [
  { title: "APIキー", icon: Key, segment: "api-keys" },
  { title: "Webhook", icon: Webhook, segment: "webhooks" },
  { title: "メンバー", icon: Users, segment: "members" },
  { title: "設定", icon: Settings, segment: "settings" },
];

function extractServiceId(pathname: string): string | undefined {
  const match = pathname.match(/^\/services\/([^/]+)/);
  return match?.[1];
}

export function AppSidebar({
  services,
  apisByService = {},
}: {
  services: SidebarService[];
  apisByService?: Record<string, SidebarApi[]>;
}) {
  const pathname = usePathname();
  const serviceId = extractServiceId(pathname);

  const basePath = serviceId ? `/services/${serviceId}` : "";
  const currentService = services.find((s) => s.id === serviceId);
  const apis = serviceId ? (apisByService[serviceId] ?? []) : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ServiceSwitcher
          services={services}
          currentService={currentService}
        />
      </SidebarHeader>
      <SidebarContent>
        {serviceId && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>コンテンツ</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `${basePath}/apis` || pathname === `${basePath}/apis/new`}
                      tooltip="API"
                    >
                      <Link href={`${basePath}/apis`}>
                        <FileText />
                        <span>API</span>
                      </Link>
                    </SidebarMenuButton>
                    {apis.length > 0 && (
                      <SidebarMenuSub>
                        {apis.map((api) => {
                          const apiHref = `${basePath}/apis/${api.id}`;
                          const isActive = pathname.startsWith(apiHref);
                          return (
                            <SidebarMenuSubItem key={api.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                              >
                                <Link href={apiHref}>
                                  <span>{api.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(`${basePath}/media`)}
                      tooltip="メディア"
                    >
                      <Link href={`${basePath}/media`}>
                        <Image />
                        <span>メディア</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>設定</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsItems.map((item) => {
                    const href = `${basePath}/${item.segment}`;
                    const isActive = pathname.startsWith(href);
                    return (
                      <SidebarMenuItem key={item.segment}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link href={href}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CollapseToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ServiceSwitcher({
  services,
  currentService,
}: {
  services: SidebarService[];
  currentService: SidebarService | undefined;
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={currentService?.name ?? "サービス一覧"}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentService?.name ?? "mycms"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {currentService ? "サービス" : "Headless CMS"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              サービス
            </DropdownMenuLabel>
            {services.map((service) => (
              <DropdownMenuItem
                key={service.id}
                onClick={() => router.push(`/services/${service.id}/apis`)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <LayoutDashboard className="size-4 shrink-0" />
                </div>
                <span className="truncate">{service.name}</span>
                {service.id === currentService?.id && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/services")}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                <ArrowLeftRight className="size-4" />
              </div>
              <span className="text-muted-foreground">サービス一覧</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <SidebarMenuButton
      tooltip={isDark ? "ライトモード" : "ダークモード"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
      <span>{isDark ? "ライトモード" : "ダークモード"}</span>
    </SidebarMenuButton>
  );
}

function CollapseToggle() {
  const { toggleSidebar, state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <SidebarMenuButton
      tooltip={isExpanded ? "サイドバーを閉じる" : "サイドバーを開く"}
      onClick={toggleSidebar}
    >
      {isExpanded ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
      <span>{isExpanded ? "サイドバーを閉じる" : "サイドバーを開く"}</span>
    </SidebarMenuButton>
  );
}
