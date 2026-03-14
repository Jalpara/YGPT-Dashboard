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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const infoChips = ["EPF responses", "ECR responses", "Budget tracker", "Drive assets"];

const detailTabs = [
  { id: "overview", label: "Overview" },
  { id: "budget", label: "Budget" },
  { id: "coordinator", label: "Coordinator" },
  { id: "social", label: "Social" },
  { id: "completion", label: "Completion" },
] as const;

type DetailTab = (typeof detailTabs)[number]["id"];

export function EventDetails({ event }: { event: EventRecord }) {
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
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Event detail
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              {event.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {event.code} • {event.city} • {formatDate(event.date)} • Lead:{" "}
              {event.lead}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {infoChips.map((chip) => (
                <Badge key={chip} variant="secondary">
                  {chip}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 text-right">
            <Badge variant="outline" className={statusStyles[event.status]}>
              {statusLabels[event.status]}
            </Badge>
            <Button asChild variant="outline">
              <Link href="/events">Back to events</Link>
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Event details</CardTitle>
              <CardDescription>
                Everything trustees need to review this event.
              </CardDescription>
            </div>
            <Badge variant="secondary">EPF + ECF</Badge>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DetailTab)}>
              <TabsList>
                {detailTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Event code", event.code],
                    ["Event type", event.eventType],
                    ["Proposal type", event.proposalType],
                    ["Location", event.city],
                    ["Event date", formatDate(event.date)],
                    ["Start time", event.startTime],
                    ["Duration", event.duration],
                    ["Primary lead", event.lead],
                    ["Venue", event.venue],
                  ].map(([label, value]) => (
                    <Card key={label} className="bg-muted/30">
                      <CardContent className="flex items-center justify-between py-4 text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 grid gap-3">
                  <Button asChild variant="outline" className="justify-between">
                    <a href={event.epfUrl} target="_blank" rel="noreferrer">
                      EPF form
                      <span>↗</span>
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="justify-between">
                    <a href={event.ecrUrl} target="_blank" rel="noreferrer">
                      ECR form
                      <span>↗</span>
                    </a>
                  </Button>
                  <Card className="bg-muted/30">
                    <CardContent className="flex items-center justify-between py-3 text-sm">
                      <span className="text-muted-foreground">Master sheet</span>
                      <span className="font-semibold">{event.sheetLink}</span>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="flex items-center justify-between py-3 text-sm">
                      <span className="text-muted-foreground">Drive folder</span>
                      <span className="font-semibold">{event.driveFolder}</span>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="budget">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-muted/30">
                    <CardContent className="py-4 text-sm">
                      <p className="text-muted-foreground">Budget required</p>
                      <p className="mt-1 text-xl font-semibold">
                        {event.budgetRequired}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="py-4 text-sm">
                      <p className="text-muted-foreground">Budget total</p>
                      <p className="mt-1 text-xl font-semibold">
                        {formatCurrency(event.budgetTotal)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 md:col-span-2">
                    <CardHeader>
                      <CardDescription>Budget justification</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      {event.budgetJustification}
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-6 grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoices</CardTitle>
                      <CardDescription>Captured in the finance ledger.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eventInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.id}</TableCell>
                              <TableCell>{invoice.vendor}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(invoice.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{invoice.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="coordinator">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Coordinator", event.coordinatorName],
                    ["Phone", event.coordinatorPhone],
                    ["Email", event.coordinatorEmail],
                    ["Helpers", event.helperNames],
                  ].map(([label, value]) => (
                    <Card key={label} className="bg-muted/30">
                      <CardContent className="py-4 text-sm">
                        <p className="text-muted-foreground">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="social">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Social flyer needed", event.socialFlyerNeeded],
                    ["Facebook event needed", event.socialFacebookEventNeeded],
                    ["Social content notes", event.socialContentNotes],
                    ["Social design notes", event.socialDesignNotes],
                  ].map(([label, value]) => (
                    <Card key={label} className="bg-muted/30">
                      <CardContent className="py-4 text-sm">
                        <p className="text-muted-foreground">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completion">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Completion summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      {[
                        ["Completion date", formatDate(event.completionDate)],
                        ["Started on time", event.startedOnTime],
                        ["Actual participants", event.actualParticipants.toString()],
                        ["Data captured", event.dataCaptured],
                      ].map(([label, value]) => (
                        <div key={label} className="text-sm">
                          <p className="text-muted-foreground">{label}</p>
                          <p className="mt-1 font-semibold">{value}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Event photos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Caption</TableHead>
                            <TableHead>Photographer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eventPhotos.map((photo) => (
                            <TableRow key={photo.id}>
                              <TableCell>{photo.id}</TableCell>
                              <TableCell>{photo.caption}</TableCell>
                              <TableCell>{photo.photographer}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approvals</CardTitle>
            <CardDescription>Current approval status snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              ["Regional", approvals?.regional?.status ?? "Pending"],
              ["Head", approvals?.head?.status ?? "Pending"],
              ["Accounts", approvals?.accounts?.status ?? "Pending"],
            ].map(([label, value]) => (
              <Card key={label} className="bg-muted/30">
                <CardContent className="py-4 text-sm">
                  <p className="text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drive assets</CardTitle>
            <CardDescription>
              Synced file snapshots for this event.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Invoices</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {driveInvoices.length} files
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Media</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {driveMedia.length} files
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Outreach</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {driveOutreach.length} files
              </CardContent>
            </Card>
          </CardContent>
          {!hasDriveFiles ? (
            <CardContent className="pt-0 text-sm text-muted-foreground">
              No drive assets linked yet.
            </CardContent>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
