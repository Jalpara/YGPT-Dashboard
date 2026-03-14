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
  Bar,
  LineChart,
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

type AnalyticsTab = "volume" | "finance" | "status";

export function HeadDashboard() {
  const { data: events, loading, error } = useEventsData();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("volume");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const { quickStats, chartData, pendingHeadApprovals } = useMemo(() => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);

    const proposalsCount = events.filter((e) => e.status === "proposal").length;
    const quarterCount = events.filter((e) => {
      const d = new Date(e.date);
      return d >= quarterStart && d <= quarterEnd;
    }).length;
    const pendingHead = events.filter(
      (e) => (e.approvals?.head?.status ?? "Pending") === "Pending"
    ).length;

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        label: d.toLocaleString("en-US", { month: "short" }),
        month: d.getMonth(),
        year: d.getFullYear(),
      };
    });

    const volumeCreated = months.map(
      (m) => events.filter((e) => { const d = new Date(e.date); return d.getMonth() === m.month && d.getFullYear() === m.year; }).length
    );
    const volumeCompleted = months.map(
      (m) => events.filter((e) => { const d = new Date(e.date); return e.status === "completed" && d.getMonth() === m.month && d.getFullYear() === m.year; }).length
    );
    const budgetTotals = months.map(
      (m) => events.filter((e) => { const d = new Date(e.date); return d.getMonth() === m.month && d.getFullYear() === m.year; }).reduce((s, e) => s + e.budget, 0)
    );
    const spentTotals = months.map(
      (m) => events.filter((e) => { const d = new Date(e.date); return d.getMonth() === m.month && d.getFullYear() === m.year; }).reduce((s, e) => s + e.spent, 0)
    );

    const approved = events.filter((e) => e.status === "approved").length;
    const inProgress = events.filter((e) => e.status === "in_progress").length;
    const completed = events.filter((e) => e.status === "completed").length;
    const total = approved + inProgress + completed || 1;

    const pendingHeadApprovals = events.filter(
      (e) => (e.approvals?.head?.status ?? "Pending") === "Pending"
    );

    return {
      quickStats: [
        { label: "Active proposals", value: proposalsCount.toString(), detail: "Org-wide, awaiting review" },
        { label: "Events this quarter", value: quarterCount.toString(), detail: "Across all cities" },
        { label: "Pending head approval", value: pendingHead.toString(), detail: "Your sign-off needed" },
      ],
      chartData: {
        volume: {
          months: months.map((m) => m.label),
          created: volumeCreated,
          completed: volumeCompleted,
        },
        finance: {
          months: months.map((m) => m.label),
          budget: budgetTotals.map((v) => Math.round(v / 1000)),
          spent: spentTotals.map((v) => Math.round(v / 1000)),
        },
        status: {
          values: [
            Math.round((approved / total) * 100),
            Math.round((inProgress / total) * 100),
            Math.round((completed / total) * 100),
          ],
          labels: ["Approved", "In progress", "Completed"],
        },
      },
      pendingHeadApprovals,
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
              YGPT Head
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Event operations at a glance.
            </h1>
          </div>
        </header>

        {/* Stats + Charts */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Operational insights</CardTitle>
                  <CardDescription>Track event velocity, spending, and pipeline health across all teams.</CardDescription>
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnalyticsTab)}>
                <TabsList>
                  <TabsTrigger value="volume">Event volume</TabsTrigger>
                  <TabsTrigger value="finance">Budget vs spent</TabsTrigger>
                  <TabsTrigger value="status">Status mix</TabsTrigger>
                </TabsList>
                <TabsContent value="volume">
                  <div className="mt-4 h-56">
                    {loading ? <Skeleton className="h-full w-full" /> : (
                      <ChartContainer config={{ created: { label: "Created", color: "hsl(var(--primary))" }, completed: { label: "Completed", color: "hsl(var(--muted-foreground))" } }}>
                        <BarChart data={chartData.volume.months.map((month, i) => ({ month, created: chartData.volume.created[i], completed: chartData.volume.completed[i] }))} margin={{ left: 8, right: 8 }}>
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
                  <div className="mt-4 h-56">
                    {loading ? <Skeleton className="h-full w-full" /> : (
                      <ChartContainer config={{ budget: { label: "Budget", color: "hsl(var(--secondary-foreground))" }, spent: { label: "Spent", color: "hsl(var(--primary))" } }}>
                        <LineChart data={chartData.finance.months.map((month, i) => ({ month, budget: chartData.finance.budget[i], spent: chartData.finance.spent[i] }))} margin={{ left: 8, right: 8 }}>
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
                      {loading ? <Skeleton className="h-48 w-48 rounded-full" /> : (
                        <ChartContainer config={{ approved: { label: "Approved", color: "hsl(var(--primary))" }, inProgress: { label: "In progress", color: "hsl(var(--secondary-foreground))" }, completed: { label: "Completed", color: "hsl(var(--muted-foreground))" } }} className="h-56 w-full">
                          <PieChart>
                            <ChartTooltipContent />
                            <Pie data={chartData.status.labels.map((label, i) => ({ name: label, value: chartData.status.values[i] }))} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                              {chartData.status.values.map((_, i) => (
                                <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : i === 1 ? "hsl(var(--secondary-foreground))" : "hsl(var(--muted-foreground))"} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      )}
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-semibold">Status mix</p>
                      <p className="text-xs text-muted-foreground">Current pipeline distribution</p>
                      <div className="mt-4 space-y-3">
                        {loading
                          ? Array.from({ length: 3 }, (_, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-10" />
                              </div>
                            ))
                          : chartData.status.labels.map((label, i) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="text-sm">{label}</span>
                                <span className="text-sm font-semibold">{chartData.status.values[i]}%</span>
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
              ? [0, 1, 2].map((i) => (
                  <Card key={i}><CardContent className="space-y-3 pt-6"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-32" /></CardContent></Card>
                ))
              : quickStats.map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader className="pb-2">
                      <CardDescription className="uppercase tracking-[0.2em]">{stat.label}</CardDescription>
                      <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-muted-foreground">{stat.detail}</CardContent>
                  </Card>
                ))}
          </div>
        </section>

        {/* Live events + selected event */}
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live events</CardTitle>
                <CardDescription>Track proposals, approvals, and completions across all cities.</CardDescription>
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }, (_, i) => (
                        <TableRow key={i}>{Array.from({ length: 5 }, (_, c) => (<TableCell key={c}><Skeleton className="h-3 w-20" /></TableCell>))}</TableRow>
                      ))
                    : events.map((event) => (
                        <TableRow key={event.code}>
                          <TableCell className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{event.code}</TableCell>
                          <TableCell>
                            <button onClick={() => setSelectedCode(event.code)} className="text-left font-semibold hover:underline">{event.title}</button>
                            <p className="text-xs text-muted-foreground">{event.city}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(event.date)}</TableCell>
                          <TableCell><Badge variant="outline" className={statusStyles[event.status]}>{statusLabels[event.status]}</Badge></TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(event.budget)}</TableCell>
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
                  <div className="space-y-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-6 w-40" /><Skeleton className="h-3 w-28" /></div>
                ) : selectedCode ? (() => {
                  const selected = events.find((e) => e.code === selectedCode);
                  if (!selected) return null;
                  return (
                    <div className="space-y-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{selected.code}</p>
                      <p className="text-lg font-semibold">{selected.title}</p>
                      <p className="text-sm text-muted-foreground">{selected.city} • {formatDate(selected.date)} • Lead: {selected.lead}</p>
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-2"><CardDescription className="uppercase tracking-[0.2em]">Objective</CardDescription></CardHeader>
                        <CardContent className="pt-0 text-sm">{selected.objective}</CardContent>
                      </Card>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">{selected.eventType}</Badge>
                        <Badge variant="secondary">Budget {formatCurrency(selected.budgetTotal)}</Badge>
                      </div>
                      <Button asChild variant="link" className="px-0">
                        <Link href={`/events/${selected.code}`}>View full details →</Link>
                      </Button>
                    </div>
                  );
                })() : (
                  <p className="text-sm text-muted-foreground">Select an event from the list to review details.</p>
                )}
              </CardContent>
            </Card>

            {/* Pending approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending head approvals</CardTitle>
                <CardDescription>
                  {loading ? "..." : `${pendingHeadApprovals.length} event${pendingHeadApprovals.length !== 1 ? "s" : ""} awaiting your sign-off.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
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
