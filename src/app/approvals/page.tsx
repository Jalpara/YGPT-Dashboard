"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useEventsData } from "@/lib/use-events";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/sample-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/firebase";

const stages = [
  { key: "regional", label: "Regional Head" },
  { key: "head", label: "YGPT Head" },
  { key: "accounts", label: "Accounts Team" },
] as const;

const actions = ["Pending", "Approved", "Rejected", "Need Changes"] as const;
const statusFilters = ["All", ...actions] as const;

type StageKey = (typeof stages)[number]["key"];
type ActionStatus = (typeof actions)[number];
type StatusFilter = (typeof statusFilters)[number];

const statusClasses: Record<ActionStatus, string> = {
  Pending: "bg-secondary text-secondary-foreground border-secondary",
  Approved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Rejected: "bg-rose-100 text-rose-900 border-rose-200",
  "Need Changes": "bg-amber-100 text-amber-900 border-amber-200",
};

export default function ApprovalsPage() {
  const { data: events, loading, error, refresh } = useEventsData();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEventCode, setActiveEventCode] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<StageKey>("regional");
  const [modalDraft, setModalDraft] = useState({
    status: "Pending" as ActionStatus,
    by: "",
    notes: "",
  });

  // The stage this user is allowed to edit
  const myStage = user?.role as StageKey | undefined;

  const updateApproval = async (
    eventCode: string,
    stage: StageKey,
    status: ActionStatus,
    by: string,
    notes: string
  ) => {
    setSaving(true);
    setActionError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ eventCode, stage, status, by, notes }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || payload?.detail || "Approval failed.");
      }
      await refresh();
      setModalOpen(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Approval update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  const overallStatus = (event: (typeof events)[number]) => {
    const approvals = event.approvals;
    if (approvals?.overall) return approvals.overall;
    const statuses = [
      approvals?.regional?.status ?? "Pending",
      approvals?.head?.status ?? "Pending",
      approvals?.accounts?.status ?? "Pending",
    ];
    if (statuses.includes("Rejected")) return "Rejected";
    if (statuses.includes("Need Changes")) return "Need Changes";
    if (statuses.every((s) => s === "Approved")) return "Approved";
    return "Pending";
  };

  const filteredEvents = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return events.filter((event) => {
      const overall = overallStatus(event);
      if (statusFilter !== "All" && overall !== statusFilter) return false;
      if (!normalized) return true;
      return (
        event.code.toLowerCase().includes(normalized) ||
        event.title.toLowerCase().includes(normalized) ||
        event.city.toLowerCase().includes(normalized)
      );
    });
  }, [events, searchTerm, statusFilter]);

  const openModal = (eventCode: string, stage: StageKey) => {
    const event = events.find((item) => item.code === eventCode);
    const info = event?.approvals?.[stage];
    setActiveEventCode(eventCode);
    setActiveStage(stage);
    setModalDraft({
      status: (info?.status ?? "Pending") as ActionStatus,
      by: info?.by ?? user?.name ?? "",
      notes: info?.notes ?? "",
    });
    setModalOpen(true);
  };

  const myStageLabel = stages.find((s) => s.key === myStage)?.label ?? "";

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {error || actionError ? (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="py-4 text-sm">
              {actionError ?? error}
            </CardContent>
          </Card>
        ) : null}

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Approvals
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              Approval workflow
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Regional → YGPT Head → Accounts Team.
              {myStageLabel ? (
                <span className="ml-2 font-medium text-foreground">
                  You are acting as: {myStageLabel}
                </span>
              ) : null}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              You can only update approvals for your assigned role ({myStageLabel}).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Search events
              </label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by event code, title, or city"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Overall status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Overall status" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Overall</TableHead>
                  {stages.map((stage) => (
                    <TableHead key={stage.key}>{stage.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 6 }, (_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-3 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                        {stages.map((stage) => (
                          <TableCell key={stage.key}>
                            <Skeleton className="h-10 w-36" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : filteredEvents.map((event) => {
                      const overall = overallStatus(event) as ActionStatus;
                      return (
                        <TableRow key={event.code}>
                          <TableCell>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {event.code}
                            </p>
                            <Link
                              href={`/events/${event.code}`}
                              className="mt-1 block font-semibold hover:underline"
                            >
                              {event.title}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {event.city} • {formatDate(event.date)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusClasses[overall]}>
                              {overall}
                            </Badge>
                          </TableCell>
                          {stages.map((stage) => {
                            const info = event.approvals?.[stage.key];
                            const isMyStage = stage.key === myStage;
                            return (
                              <TableCell key={stage.key} className="space-y-2">
                                <Badge
                                  variant="outline"
                                  className={statusClasses[(info?.status ?? "Pending") as ActionStatus]}
                                >
                                  {info?.status ?? "Pending"}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  {info?.by ? `By ${info.by}` : "Not assigned"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {info?.at ? `Updated ${formatDate(info.at)}` : "No update yet"}
                                </p>
                                {info?.notes ? (
                                  <p className="text-xs text-muted-foreground">
                                    Notes: {info.notes}
                                  </p>
                                ) : null}
                                {isMyStage ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={saving}
                                    onClick={() => openModal(event.code, stage.key)}
                                    className="w-full"
                                  >
                                    Update
                                  </Button>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">
                                    Read only
                                  </p>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        {activeEventCode ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update approval</DialogTitle>
              <DialogDescription>
                {stages.find((s) => s.key === activeStage)?.label} • Event:{" "}
                {activeEventCode}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Status
                </label>
                <Select
                  value={modalDraft.status}
                  onValueChange={(value) =>
                    setModalDraft((prev) => ({ ...prev, status: value as ActionStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Approved by
                </label>
                <Input
                  value={modalDraft.by}
                  onChange={(e) =>
                    setModalDraft((prev) => ({ ...prev, by: e.target.value }))
                  }
                  placeholder="Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Notes
                </label>
                <Textarea
                  value={modalDraft.notes}
                  onChange={(e) =>
                    setModalDraft((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={saving}
                onClick={() =>
                  updateApproval(
                    activeEventCode,
                    activeStage,
                    modalDraft.status,
                    modalDraft.by,
                    modalDraft.notes
                  )
                }
              >
                Save approval
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
