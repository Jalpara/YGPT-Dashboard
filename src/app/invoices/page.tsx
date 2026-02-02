"use client";

import Link from "next/link";
import { formatDate } from "@/lib/sample-data";
import { useEventsData } from "@/lib/use-events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
              Invoices
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              Payments tracker
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Review vendor invoices linked to each event.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }, (_, index) => (
                <Card key={index}>
                  <CardContent className="space-y-3 pt-6">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))
            : invoiceStats.map((card) => (
                <Card key={card.label}>
                  <CardHeader className="pb-2">
                    <CardDescription className="uppercase tracking-[0.2em]">
                      {card.label}
                    </CardDescription>
                    <CardTitle className="text-2xl">{card.value}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {card.detail}
                  </CardContent>
                </Card>
              ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardDescription className="uppercase tracking-[0.3em]">
                Compliance ledger
              </CardDescription>
              <CardTitle className="mt-2">
                Invoice verification queue
              </CardTitle>
              <CardDescription className="mt-2">
                Monitor approvals, tax documentation, and payment release.
              </CardDescription>
            </div>
            <Button size="sm">Export audit pack</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checks</TableHead>
                  <TableHead>Links</TableHead>
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
                  : driveInvoices.map((invoice) => (
                      <TableRow key={invoice.url}>
                        <TableCell className="text-xs font-semibold">
                          {invoice.name}
                        </TableCell>
                        <TableCell>Drive file</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invoice.eventCode} • {invoice.eventTitle}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invoice.updated ? formatDate(invoice.updated) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          —
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Uploaded</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Drive</Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button asChild variant="link" className="px-0">
                            <Link href={`/events/${invoice.eventCode}`}>
                              Event
                            </Link>
                          </Button>
                          <Button asChild variant="link" className="px-0">
                            <a href={invoice.url} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
