"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate, statusLabels, statusStyles } from "@/lib/sample-data";
import { useEventsData } from "@/lib/use-events";

const filters = ["All", "Proposal", "Approved", "In Progress", "Completed"];
const views = ["Table", "List", "Grid"] as const;
const modeFilters = ["All", "Online", "Offline"] as const;

type ViewMode = (typeof views)[number];
type EventItem = ReturnType<typeof useEventsData>["data"][number];

function EventCalendar({
  filteredEvents,
  monthCursor,
  setMonthCursor,
  searchTerm,
  setSearchTerm,
  modeFilter,
  setModeFilter,
  loading,
}: {
  filteredEvents: EventItem[];
  monthCursor: Date;
  setMonthCursor: (value: Date) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  modeFilter: (typeof modeFilters)[number];
  setModeFilter: (value: (typeof modeFilters)[number]) => void;
  loading: boolean;
}) {
  const monthLabel = monthCursor.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const monthStart = new Date(
    monthCursor.getFullYear(),
    monthCursor.getMonth(),
    1
  );
  const daysInMonth = new Date(
    monthCursor.getFullYear(),
    monthCursor.getMonth() + 1,
    0
  ).getDate();
  const startDayIndex = monthStart.getDay();
  const leadingEmpty = Array.from({ length: startDayIndex }, (_, idx) => ({
    day: idx + 1,
    isMuted: true,
    date: null as Date | null,
  }));
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      index + 1
    );
    return {
      day: index + 1,
      isMuted: false,
      date,
    };
  });
  const calendarDays = [...leadingEmpty, ...days];
  const eventsByDay = filteredEvents.reduce<Record<string, EventItem[]>>(
    (acc, event) => {
      const date = new Date(event.date);
      if (
        date.getMonth() === monthCursor.getMonth() &&
        date.getFullYear() === monthCursor.getFullYear()
      ) {
        const key = date.getDate().toString();
        acc[key] = acc[key] ? [...acc[key], event] : [event];
      }
      return acc;
    },
    {}
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)] shadow-[var(--shadow-soft)]">
          <span className="text-lg">🔍</span>
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-2 py-2 shadow-[var(--shadow-soft)]">
            {modeFilters.map((mode) => (
              <button
                key={mode}
                onClick={() => setModeFilter(mode)}
                className={`rounded-[var(--radius-pill)] px-4 py-1.5 ${
                  modeFilter === mode
                    ? "bg-brand-orange text-white"
                    : "text-[var(--muted)]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-4 py-2 text-[var(--muted)] shadow-[var(--shadow-soft)]">
            Upcoming First
          </button>
          <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-2 py-2 shadow-[var(--shadow-soft)]">
            <button className="rounded-[var(--radius-pill)] bg-brand-orange px-3 py-2 text-white">
              📅
            </button>
            <button className="rounded-[var(--radius-pill)] px-3 py-2 text-[var(--muted)]">
              ▦
            </button>
            <button className="rounded-[var(--radius-pill)] px-3 py-2 text-[var(--muted)]">
              ≡
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-brand-dark">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-2 text-lg text-[var(--muted)]">
          <button
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1 shadow-[var(--shadow-soft)]"
            onClick={() =>
              setMonthCursor(
                new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)
              )
            }
          >
            ←
          </button>
          <button
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1 shadow-[var(--shadow-soft)]"
            onClick={() =>
              setMonthCursor(
                new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
              )
            }
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <div key={label} className="border border-[var(--border)] px-4 py-3">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-b border-[var(--border)]">
        {calendarDays.map((item, index) => {
          const matches = item.isMuted
            ? []
            : eventsByDay[item.day.toString()] ?? [];
          return (
            <div
              key={`${item.day}-${index}`}
              className="min-h-[120px] border-t border-r border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              <div
                className={`text-xs font-semibold ${
                  item.isMuted ? "text-[var(--muted)]/50" : "text-brand-orange"
                }`}
              >
                {item.day}
              </div>
              <div className="mt-2 space-y-2">
                {loading
                  ? Array.from({ length: 2 }, (_, idx) => (
                      <div
                        key={idx}
                        className="h-5 w-full rounded-full bg-black/10"
                      />
                    ))
                  : matches.map((evt, idx) => (
                      <div
                        key={`${evt.code}-${idx}`}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          evt.status === "completed"
                            ? "bg-brand-green/15 text-brand-green"
                            : evt.status === "in_progress"
                            ? "bg-brand-teal/15 text-brand-teal"
                            : evt.status === "approved"
                            ? "bg-brand-purple/15 text-brand-purple"
                            : "bg-brand-orange/15 text-brand-orange"
                        }`}
                      >
                        {evt.title}
                      </div>
                    ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { data: events, loading, error } = useEventsData();
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("Table");
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<(typeof modeFilters)[number]>(
    "All"
  );
  const [monthCursor, setMonthCursor] = useState(() => new Date(2026, 1, 1));

  const filteredEvents = useMemo(() => {
    const statusTarget = activeFilter.toLowerCase().replace(" ", "_");
    return events.filter((event) => {
      const matchesStatus =
        activeFilter === "All" ? true : event.status === statusTarget;
      const matchesMode =
        modeFilter === "All"
          ? true
          : event.mode === modeFilter.toLowerCase();
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = query
        ? `${event.code} ${event.title} ${event.city} ${event.lead}`
            .toLowerCase()
            .includes(query)
        : true;
      return matchesStatus && matchesMode && matchesSearch;
    });
  }, [activeFilter, modeFilter, searchTerm, events]);

  return (
    <div className="px-6 py-8 md:px-8 md:py-10 page-animate">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {error ? (
          <div className="rounded-[var(--radius-card)] border border-brand-orange/30 bg-brand-orange/10 px-6 py-4 text-sm text-brand-dark shadow-[var(--shadow-soft)]">
            {error}
          </div>
        ) : null}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] font-lemon">
              Events
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Event tracker</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Review every event proposal and completion cycle by code.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold"
          >
            Back to dashboard
          </Link>
        </header>

        <EventCalendar
          filteredEvents={filteredEvents}
          monthCursor={monthCursor}
          setMonthCursor={setMonthCursor}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          loading={loading}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-[var(--radius-pill)] border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] shadow-[var(--shadow-soft)] ${
                  activeFilter === filter
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/80 p-1 text-xs font-semibold uppercase tracking-[0.2em]">
            {views.map((view) => (
              <button
                key={view}
                onClick={() => setViewMode(view)}
                className={`rounded-[var(--radius-pill)] px-4 py-2 ${
                  viewMode === view
                    ? "bg-brand-purple text-white shadow-[var(--shadow-soft)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "Table" ? (
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 shadow-[var(--shadow-soft)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--card)] text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Lead</th>
                  <th className="px-6 py-4 text-right">Budget</th>
                  <th className="px-6 py-4 text-right">Spent</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }, (_, index) => (
                      <tr
                        key={index}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="px-6 py-4">
                          <div className="h-3 w-16 rounded-full bg-black/10" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-32 rounded-full bg-black/10" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-20 rounded-full bg-black/10" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-20 rounded-full bg-black/10" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-20 rounded-full bg-black/10" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="ml-auto h-3 w-16 rounded-full bg-black/10" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="ml-auto h-3 w-16 rounded-full bg-black/10" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-16 rounded-full bg-black/10" />
                        </td>
                      </tr>
                    ))
                  : filteredEvents.map((event) => (
                      <tr
                        key={event.code}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[var(--muted)] font-lemon">
                          {event.code}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/events/${event.code}`}
                            className="font-semibold text-[var(--foreground)]"
                          >
                            {event.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4">{event.city}</td>
                        <td className="px-6 py-4">{formatDate(event.date)}</td>
                        <td className="px-6 py-4">{event.lead}</td>
                        <td className="px-6 py-4 text-right">
                          {formatCurrency(event.budget)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatCurrency(event.spent)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold ${
                              statusStyles[event.status]
                            }`}
                          >
                            {statusLabels[event.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {viewMode === "List" ? (
          <div className="grid gap-4">
            {loading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]"
                  >
                    <div className="h-3 w-20 rounded-full bg-black/10" />
                    <div className="mt-4 h-6 w-40 rounded-full bg-black/10" />
                    <div className="mt-3 h-3 w-32 rounded-full bg-black/10" />
                  </div>
                ))
              : filteredEvents.map((event) => (
                  <div
                    key={event.code}
                    className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                          {event.code}
                        </p>
                        <Link
                          href={`/events/${event.code}`}
                          className="mt-2 block text-2xl font-semibold"
                        >
                          {event.title}
                        </Link>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {event.city} • {formatDate(event.date)} • Lead:{" "}
                          {event.lead}
                        </p>
                      </div>
                      <div className="space-y-3 text-right">
                        <span
                          className={`inline-flex items-center rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold ${
                            statusStyles[event.status]
                          }`}
                        >
                          {statusLabels[event.status]}
                        </span>
                        <p className="text-sm text-[var(--muted)]">
                          {formatCurrency(event.spent)} of{" "}
                          {formatCurrency(event.budget)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {event.invoices} invoices • {event.photos} photos
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        ) : null}

        {viewMode === "Grid" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]"
                  >
                    <div className="h-3 w-20 rounded-full bg-black/10" />
                    <div className="mt-4 h-6 w-40 rounded-full bg-black/10" />
                    <div className="mt-3 h-3 w-32 rounded-full bg-black/10" />
                  </div>
                ))
              : filteredEvents.map((event) => (
                  <div
                    key={event.code}
                    className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                      {event.code}
                    </p>
                    <Link
                      href={`/events/${event.code}`}
                      className="mt-2 block text-2xl font-semibold"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {event.city} • {formatDate(event.date)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold ${
                          statusStyles[event.status]
                        }`}
                      >
                        {statusLabels[event.status]}
                      </span>
                      <p className="text-sm text-[var(--muted)]">
                        {formatCurrency(event.spent)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                      <span className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1">
                        Lead: {event.lead}
                      </span>
                      <span className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1">
                        {event.invoices} invoices
                      </span>
                      <span className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1">
                        {event.photos} photos
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
