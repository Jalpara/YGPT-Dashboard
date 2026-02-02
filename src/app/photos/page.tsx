"use client";

import Link from "next/link";
import { formatDate } from "@/lib/sample-data";
import { useEventsData } from "@/lib/use-events";

export default function PhotosPage() {
  const { data: events, loading, error } = useEventsData();
  const driveMedia = events
    .flatMap((event) =>
      (event.driveFiles?.media ?? []).map((file) => ({
        eventCode: event.code,
        eventTitle: event.title,
        name: file.name,
        url: file.url,
        updated: file.updated,
      }))
    )
    .filter((item) => item.url);

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
              Photos
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Event photo roll</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Drive-linked albums grouped by event code.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold"
          >
            Back to dashboard
          </Link>
        </header>

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
            : driveMedia.map((file) => (
                <a
                  key={file.url}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                    {file.eventCode}
                  </p>
                  <p className="mt-2 text-xl font-semibold">{file.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {file.eventTitle}
                  </p>
                  <p className="mt-4 text-sm text-[var(--muted)]">
                    {file.updated ? formatDate(file.updated) : "—"}
                  </p>
                  <div className="mt-4 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                    View file
                  </div>
                </a>
              ))}
        </div>
      </div>
    </div>
  );
}
