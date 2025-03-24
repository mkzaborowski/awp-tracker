import * as React from "react"
import {GalleryVerticalEnd, Timer} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string;
  url: string;
  isActive?: boolean;
}

const timestamp = new Date().toLocaleString();
const data = {
  navMain: [
    {
      title: "All Weather Portfolio",
      url: `/dashboard/awp`,
      items: [
        {
          title: "Home",
          url: `/dashboard/awp`,
          isActive: true,
        },
        {
          title: "Graphs",
          url: "/dashboard/state-graph",
          isActive: false,
        },
        {
          title: "Compare",
          url: "/dashboard",
          isActive: false,
        },
        {
          title: "Wallet Upscaler",
          url: "/dashboard/investment_calculator",
          isActive: false,
        },
      ] as NavItem[],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
      <Sidebar {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">AWP Tracker</span>
                    <span className="">{timestamp}</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="font-medium">
                        {item.title}
                      </a>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                        <SidebarMenuSub>
                          {item.items.map((item) => (
                              <SidebarMenuSubItem key={item.title}>
                                <SidebarMenuSubButton asChild isActive={item.isActive || false}>
                                  <a href={item.url}>{item.title}</a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
  )
}