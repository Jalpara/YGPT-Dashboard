"use client";

import Link from "next/link";
import { formatDate } from "@/lib/sample-data";
import { useEventsData } from "@/lib/use-events";

export default function InvoicesPage() {
  const { data: events, loading, error } = useEventsData();
  const driveInvoices = events
    .flatMap((event) =>
      (event.driveFiles?.invoices ?? []).map((file) => ({
        eventCode: event.code,
        eventTitle: event.title,
        name: file.name,
        url: file.url,
        updated: file.updated,
      }))
    )
    .filter((item) => item.url);
  const invoiceStats = [
    {
      label: "Invoices verified",
      value: driveInvoices.length.toString(),
      detail: "Includes tax + vendor checks",
    },
    {
      label: "Pending approvals",
      value: events
        .filter(
          (event) =>
            event.budgetRequired === "Yes" &&
            (event.driveFiles?.invoices ?? []).length === 0
        )
        .length.toString(),
      detail: "Awaiting trustee sign-off",
    },
    {
      label: "Flagged exceptions",
      value: events
        .filter(
          (event) =>
            event.budgetRequired === "Yes" &&
            (event.driveFiles?.invoices ?? []).length > 0 &&
            event.spent > event.budget
        )
        .length.toString(),
      detail: "Need clarifications",
    },
  ];

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
              Invoices
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Payments tracker</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Review vendor invoices linked to each event.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold"
          >
            Back to dashboard
          </Link>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
                >
                  <div className="h-3 w-24 rounded-full bg-black/10" />
                  <div className="mt-4 h-8 w-16 rounded-full bg-black/10" />
                  <div className="mt-3 h-3 w-32 rounded-full bg-black/10" />
                </div>
              ))
            : invoiceStats.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {card.detail}
                  </p>
                </div>
              ))}
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] font-lemon">
                  Compliance ledger
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Invoice verification queue
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Monitor approvals, tax documentation, and payment release.
                </p>
              </div>
              <button className="rounded-[var(--radius-pill)] bg-brand-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[var(--shadow-soft)]">
                Export audit pack
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--card)] text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Checks</th>
                    <th className="px-4 py-3">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 4 }, (_, index) => (
                        <tr
                          key={index}
                          className="border-t border-[var(--border)]"
                        >
                          {Array.from({ length: 8 }, (_, cell) => (
                            <td key={cell} className="px-4 py-3">
                              <div className="h-3 w-20 rounded-full bg-black/10" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : driveInvoices.map((invoice) => (
                        <tr
                          key={invoice.url}
                          className="border-t border-[var(--border)]"
                        >
                          <td className="px-4 py-3 text-xs font-semibold text-[var(--foreground)]">
                            {invoice.name}
                          </td>
                          <td className="px-4 py-3">Drive file</td>
                          <td className="px-4 py-3 text-sm text-[var(--muted)]">
                            {invoice.eventCode} • {invoice.eventTitle}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--muted)]">
                            {invoice.updated
                              ? formatDate(invoice.updated)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            —
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-[var(--radius-pill)] border border-brand-green/30 bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green">
                              Uploaded
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded-[var(--radius-pill)] border border-brand-green/40 bg-brand-green/10 px-2 py-1 text-brand-green">
                                Drive
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                              <Link
                                href={`/events/${invoice.eventCode}`}
                                className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1 text-brand-blue"
                              >
                                Event
                              </Link>
                              <a
                                href={invoice.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-1 text-brand-orange"
                              >
                                Open
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
}
