"use client";

import Link from "next/link";
import { useState } from "react";
import {
  EventRecord,
  formatCurrency,
  formatDate,
  invoices,
  photos,
  statusLabels,
  statusStyles,
} from "@/lib/sample-data";

const infoChips = ["EPF responses", "ECR responses", "Budget tracker", "Drive assets"];

const detailTabs = [
  { id: "overview", label: "Overview" },
  { id: "budget", label: "Budget" },
  { id: "coordinator", label: "Coordinator" },
  { id: "social", label: "Social" },
  { id: "completion", label: "Completion" },
] as const;

type DetailTab = (typeof detailTabs)[number]["id"];

export function EventDetails({
  event,
}: {
  event: EventRecord;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const eventInvoices = invoices.filter(
    (invoice) => invoice.eventCode === event.code
  );
  const eventPhotos = photos.filter((photo) => photo.eventCode === event.code);
  const driveInvoices = event.driveFiles?.invoices ?? [];
  const driveMedia = event.driveFiles?.media ?? [];
  const driveOutreach = event.driveFiles?.outreach ?? [];
  const hasDriveFiles =
    driveInvoices.length > 0 || driveMedia.length > 0 || driveOutreach.length > 0;

  const approvals = event.approvals;

  return (
    <div className="px-6 py-8 md:px-8 md:py-10 page-animate">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] font-lemon">
              Event detail
            </p>
            <h1 className="mt-2 text-4xl font-semibold">{event.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {event.code} • {event.city} • {formatDate(event.date)} • Lead: {event.lead}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {infoChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 text-right">
            <span
              className={`inline-flex items-center justify-center rounded-[var(--radius-pill)] border px-4 py-1 text-xs font-semibold ${
                statusStyles[event.status]
              }`}
            >
              {statusLabels[event.status]}
            </span>
            <Link
              href="/events"
              className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold"
            >
              Back to events
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Event details</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Everything trustees need to review this event.
                </p>
              </div>
              <div className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                EPF + ECF
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/90 p-1 text-xs font-semibold uppercase tracking-[0.2em]">
              {detailTabs.map((tab) => (
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

            {activeTab === "overview" ? (
              <div className="mt-6 grid gap-4">
                <div className="grid gap-3 text-sm text-[var(--muted)] md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Event code</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Event type</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.eventType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Proposal type</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.proposalType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Location</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.city}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Event date</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Start time</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.startTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Duration</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Primary lead</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.lead}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3 md:col-span-2">
                    <span>Venue</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.venue}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 text-sm">
                  <a
                    href={event.epfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3"
                  >
                    EPF form
                    <span className="text-brand-orange">↗</span>
                  </a>
                  <a
                    href={event.ecrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3"
                  >
                    ECR form
                    <span className="text-brand-yellow">↗</span>
                  </a>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3 text-[var(--muted)]">
                    Master sheet
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.sheetLink}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3 text-[var(--muted)]">
                    Drive folder
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.driveFolder}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-4 text-sm text-[var(--muted)] md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                      Objective
                    </p>
                    <p className="mt-2 text-sm text-[var(--foreground)]">
                      {event.objective}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-4 text-sm text-[var(--muted)] md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                      Event details
                    </p>
                    <p className="mt-2 text-sm text-[var(--foreground)]">
                      {event.details}
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Estimated participants</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.estimatedParticipants}
                    </span>
                  </div>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3 md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                      Follow up session details
                    </p>
                    <p className="mt-2 text-sm text-[var(--foreground)]">
                      {event.followUpDetails}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "budget" ? (
              <div className="mt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                      Budget
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatCurrency(event.budget)}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                      Spent
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatCurrency(event.spent)}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                      Invoices
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {event.invoices}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Budget required</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.budgetRequired}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Total budget</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {formatCurrency(event.budgetTotal)}
                    </span>
                  </div>
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                      Budget justification
                    </p>
                    <p className="mt-2 text-sm text-[var(--foreground)]">
                      {event.budgetJustification}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "coordinator" ? (
              <div className="mt-6 grid gap-3 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <span>Name</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {event.coordinatorName}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <span>Contact number</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {event.coordinatorPhone}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <span>Email</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {event.coordinatorEmail}
                  </span>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Support team
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.helperNames}
                  </p>
                </div>
              </div>
            ) : null}

            {activeTab === "social" ? (
              <div className="mt-6 grid gap-3 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <span>Flyer needed</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {event.socialFlyerNeeded}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <span>Facebook event</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {event.socialFacebookEventNeeded}
                  </span>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Content notes
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.socialContentNotes}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Design notes
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.socialDesignNotes}
                  </p>
                </div>
              </div>
            ) : null}

            {activeTab === "completion" ? (
              <div className="mt-6 grid gap-4">
                <div className="grid gap-3 text-sm text-[var(--muted)] md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Completion date</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {formatDate(event.completionDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Started on time</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.startedOnTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Actual participants</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.actualParticipants}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Interest count</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.interestCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Data captured</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {event.dataCaptured}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Actual cost</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {formatCurrency(event.actualCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <span>Donation amount</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {formatCurrency(event.donationAmount)}
                    </span>
                  </div>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Delay reason
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.delayReason}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Data capture notes
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.dataCaptureNotes}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Challenges or issues
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.challenges}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Donation details
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.donationDetails}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Event writeup
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.eventWriteup}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Pictures saved
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.picturesSaved}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Picture notes
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.pictureNotes}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                    Social tags
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    {event.socialTags}
                  </p>
                </div>
              </div>
            ) : null}

          </div>

          <div className="space-y-6">
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Approvals</h3>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                {([
                  { key: "regional", label: "Regional Head" },
                  { key: "head", label: "YGPT Head" },
                  { key: "accounts", label: "Accounts Team" },
                ] as const).map((stage) => {
                  const info = approvals?.[stage.key];
                  return (
                    <div
                      key={stage.key}
                      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                        {stage.label}
                      </p>
                      <div className="mt-3 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        {info?.status ?? "Pending"}
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-[var(--muted)]">
                        <p>{info?.by ? `By ${info.by}` : "Not assigned"}</p>
                        <p>
                          Last update: {info?.at ? formatDate(info.at) : "Not yet"}
                        </p>
                        {info?.notes ? <p>Notes: {info.notes}</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">Activity pulses</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Recent highlights synced from Drive and Sheets.
              </p>
              <div className="mt-4 space-y-4">
                {[event].map((activity) => (
                  <div
                    key={activity.code}
                    className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                      {activity.code}
                    </p>
                    <p className="mt-2 text-sm">
                      {activity.invoices} invoices • {activity.photos} photos
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Last update: {formatDate(activity.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">Invoices</h3>
              <div className="mt-4 space-y-3 text-sm">
                {hasDriveFiles && driveInvoices.length > 0
                  ? driveInvoices.map((file) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            Drive invoice
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-brand-orange">
                          ↗
                        </span>
                      </a>
                    ))
                  : eventInvoices.length === 0 ? (
                  <p className="text-[var(--muted)]">No invoices yet.</p>
                ) : (
                  eventInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">
                          {invoice.vendor}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {invoice.id} • {formatDate(invoice.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(invoice.amount)}
                        </p>
                        <p className="text-xs uppercase text-[var(--muted)]">
                          {invoice.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-xl font-semibold">Photo roll</h3>
              <div className="mt-4 space-y-3 text-sm">
                {hasDriveFiles && driveMedia.length > 0
                  ? driveMedia.map((file) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                      >
                        <p className="font-semibold text-[var(--foreground)]">
                          {file.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          Media file
                        </p>
                      </a>
                    ))
                  : eventPhotos.length === 0 ? (
                  <p className="text-[var(--muted)]">No photos yet.</p>
                ) : (
                  eventPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                    >
                      <p className="font-semibold text-[var(--foreground)]">
                        {photo.caption}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {photo.photographer} • {formatDate(photo.date)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                Quick links
              </h4>
              <div className="mt-4 space-y-3 text-sm">
                <a
                  href={event.epfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3"
                >
                  EPF form
                  <span className="text-brand-orange">↗</span>
                </a>
                <a
                  href={event.ecrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3"
                >
                  ECR form
                  <span className="text-brand-yellow">↗</span>
                </a>
                {hasDriveFiles && driveOutreach.length > 0 ? (
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] font-lemon text-[var(--muted)]">
                      Outreach files
                    </p>
                    <div className="mt-2 space-y-2">
                      {driveOutreach.map((file) => (
                        <a
                          key={file.url}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between text-sm text-[var(--foreground)]"
                        >
                          {file.name}
                          <span className="text-brand-teal">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
