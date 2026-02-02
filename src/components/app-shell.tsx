"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Home,
  Images,
  ListChecks,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { title: "Overview", href: "/", icon: Home },
  { title: "Events", href: "/events", icon: CalendarDays },
  { title: "Invoices", href: "/invoices", icon: FileText },
  { title: "Photos", href: "/photos", icon: Images },
  { title: "Approvals", href: "/approvals", icon: ListChecks },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
              <Image src="/logo.avif" alt="YGPT logo" width={28} height={28} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">YGPT Dashboard</p>
              <p className="text-xs text-muted-foreground">Event Ops</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                Sidebar shortcuts can be customized per role.
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-2">
          <Button variant="secondary" size="sm" className="w-full">
            Sync status
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 md:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <p className="text-sm font-medium text-muted-foreground">
            Trustee workspace
          </p>
        </header>
        <div>{children}</div>
      </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
