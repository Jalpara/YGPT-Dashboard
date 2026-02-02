import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import "./globals.css";

const body = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "YGPT Dashboard",
  description: "Event management dashboard for YGPT operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${body.variable} antialiased`}>
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
            <aside className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-8 shadow-[var(--shadow-soft)] md:border-b-0 md:border-r">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-soft)]">
                  <Image
                    src="/logo.avif"
                    alt="YGPT logo"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">
                    YGPT Dashboard
                  </p>
                  <p className="text-xs text-[var(--muted)]">Event Ops</p>
                </div>
              </div>
              <nav className="mt-8 grid gap-3 text-sm font-semibold text-[var(--foreground)] md:mt-10">
                <Link
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]"
                  href="/"
                >
                  Overview
                  <span className="text-brand-orange">●</span>
                </Link>
                <Link
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/70 px-4 py-3 text-[var(--muted)]"
                  href="/events"
                >
                  Events
                  <span className="text-brand-purple">→</span>
                </Link>
                <Link
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/70 px-4 py-3 text-[var(--muted)]"
                  href="/invoices"
                >
                  Invoices
                  <span className="text-brand-green">→</span>
                </Link>
                <Link
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/70 px-4 py-3 text-[var(--muted)]"
                  href="/photos"
                >
                  Photos
                  <span className="text-brand-yellow">→</span>
                </Link>
                <Link
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-white/70 px-4 py-3 text-[var(--muted)]"
                  href="/approvals"
                >
                  Approvals
                  <span className="text-brand-orange">→</span>
                </Link>
              </nav>
            </aside>
            <main className="min-h-screen">
              <div className="border-b border-[var(--border)] bg-white px-6 py-6 shadow-[var(--shadow-soft)] md:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] font-lemon">
                      Trustee view
                    </p>
                    <h2 className="text-2xl font-semibold text-brand-dark">
                      Operational dashboard
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                      Filters
                    </button>
                    <button className="rounded-[var(--radius-pill)] bg-brand-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[var(--shadow-soft)]">
                      Add event
                    </button>
                  </div>
                </div>
              </div>
              <div>{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
