"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  useSidebar,
} from "@/shared/ui/sidebar";
import { UserMenu } from "@/infrastructure/auth/user-menu";

const contentItems = [
  { title: "API", icon: FileText, segment: "apis" },
  { title: "メディア", icon: Image, segment: "media" },
];

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

export function AppSidebar() {
  const pathname = usePathname();
  const serviceId = extractServiceId(pathname);

  const basePath = serviceId ? `/services/${serviceId}` : "";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/services">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">mycms</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Headless CMS
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {serviceId && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>コンテンツ</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {contentItems.map((item) => {
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
