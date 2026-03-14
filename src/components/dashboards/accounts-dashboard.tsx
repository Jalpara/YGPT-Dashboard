"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/sample-data";
import { useEventsData } from "@/lib/use-events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AccountsDashboard() {
  const { data: events, loading, error } = useEventsData();

  const { stats, chartData, pendingAccountsApprovals, eventsWithBudget } = useMemo(() => {
    const now = new Date();

    const invoicesPending = events.filter(
      (e) => e.budgetRequired === "Yes" && e.spent < e.budget
    ).length;
    const totalBudget = events.reduce((s, e) => s + e.budget, 0);
    const totalSpent = events.reduce((s, e) => s + e.spent, 0);

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { label: d.toLocaleString("en-US", { month: "short" }), month: d.getMonth(), year: d.getFullYear() };
    });

    const financeData = months.map((m) => {
      const monthEvents = events.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      });
      return {
        month: m.label,
        budget: Math.round(monthEvents.reduce((s, e) => s + e.budget, 0) / 1000),
        spent: Math.round(monthEvents.reduce((s, e) => s + e.spent, 0) / 1000),
      };
    });

    const pendingAccountsApprovals = events.filter(
      (e) => (e.approvals?.accounts?.status ?? "Pending") === "Pending"
    );

    const eventsWithBudget = events
      .filter((e) => e.budgetRequired === "Yes")
      .sort((a, b) => b.budget - a.budget);

    return {
      stats: [
        { label: "Invoices pending", value: invoicesPending.toString(), detail: "Budget vs spent gap" },
        { label: "Total budget allocated", value: formatCurrency(totalBudget), detail: "Across all events" },
        { label: "Total spent", value: formatCurrency(totalSpent), detail: `${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of allocated budget` },
      ],
      chartData: financeData,
      pendingAccountsApprovals,
      eventsWithBudget,
    };
  }, [events]);

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        {error ? (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="py-4 text-sm">{error}</CardContent>
          </Card>
        ) : null}

        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Accounts Team
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Finance &amp; accounts overview
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/invoices">View all invoices →</Link>
            </Button>
            <Button asChild>
              <Link href="/approvals">Accounts approvals →</Link>
            </Button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          {loading
            ? [0, 1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="space-y-3 pt-6">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => (
                <Card key={stat.label}>
                  <CardHeader className="pb-2">
                    <CardDescription className="uppercase tracking-[0.2em]">{stat.label}</CardDescription>
                    <CardTitle className="text-2xl">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {stat.detail}
                  </CardContent>
                </Card>
              ))}
        </section>

        {/* Budget vs Spent chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs spent</CardTitle>
            <CardDescription>Monthly planned allocation vs actual spend (₹K)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ChartContainer
                  config={{
                    budget: { label: "Budget (₹K)", color: "hsl(var(--secondary-foreground))" },
                    spent: { label: "Spent (₹K)", color: "hsl(var(--primary))" },
                  }}
                >
                  <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltipContent />
                    <Line dataKey="budget" stroke="hsl(var(--secondary-foreground))" strokeWidth={2} dot={false} />
                    <Line dataKey="spent" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget events table + pending approvals */}
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Events with budget</CardTitle>
                <CardDescription>All events requiring budget sign-off, sorted by allocation.</CardDescription>
              </div>
              <Button asChild variant="link">
                <Link href="/invoices">Invoices →</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Accounts approval</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 4 }, (_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }, (_, c) => (
                            <TableCell key={c}><Skeleton className="h-3 w-16" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : eventsWithBudget.map((event) => {
                        const accountsStatus = event.approvals?.accounts?.status ?? "Pending";
                        return (
                          <TableRow key={event.code}>
                            <TableCell className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {event.code}
                            </TableCell>
                            <TableCell>
                              <Link href={`/events/${event.code}`} className="font-semibold hover:underline">
                                {event.title}
                              </Link>
                              <p className="text-xs text-muted-foreground">{event.city}</p>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(event.date)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  accountsStatus === "Approved"
                                    ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                                    : accountsStatus === "Rejected"
                                    ? "bg-rose-100 text-rose-900 border-rose-200"
                                    : accountsStatus === "Need Changes"
                                    ? "bg-amber-100 text-amber-900 border-amber-200"
                                    : "bg-secondary text-secondary-foreground border-secondary"
                                }
                              >
                                {accountsStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {formatCurrency(event.budget)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {formatCurrency(event.spent)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending accounts approvals</CardTitle>
                <CardDescription>
                  {loading
                    ? "..."
                    : `${pendingAccountsApprovals.length} event${pendingAccountsApprovals.length !== 1 ? "s" : ""} awaiting accounts sign-off.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-8 w-full" />)
                ) : pendingAccountsApprovals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All caught up.</p>
                ) : (
                  pendingAccountsApprovals.slice(0, 4).map((event) => (
                    <div key={event.code} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.code} · {event.city}</p>
                      </div>
                      <Badge variant="secondary">{formatCurrency(event.budget)}</Badge>
                    </div>
                  ))
                )}
                <Button asChild className="w-full mt-2">
                  <Link href="/approvals">Go to approvals →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
