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
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Select
            value={modeFilter}
            onValueChange={(value) =>
              setModeFilter(value as (typeof modeFilters)[number])
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              {modeFilters.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">Upcoming First</Button>
        </div>
        <div className="flex items-center justify-between">
          <CardTitle>{monthLabel}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setMonthCursor(
                  new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)
                )
              }
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setMonthCursor(
                  new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
                )
              }
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-7 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <div key={label} className="border-b px-3 py-2">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-b">
          {calendarDays.map((item, index) => {
            const matches = item.isMuted
              ? []
              : eventsByDay[item.day.toString()] ?? [];
            return (
              <div
                key={`${item.day}-${index}`}
                className="min-h-[110px] border-t border-r bg-background px-3 py-2 text-sm"
              >
                <div
                  className={`text-xs font-semibold ${
                    item.isMuted ? "text-muted-foreground/50" : "text-primary"
                  }`}
                >
                  {item.day}
                </div>
                <div className="mt-2 space-y-2">
                  {loading
                    ? Array.from({ length: 2 }, (_, idx) => (
                        <Skeleton key={idx} className="h-5 w-full" />
                      ))
                    : matches.map((evt, idx) => (
                        <Badge
                          key={`${evt.code}-${idx}`}
                          variant="secondary"
                          className="w-full justify-start"
                        >
                          {evt.title}
                        </Badge>
                      ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventsPage() {
  const { data: allEvents, loading, error } = useEventsData();
  const { user } = useAuth();

  // Regional Heads only see events from their assigned city
  const events = useMemo(() => {
    if (user?.role === "regional" && user.city) {
      return allEvents.filter((e) => e.code.startsWith(user.city!));
    }
    return allEvents;
  }, [allEvents, user]);

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
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {error ? (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="py-4 text-sm">{error}</CardContent>
          </Card>
        ) : null}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Events
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              Event tracker
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Review every event proposal and completion cycle by code.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to dashboard</Link>
          </Button>
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
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={activeFilter === filter ? "default" : "outline"}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList>
              {views.map((view) => (
                <TabsTrigger key={view} value={view}>
                  {view}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={viewMode}>
          <TabsContent value="Table">
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading
                      ? Array.from({ length: 4 }, (_, index) => (
                          <TableRow key={index}>
                            {Array.from({ length: 8 }, (_, cell) => (
                              <TableCell key={cell}>
                                <Skeleton className="h-3 w-20" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : filteredEvents.map((event) => (
                          <TableRow key={event.code}>
                            <TableCell className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {event.code}
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/events/${event.code}`}
                                className="font-semibold hover:underline"
                              >
                                {event.title}
                              </Link>
                            </TableCell>
                            <TableCell>{event.city}</TableCell>
                            <TableCell>{formatDate(event.date)}</TableCell>
                            <TableCell>{event.lead}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(event.budget)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(event.spent)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={statusStyles[event.status]}
                              >
                                {statusLabels[event.status]}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="List">
            <div className="grid gap-4">
              {loading
                ? Array.from({ length: 3 }, (_, index) => (
                    <Card key={index}>
                      <CardContent className="space-y-3 pt-6">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))
                : filteredEvents.map((event) => (
                    <Card key={event.code}>
                      <CardHeader>
                        <CardDescription className="uppercase tracking-[0.2em]">
                          {event.code}
                        </CardDescription>
                        <CardTitle>
                          <Link href={`/events/${event.code}`}>{event.title}</Link>
                        </CardTitle>
                        <CardDescription>
                          {event.city} • {formatDate(event.date)} • Lead: {event.lead}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center justify-between gap-3">
                        <Badge
                          variant="outline"
                          className={statusStyles[event.status]}
                        >
                          {statusLabels[event.status]}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(event.spent)} of {formatCurrency(event.budget)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.invoices} invoices • {event.photos} photos
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </TabsContent>
          <TabsContent value="Grid">
            <div className="grid gap-4 md:grid-cols-2">
              {loading
                ? Array.from({ length: 4 }, (_, index) => (
                    <Card key={index}>
                      <CardContent className="space-y-3 pt-6">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))
                : filteredEvents.map((event) => (
                    <Card key={event.code}>
                      <CardHeader>
                        <CardDescription className="uppercase tracking-[0.2em]">
                          {event.code}
                        </CardDescription>
                        <CardTitle>
                          <Link href={`/events/${event.code}`}>{event.title}</Link>
                        </CardTitle>
                        <CardDescription>
                          {event.city} • {formatDate(event.date)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge
                            variant="outline"
                            className={statusStyles[event.status]}
                          >
                            {statusLabels[event.status]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(event.spent)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">Lead: {event.lead}</Badge>
                          <Badge variant="secondary">
                            {event.invoices} invoices
                          </Badge>
                          <Badge variant="secondary">{event.photos} photos</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
