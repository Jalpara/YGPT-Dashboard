"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useEventsData } from "@/lib/use-events";
import { formatDate } from "@/lib/sample-data";

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

export default function ApprovalsPage() {
  const { data: events, loading, error, refresh } = useEventsData();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [currentRole, setCurrentRole] = useState<StageKey>("regional");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEventCode, setActiveEventCode] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<StageKey>("regional");
  const [modalDraft, setModalDraft] = useState({
    status: "Pending" as ActionStatus,
    by: "",
    notes: "",
  });

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
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    if (statuses.every((status) => status === "Approved")) return "Approved";
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

  const statusClasses: Record<ActionStatus, string> = {
    Pending: "bg-brand-yellow/10 text-brand-dark border-brand-yellow/30",
    Approved: "bg-brand-green/10 text-brand-dark border-brand-green/30",
    Rejected: "bg-brand-orange/10 text-brand-dark border-brand-orange/30",
    "Need Changes": "bg-brand-purple/10 text-brand-dark border-brand-purple/30",
  };

  const openModal = (eventCode: string, stage: StageKey) => {
    const event = events.find((item) => item.code === eventCode);
    const info = event?.approvals?.[stage];
    setActiveEventCode(eventCode);
    setActiveStage(stage);
    setModalDraft({
      status: (info?.status ?? "Pending") as ActionStatus,
      by: info?.by ?? "",
      notes: info?.notes ?? "",
    });
    setModalOpen(true);
  };

  return (
    <div className="px-6 py-8 md:px-8 md:py-10 page-animate">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {error || actionError ? (
          <div className="rounded-[var(--radius-card)] border border-brand-orange/30 bg-brand-orange/10 px-6 py-4 text-sm text-brand-dark shadow-[var(--shadow-soft)]">
            {actionError ?? error}
          </div>
        ) : null}

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] font-lemon">
              Approvals
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Approval workflow</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Regional → YGPT Head → Accounts Team.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold"
          >
            Back to dashboard
          </Link>
        </header>

        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Search events
              </label>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by event code, title, or city"
                className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-4 py-2 text-sm"
              />
            </div>
            <div className="min-w-[200px]">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Overall status
              </label>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-4 py-2 text-sm"
              >
                {statusFilters.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[220px]">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Acting as
              </label>
              <select
                value={currentRole}
                onChange={(event) => setCurrentRole(event.target.value as StageKey)}
                className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-4 py-2 text-sm"
              >
                {stages.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Updates are restricted to the selected role. Use the Approve button in
            that column to open the approval modal.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 shadow-[var(--shadow-soft)]">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--card)] text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Overall</th>
                {stages.map((stage) => (
                  <th key={stage.key} className="px-4 py-3">
                    {stage.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }, (_, index) => (
                    <tr key={index} className="border-t border-[var(--border)]">
                      <td className="px-4 py-4">
                        <div className="h-3 w-32 rounded-full bg-black/10" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 w-20 rounded-full bg-black/10" />
                      </td>
                      {stages.map((stage) => (
                        <td key={stage.key} className="px-4 py-4">
                          <div className="h-10 w-40 rounded-[var(--radius-card)] bg-black/10" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredEvents.map((event) => {
                    const overall = overallStatus(event) as ActionStatus;
                    return (
                      <tr key={event.code} className="border-t border-[var(--border)]">
                        <td className="px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                            {event.code}
                          </p>
                          <Link
                            href={`/events/${event.code}`}
                            className="mt-1 block font-semibold text-[var(--foreground)]"
                          >
                            {event.title}
                          </Link>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {event.city} • {formatDate(event.date)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClasses[overall]}`}
                          >
                            {overall}
                          </span>
                        </td>
                        {stages.map((stage) => {
                          const info = event.approvals?.[stage.key];
                          return (
                            <td key={stage.key} className="px-4 py-4">
                              <div className="space-y-2">
                                <span
                                  className={`inline-flex rounded-[var(--radius-pill)] border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                                    statusClasses[
                                      (info?.status ?? "Pending") as ActionStatus
                                    ]
                                  }`}
                                >
                                  {info?.status ?? "Pending"}
                                </span>
                                <p className="text-xs text-[var(--muted)]">
                                  {info?.by ? `By ${info.by}` : "Not assigned"}
                                </p>
                                <p className="text-[10px] text-[var(--muted)]">
                                  {info?.at
                                    ? `Updated ${formatDate(info.at)}`
                                    : "No update yet"}
                                </p>
                                {info?.notes ? (
                                  <p className="text-[10px] text-[var(--muted)]">
                                    Notes: {info.notes}
                                  </p>
                                ) : null}
                                <button
                                  disabled={saving || currentRole !== stage.key}
                                  onClick={() => openModal(event.code, stage.key)}
                                  className="w-full rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Update
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && activeEventCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                  {stages.find((stage) => stage.key === activeStage)?.label}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Update approval
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Event: {activeEventCode}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-[var(--radius-pill)] border border-[var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
              >
                Close
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Status
                <select
                  value={modalDraft.status}
                  onChange={(event) =>
                    setModalDraft((prev) => ({
                      ...prev,
                      status: event.target.value as ActionStatus,
                    }))
                  }
                  className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  {actions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Approved by
                <input
                  value={modalDraft.by}
                  onChange={(event) =>
                    setModalDraft((prev) => ({ ...prev, by: event.target.value }))
                  }
                  placeholder="Name"
                  className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Notes
                <textarea
                  value={modalDraft.notes}
                  onChange={(event) =>
                    setModalDraft((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Optional notes"
                  className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-[var(--radius-pill)] border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Cancel
                </button>
                <button
                  disabled={saving || currentRole !== activeStage}
                  onClick={() =>
                    updateApproval(
                      activeEventCode,
                      activeStage,
                      modalDraft.status,
                      modalDraft.by,
                      modalDraft.notes
                    )
                  }
                  className="rounded-[var(--radius-pill)] bg-brand-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[var(--shadow-soft)] disabled:opacity-50"
                >
                  Save approval
                </button>
              </div>
              {currentRole !== activeStage ? (
                <p className="text-xs text-brand-orange">
                  Switch role to {stages.find((stage) => stage.key === activeStage)?.label} to approve.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
