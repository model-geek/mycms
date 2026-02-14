"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Image,
  Key,
  Webhook,
  Users,
  Settings,
  LayoutDashboard,
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
  SidebarRail,
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

export function AppSidebar({ serviceId }: { serviceId?: string }) {
  const pathname = usePathname();

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
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
