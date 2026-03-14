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
  LogOut,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth, type UserRole } from "@/contexts/auth-context";

const roleLabels: Record<UserRole, string> = {
  regional: "Regional Head",
  head: "YGPT Head",
  accounts: "Accounts Team",
};

const allNavItems = [
  { title: "Overview", href: "/", icon: Home, roles: ["regional", "head", "accounts"] as UserRole[] },
  { title: "Events", href: "/events", icon: CalendarDays, roles: ["regional", "head", "accounts"] as UserRole[] },
  { title: "Invoices", href: "/invoices", icon: FileText, roles: ["head", "accounts"] as UserRole[] },
  { title: "Photos", href: "/photos", icon: Images, roles: ["head", "accounts"] as UserRole[] },
  { title: "Approvals", href: "/approvals", icon: ListChecks, roles: ["regional", "head", "accounts"] as UserRole[] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  // Don't render the shell on the login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  const navItems = user
    ? allNavItems.filter((item) => item.roles.includes(user.role))
    : allNavItems;

  const workspaceLabel = user
    ? `${user.name.split(" ")[0]}'s workspace`
    : "YGPT workspace";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "YG";

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

            {user ? (
              <SidebarGroup>
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="flex items-center gap-3 rounded-md px-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL} alt={user.name} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{user.name}</p>
                      <Badge variant="secondary" className="mt-0.5 text-[10px]">
                        {roleLabels[user.role]}
                      </Badge>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            ) : null}
          </SidebarContent>
          <SidebarFooter className="px-2 gap-2">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            ) : null}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center gap-3 border-b bg-card px-4 py-3 md:px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <p className="text-sm font-medium text-muted-foreground">
              {loading ? "Loading..." : workspaceLabel}
            </p>
            {user ? (
              <Badge variant="outline" className="ml-auto text-xs">
                {roleLabels[user.role]}
              </Badge>
            ) : null}
          </header>
          <div>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
