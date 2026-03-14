"use client";

import { useAuth } from "@/contexts/auth-context";
import { RegionalDashboard } from "@/components/dashboards/regional-dashboard";
import { HeadDashboard } from "@/components/dashboards/head-dashboard";
import { AccountsDashboard } from "@/components/dashboards/accounts-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="px-6 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // AUTH TEMPORARILY DISABLED — shows HeadDashboard by default
  if (!user) return <HeadDashboard />;

  if (user.role === "regional") return <RegionalDashboard />;
  if (user.role === "head") return <HeadDashboard />;
  if (user.role === "accounts") return <AccountsDashboard />;

  return <HeadDashboard />;
}
