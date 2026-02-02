"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EventDetails } from "@/app/events/_components/event-details";
import { useEventsData } from "@/lib/use-events";

export default function EventDetailPage() {
  const params = useParams<{ code?: string }>();
  const { data: events, loading, error } = useEventsData();
  const code = params?.code ? params.code.toUpperCase() : "";
  const event = code ? events.find((item) => item.code === code) : undefined;

  if (!event && loading) {
    return (
      <div className="px-6 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-8 shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--muted)]">Loading event details…</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-6 py-8 md:px-8 md:py-10 page-animate">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-8 shadow-[var(--shadow-card)]">
          {error ? (
            <div className="rounded-[var(--radius-card)] border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm text-brand-dark">
              {error}
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)] font-lemon">
              Event details
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Event not found
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              We could not locate an event with code “{code}”.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
            Available event codes:
            <div className="mt-2 flex flex-wrap gap-2">
              {events.map((item) => (
                <Link
                  key={item.code}
                  href={`/events/${item.code}`}
                  className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                >
                  {item.code}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-brand-orange"
          >
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  return <EventDetails event={event} />;
}
