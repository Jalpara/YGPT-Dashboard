"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate, statusLabels, statusStyles } from "@/lib/sample-data";
import { useEventsData } from "@/lib/use-events";

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
          created: volumeCreated.map((value) => Math.max(1, value)),
          completed: volumeCompleted.map((value) => Math.max(0, value)),
        },
        finance: {
          title: "Budget vs spent",
          subtitle: "Planned allocation compared to actual spend",
          months: months.map((item) => item.label),
          budget: budgetTotals.map((value) => Math.max(0, Math.round(value / 1000))),
          spent: spentTotals.map((value) => Math.max(0, Math.round(value / 1000))),
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
          colors: ["bg-brand-green", "bg-brand-teal", "bg-brand-purple"],
        },
      },
    };
  }, [events]);
  return (
    <div className="relative overflow-hidden px-6 py-8 md:px-8 md:py-10 page-animate">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-8 h-40 w-40 rounded-full bg-brand-orange opacity-15 blur-[90px]" />
        <div className="absolute right-10 top-24 h-40 w-40 rounded-full bg-brand-yellow opacity-12 blur-[110px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 pb-16">
        {error ? (
          <div className="rounded-[var(--radius-card)] border border-brand-orange/30 bg-brand-orange/10 px-6 py-4 text-sm text-brand-dark shadow-[var(--shadow-soft)]">
            {error}
          </div>
        ) : null}
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted)] font-lemon">
              YGPT Dashboard
            </p>
            <h1 className="text-4xl font-semibold text-[var(--foreground)] md:text-5xl">
              Event operations at a glance.
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--card)] px-5 py-2 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-soft)]">
              Invite user
            </button>
            <button className="rounded-[var(--radius-pill)] bg-brand-orange px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)]">
              Sync from Apps Script
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                  Analytics
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                  Operational insights
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Track event velocity, spending, and pipeline health across
                  teams.
                </p>
              </div>
              <div className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Sep 2025 - Feb 2026
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/90 p-1 text-xs font-semibold uppercase tracking-[0.2em]">
              {[
                { id: "volume" as const, label: "Event volume" },
                { id: "finance" as const, label: "Budget vs spent" },
                { id: "status" as const, label: "Status mix" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-[var(--radius-pill)] px-4 py-2 transition ${
                    activeTab === tab.id
                      ? "bg-brand-orange text-white shadow-[var(--shadow-soft)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "volume" ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {chartData.volume.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {chartData.volume.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-orange" />
                      Created
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-purple" />
                      Completed
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-6 items-end gap-4">
                  {loading
                    ? Array.from({ length: 6 }, (_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-end gap-2">
                            <div className="h-20 w-3 rounded-[var(--radius-pill)] bg-black/10" />
                            <div className="h-14 w-3 rounded-[var(--radius-pill)] bg-black/5" />
                          </div>
                          <div className="h-3 w-8 rounded-full bg-black/10" />
                        </div>
                      ))
                    : chartData.volume.months.map((month, index) => (
                        <div key={month} className="space-y-2">
                          <div className="flex items-end gap-2">
                            <div
                              className="w-3 rounded-[var(--radius-pill)] bg-brand-orange"
                              style={{
                                height: `${chartData.volume.created[index] * 3}px`,
                              }}
                            />
                            <div
                              className="w-3 rounded-[var(--radius-pill)] bg-brand-purple"
                              style={{
                                height: `${chartData.volume.completed[index] * 3}px`,
                              }}
                            />
                          </div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                            {month}
                          </p>
                        </div>
                      ))}
                </div>
              </div>
            ) : null}

            {activeTab === "finance" ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {chartData.finance.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {chartData.finance.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-teal" />
                      Budget
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-green" />
                      Spent
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-6 items-end gap-4">
                  {loading
                    ? Array.from({ length: 6 }, (_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-end gap-2">
                            <div className="h-20 w-3 rounded-[var(--radius-pill)] bg-black/10" />
                            <div className="h-14 w-3 rounded-[var(--radius-pill)] bg-black/5" />
                          </div>
                          <div className="h-3 w-8 rounded-full bg-black/10" />
                        </div>
                      ))
                    : chartData.finance.months.map((month, index) => (
                        <div key={month} className="space-y-2">
                          <div className="flex items-end gap-2">
                            <div
                              className="w-3 rounded-[var(--radius-pill)] bg-brand-teal"
                              style={{
                                height: `${chartData.finance.budget[index] / 3}px`,
                              }}
                            />
                            <div
                              className="w-3 rounded-[var(--radius-pill)] bg-brand-green"
                              style={{
                                height: `${chartData.finance.spent[index] / 3}px`,
                              }}
                            />
                          </div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                            {month}
                          </p>
                        </div>
                      ))}
                </div>
              </div>
            ) : null}

            {activeTab === "status" ? (
              <div className="mt-6 grid gap-6 md:grid-cols-[0.6fr_0.4fr]">
                <div className="flex items-center justify-center">
                  {loading ? (
                    <div className="h-48 w-48 rounded-full bg-black/10" />
                  ) : (
                    <div
                      className="h-48 w-48 rounded-full"
                      style={{
                        background:
                          "conic-gradient(#00A651 0% 44%, #4EB8B9 44% 66%, #936FB1 66% 100%)",
                      }}
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {chartData.status.title}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {chartData.status.subtitle}
                  </p>
                  <div className="mt-4 space-y-3">
                    {loading
                      ? Array.from({ length: 3 }, (_, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="h-3 w-3 rounded-full bg-black/10" />
                              <span className="h-3 w-24 rounded-full bg-black/10" />
                            </div>
                            <span className="h-3 w-10 rounded-full bg-black/10" />
                          </div>
                        ))
                      : chartData.status.labels.map((label, index) => (
                          <div
                            key={label}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`h-3 w-3 rounded-full ${chartData.status.colors[index]}`}
                              />
                              <span className="text-sm text-[var(--foreground)]">
                                {label}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-[var(--foreground)]">
                              {chartData.status.values[index]}%
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="grid gap-4">
            {loading
              ? [0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div className="h-3 w-24 rounded-full bg-black/10" />
                    <div className="mt-4 h-8 w-20 rounded-full bg-black/10" />
                    <div className="mt-3 h-3 w-32 rounded-full bg-black/10" />
                  </div>
                ))
              : quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {stat.detail}
                    </p>
                  </div>
                ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Live events</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Track proposals, approvals, and completions across cities.
                </p>
              </div>
              <Link
                href="/events"
                className="text-sm font-semibold text-brand-orange"
              >
                View all events
              </Link>
            </div>
            <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--card)] text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }, (_, index) => (
                        <tr key={index} className="border-t border-[var(--border)]">
                          {Array.from({ length: 5 }, (_, cell) => (
                            <td key={cell} className="px-4 py-3">
                              <div className="h-3 w-20 rounded-full bg-black/10" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : events.map((event) => (
                        <tr
                          key={event.code}
                          className={`border-t border-[var(--border)] ${
                            selectedCode === event.code
                              ? "bg-brand-orange/5"
                              : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)] font-lemon">
                            {event.code}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedCode(event.code)}
                              className="text-left font-semibold text-[var(--foreground)] hover:text-brand-orange"
                            >
                              {event.title}
                            </button>
                            <p className="text-xs text-[var(--muted)]">
                              {event.city}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--muted)]">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold ${
                                statusStyles[event.status]
                              }`}
                            >
                              {statusLabels[event.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-[var(--muted)]">
                            {formatCurrency(event.budget)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">Selected event</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Review details before approval.
              </p>
              {loading ? (
                <div className="mt-4 space-y-3">
                  <div className="h-3 w-32 rounded-full bg-black/10" />
                  <div className="h-6 w-40 rounded-full bg-black/10" />
                  <div className="h-3 w-28 rounded-full bg-black/10" />
                </div>
              ) : selectedCode ? (
                (() => {
                  const selected = events.find((event) => event.code === selectedCode);
                  if (!selected) return null;
                  return (
                    <div className="mt-4 space-y-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                        {selected.code}
                      </p>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {selected.title}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {selected.city} • {formatDate(selected.date)} • Lead: {selected.lead}
                      </p>
                      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                          Objective
                        </p>
                        <p className="mt-2 text-sm text-[var(--foreground)]">
                          {selected.objective}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1">
                          {selected.eventType}
                        </span>
                        <span className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1">
                          {selected.proposalType}
                        </span>
                        <span className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1">
                          Budget {formatCurrency(selected.budgetTotal)}
                        </span>
                      </div>
                      <Link
                        href={`/events/${selected.code}`}
                        className="text-sm font-semibold text-brand-orange"
                      >
                        View full details →
                      </Link>
                    </div>
                  );
                })()
              ) : (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  Select an event from the list to review details.
                </p>
              )}
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">Forms access</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Direct links to the live EPF and ECR forms.
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfnCUKzk4Fb5ubGzRB6ROaymRFhxlKqVgYnLTC45m4gKN-VvA/viewform"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3"
                >
                  Event Proposal Form (EPF)
                  <span className="text-brand-orange">↗</span>
                </a>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScE_gI2KKfxnx9Hi_gaVYpUvJS_68KNqys1-XngSP--ASeasg/viewform"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3"
                >
                  Event Completion Form (ECR)
                  <span className="text-brand-yellow">↗</span>
                </a>
              </div>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">Quick access</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Jump straight to what trustees ask for most.
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <Link
                  href="/invoices"
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3"
                >
                  Invoices and payments
                  <span className="text-brand-green">→</span>
                </Link>
                <Link
                  href="/photos"
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3"
                >
                  Event photos
                  <span className="text-brand-yellow">→</span>
                </Link>
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">Sync snapshot</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Last run: Feb 2, 2026 • 08:30 AM IST
              </p>
              <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between">
                  <span>EPF responses ingested</span>
                  <span className="font-semibold text-[var(--foreground)]">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ECR responses ingested</span>
                  <span className="font-semibold text-[var(--foreground)]">31</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Drive folders indexed</span>
                  <span className="font-semibold text-[var(--foreground)]">18</span>
                </div>
              </div>
              <button className="mt-5 w-full rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                Configure Apps Script
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
