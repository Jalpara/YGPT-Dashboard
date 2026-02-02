"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatCurrency,
  formatDate,
  statusLabels,
  statusStyles,
} from "@/lib/sample-data";
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
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const QUICK_STAT_DETAILS = {
  proposals: "Awaiting trustee review",
  quarter: "Across active cities",
  invoices: "Budget vs spent gap",
};

type AnalyticsTab = "volume" | "finance" | "status";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("volume");
  const { data: events, loading, error } = useEventsData();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const { quickStats, chartData } = useMemo(() => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);

    const proposalsCount = events.filter(
      (event) => event.status === "proposal"
    ).length;
    const quarterCount = events.filter((event) => {
      const date = new Date(event.date);
      return date >= quarterStart && date <= quarterEnd;
    }).length;
    const invoicesPending = events.filter(
      (event) => event.budgetRequired === "Yes" && event.spent < event.budget
    ).length;

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        label: date.toLocaleString("en-US", { month: "short" }),
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    });

    const volumeCreated = months.map((item) =>
      events.filter((event) => {
        const date = new Date(event.date);
        return date.getMonth() === item.month && date.getFullYear() === item.year;
      }).length
    );
    const volumeCompleted = months.map((item) =>
      events.filter((event) => {
        const date = new Date(event.date);
        return (
          event.status === "completed" &&
          date.getMonth() === item.month &&
          date.getFullYear() === item.year
        );
      }).length
    );

    const budgetTotals = months.map((item) =>
      events
        .filter((event) => {
          const date = new Date(event.date);
          return date.getMonth() === item.month && date.getFullYear() === item.year;
        })
        .reduce((sum, event) => sum + event.budget, 0)
    );

    const spentTotals = months.map((item) =>
      events
        .filter((event) => {
          const date = new Date(event.date);
          return date.getMonth() === item.month && date.getFullYear() === item.year;
        })
        .reduce((sum, event) => sum + event.spent, 0)
    );

    const statusCounts = {
      approved: events.filter((event) => event.status === "approved").length,
      inProgress: events.filter((event) => event.status === "in_progress").length,
      completed: events.filter((event) => event.status === "completed").length,
    };
    const statusTotal =
      statusCounts.approved + statusCounts.inProgress + statusCounts.completed || 1;

    return {
      quickStats: [
        {
          label: "Active proposals",
          value: proposalsCount.toString(),
          detail: QUICK_STAT_DETAILS.proposals,
        },
        {
          label: "Events this quarter",
          value: quarterCount.toString(),
          detail: QUICK_STAT_DETAILS.quarter,
        },
        {
          label: "Invoices pending",
          value: invoicesPending.toString(),
          detail: QUICK_STAT_DETAILS.invoices,
        },
      ],
      chartData: {
        volume: {
          title: "Event volume",
          subtitle: "Monthly events created vs completed",
          months: months.map((item) => item.label),
          created: volumeCreated,
          completed: volumeCompleted,
        },
        finance: {
          title: "Budget vs spent",
          subtitle: "Planned allocation compared to actual spend",
          months: months.map((item) => item.label),
          budget: budgetTotals.map((value) => Math.round(value / 1000)),
          spent: spentTotals.map((value) => Math.round(value / 1000)),
        },
        status: {
          title: "Status mix",
          subtitle: "Current pipeline distribution",
          values: [
            Math.round((statusCounts.approved / statusTotal) * 100),
            Math.round((statusCounts.inProgress / statusTotal) * 100),
            Math.round((statusCounts.completed / statusTotal) * 100),
          ],
          labels: ["Approved", "In progress", "Completed"],
        },
      },
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
              YGPT Dashboard
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Event operations at a glance.
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Invite user</Button>
            <Button>Sync from Apps Script</Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Operational insights</CardTitle>
                  <CardDescription>
                    Track event velocity, spending, and pipeline health across teams.
                  </CardDescription>
                </div>
                <Badge variant="secondary">Sep 2025 - Feb 2026</Badge>
              </div>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalyticsTab)}>
                <TabsList>
                  <TabsTrigger value="volume">Event volume</TabsTrigger>
                  <TabsTrigger value="finance">Budget vs spent</TabsTrigger>
                  <TabsTrigger value="status">Status mix</TabsTrigger>
                </TabsList>
                <TabsContent value="volume">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{chartData.volume.title}</p>
                      <p className="text-xs text-muted-foreground">{chartData.volume.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Created
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                        Completed
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 h-56">
                    {loading ? (
                      <Skeleton className="h-full w-full" />
                    ) : chartData.volume.created.every((value) => value === 0) &&
                      chartData.volume.completed.every((value) => value === 0) ? (
                      <div className="flex h-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        No volume data yet.
                      </div>
                    ) : (
                      <ChartContainer
                        config={{
                          created: { label: "Created", color: "hsl(var(--primary))" },
                          completed: { label: "Completed", color: "hsl(var(--muted-foreground))" },
                        }}
                      >
                        <BarChart
                          data={chartData.volume.months.map((month, index) => ({
                            month,
                            created: chartData.volume.created[index],
                            completed: chartData.volume.completed[index],
                          }))}
                          margin={{ left: 8, right: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                          <ChartTooltipContent />
                          <Bar dataKey="created" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={18} />
                          <Bar dataKey="completed" fill="hsl(var(--secondary-foreground))" radius={[6, 6, 0, 0]} barSize={18} />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="finance">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{chartData.finance.title}</p>
                      <p className="text-xs text-muted-foreground">{chartData.finance.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-secondary" />
                        Budget
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Spent
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 h-56">
                    {loading ? (
                      <Skeleton className="h-full w-full" />
                    ) : chartData.finance.budget.every((value) => value === 0) &&
                      chartData.finance.spent.every((value) => value === 0) ? (
                      <div className="flex h-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        No finance data yet.
                      </div>
                    ) : (
                      <ChartContainer
                        config={{
                          budget: { label: "Budget", color: "hsl(var(--secondary-foreground))" },
                          spent: { label: "Spent", color: "hsl(var(--primary))" },
                        }}
                      >
                        <LineChart
                          data={chartData.finance.months.map((month, index) => ({
                            month,
                            budget: chartData.finance.budget[index],
                            spent: chartData.finance.spent[index],
                          }))}
                          margin={{ left: 8, right: 8 }}
                        >
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
                </TabsContent>
                <TabsContent value="status">
                  <div className="grid gap-6 md:grid-cols-[0.6fr_0.4fr]">
                    <div className="flex items-center justify-center">
                      {loading ? (
                        <Skeleton className="h-48 w-48 rounded-full" />
                      ) : (
                        <ChartContainer
                          config={{
                            approved: { label: "Approved", color: "hsl(var(--primary))" },
                            inProgress: { label: "In progress", color: "hsl(var(--secondary-foreground))" },
                            completed: { label: "Completed", color: "hsl(var(--muted-foreground))" },
                          }}
                          className="h-56 w-full"
                        >
                          <PieChart>
                            <ChartTooltipContent />
                            <Pie
                              data={chartData.status.labels.map((label, index) => ({
                                name: label,
                                value: chartData.status.values[index],
                                color:
                                  index === 0
                                    ? "hsl(var(--primary))"
                                    : index === 1
                                    ? "hsl(var(--secondary-foreground))"
                                    : "hsl(var(--muted-foreground))",
                              }))}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={4}
                            >
                              {chartData.status.values.map((_, index) => (
                                <Cell
                                  key={chartData.status.labels[index]}
                                  fill={
                                    index === 0
                                      ? "hsl(var(--primary))"
                                      : index === 1
                                      ? "hsl(var(--secondary-foreground))"
                                      : "hsl(var(--muted-foreground))"
                                  }
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      )}
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-semibold">{chartData.status.title}</p>
                      <p className="text-xs text-muted-foreground">{chartData.status.subtitle}</p>
                      <div className="mt-4 space-y-3">
                        {loading
                          ? Array.from({ length: 3 }, (_, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-10" />
                              </div>
                            ))
                          : chartData.status.labels.map((label, index) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="text-sm">{label}</span>
                                <span className="text-sm font-semibold">
                                  {chartData.status.values[index]}%
                                </span>
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {loading
              ? [0, 1, 2].map((item) => (
                  <Card key={item}>
                    <CardContent className="space-y-3 pt-6">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))
              : quickStats.map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader className="pb-2">
                      <CardDescription className="uppercase tracking-[0.2em]">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {stat.detail}
                    </CardContent>
                  </Card>
                ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live events</CardTitle>
                <CardDescription>
                  Track proposals, approvals, and completions across cities.
                </CardDescription>
              </div>
              <Button asChild variant="link">
                <Link href="/events">View all events</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }, (_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 5 }, (_, cell) => (
                            <TableCell key={cell}>
                              <Skeleton className="h-3 w-20" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : events.map((event) => (
                        <TableRow key={event.code}>
                          <TableCell className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {event.code}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => setSelectedCode(event.code)}
                              className="text-left font-semibold hover:underline"
                            >
                              {event.title}
                            </button>
                            <p className="text-xs text-muted-foreground">
                              {event.city}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(event.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusStyles[event.status]}
                            >
                              {statusLabels[event.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {formatCurrency(event.budget)}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selected event</CardTitle>
                <CardDescription>Review details before approval.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                ) : selectedCode ? (
                  (() => {
                    const selected = events.find((event) => event.code === selectedCode);
                    if (!selected) return null;
                    return (
                      <div className="space-y-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {selected.code}
                        </p>
                        <p className="text-lg font-semibold">{selected.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {selected.city} • {formatDate(selected.date)} • Lead: {selected.lead}
                        </p>
                        <Card className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-[0.2em]">
                              Objective
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0 text-sm">
                            {selected.objective}
                          </CardContent>
                        </Card>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary">{selected.eventType}</Badge>
                          <Badge variant="secondary">{selected.proposalType}</Badge>
                          <Badge variant="secondary">
                            Budget {formatCurrency(selected.budgetTotal)}
                          </Badge>
                        </div>
                        <Button asChild variant="link" className="px-0">
                          <Link href={`/events/${selected.code}`}>
                            View full details →
                          </Link>
                        </Button>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select an event from the list to review details.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forms access</CardTitle>
                <CardDescription>Direct links to the live EPF and ECR forms.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild variant="outline" className="justify-between">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfnCUKzk4Fb5ubGzRB6ROaymRFhxlKqVgYnLTC45m4gKN-VvA/viewform"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Event Proposal Form (EPF)
                    <span>↗</span>
                  </a>
                </Button>
                <Button asChild variant="outline" className="justify-between">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLScE_gI2KKfxnx9Hi_gaVYpUvJS_68KNqys1-XngSP--ASeasg/viewform"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Event Completion Form (ECR)
                    <span>↗</span>
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick access</CardTitle>
                <CardDescription>
                  Jump straight to what trustees ask for most.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild variant="outline" className="justify-between">
                  <Link href="/invoices">Invoices and payments</Link>
                </Button>
                <Button asChild variant="outline" className="justify-between">
                  <Link href="/photos">Event photos</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync snapshot</CardTitle>
                <CardDescription>Last run: Feb 2, 2026 • 08:30 AM IST</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>EPF responses ingested</span>
                  <span className="font-semibold text-foreground">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ECR responses ingested</span>
                  <span className="font-semibold text-foreground">31</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Drive folders indexed</span>
                  <span className="font-semibold text-foreground">18</span>
                </div>
                <Button variant="secondary" className="w-full">
                  Configure Apps Script
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
