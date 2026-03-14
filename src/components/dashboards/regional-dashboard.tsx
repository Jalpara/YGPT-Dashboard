"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatCurrency, formatDate, statusLabels, statusStyles } from "@/lib/sample-data";
import { useEventsData } from "@/lib/use-events";
import { useAuth } from "@/contexts/auth-context";
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
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// City code → full city name mapping
const cityNames: Record<string, string> = {
  MUM: "Mumbai",
  DEL: "Delhi",
  PUN: "Pune",
  RPR: "Raipur",
  ASR: "Amritsar",
};

export function RegionalDashboard() {
  const { user } = useAuth();
  const { data: events, loading, error } = useEventsData();

  const cityCode = user?.city ?? "";
  const cityName = cityNames[cityCode] ?? cityCode;

  const { cityEvents, stats, chartData } = useMemo(() => {
    const city = cityEvents_filtered(events, cityCode);
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);

    const activeProposals = city.filter((e) => e.status === "proposal").length;
    const quarterCount = city.filter((e) => {
      const d = new Date(e.date);
      return d >= quarterStart && d <= quarterEnd;
    }).length;
    const pendingRegional = city.filter(
      (e) => (e.approvals?.regional?.status ?? "Pending") === "Pending"
    ).length;

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { label: d.toLocaleString("en-US", { month: "short" }), month: d.getMonth(), year: d.getFullYear() };
    });

    const volumeData = months.map((m) => ({
      month: m.label,
      events: city.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      }).length,
      budget: Math.round(
        city
          .filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === m.month && d.getFullYear() === m.year;
          })
          .reduce((sum, e) => sum + e.budget, 0) / 1000
      ),
    }));

    return {
      cityEvents: city,
      stats: [
        { label: "Active proposals", value: activeProposals.toString(), detail: "Awaiting regional review" },
        { label: "Events this quarter", value: quarterCount.toString(), detail: `In ${cityName}` },
        { label: "Pending regional approval", value: pendingRegional.toString(), detail: "Your sign-off needed" },
      ],
      chartData: volumeData,
    };
  }, [events, cityCode, cityName]);

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
              Regional Head · {cityName}
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">
              {cityName} operations
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfnCUKzk4Fb5ubGzRB6ROaymRFhxlKqVgYnLTC45m4gKN-VvA/viewform"
                target="_blank"
                rel="noreferrer"
              >
                Event Proposal Form ↗
              </a>
            </Button>
            <Button asChild>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScE_gI2KKfxnx9Hi_gaVYpUvJS_68KNqys1-XngSP--ASeasg/viewform"
                target="_blank"
                rel="noreferrer"
              >
                Event Completion Form ↗
              </a>
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
                    <Skeleton className="h-8 w-16" />
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

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>City event volume</CardTitle>
            <CardDescription>Monthly events and budget (₹K) in {cityName}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ChartContainer
                config={{
                  events: { label: "Events", color: "hsl(var(--primary))" },
                  budget: { label: "Budget (₹K)", color: "hsl(var(--muted-foreground))" },
                }}
              >
                <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltipContent />
                  <Bar dataKey="events" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="budget" fill="hsl(var(--muted-foreground))" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* City events table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{cityName} events</CardTitle>
              <CardDescription>All events in your city.</CardDescription>
            </div>
            <Button asChild variant="link">
              <Link href="/events">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Regional approval</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }, (_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }, (_, c) => (
                          <TableCell key={c}><Skeleton className="h-3 w-20" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : cityEvents.map((event) => {
                      const regionalStatus = event.approvals?.regional?.status ?? "Pending";
                      return (
                        <TableRow key={event.code}>
                          <TableCell className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {event.code}
                          </TableCell>
                          <TableCell>
                            <Link href={`/events/${event.code}`} className="font-semibold hover:underline">
                              {event.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">{statusLabels[event.status]}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(event.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                regionalStatus === "Approved"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                                  : regionalStatus === "Rejected"
                                  ? "bg-rose-100 text-rose-900 border-rose-200"
                                  : regionalStatus === "Need Changes"
                                  ? "bg-amber-100 text-amber-900 border-amber-200"
                                  : "bg-secondary text-secondary-foreground border-secondary"
                              }
                            >
                              {regionalStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {formatCurrency(event.budget)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick action */}
        <Card>
          <CardHeader>
            <CardTitle>Pending approvals</CardTitle>
            <CardDescription>Events in {cityName} waiting for your sign-off.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/approvals">Go to approvals →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cityEvents_filtered(events: ReturnType<typeof useEventsData>["data"], cityCode: string) {
  if (!cityCode) return events;
  return events.filter((e) => e.code.startsWith(cityCode));
}
