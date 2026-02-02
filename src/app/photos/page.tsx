"use client";

import Link from "next/link";
import { formatDate } from "@/lib/sample-data";
import { useEventsData } from "@/lib/use-events";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
              Photos
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              Event photo roll
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Drive-linked albums grouped by event code.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </header>

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
            : driveMedia.map((file) => (
                <Card key={file.url}>
                  <CardHeader>
                    <CardDescription className="uppercase tracking-[0.2em]">
                      {file.eventCode}
                    </CardDescription>
                    <CardTitle>{file.name}</CardTitle>
                    <CardDescription>{file.eventTitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{file.updated ? formatDate(file.updated) : "—"}</span>
                    <Button asChild variant="link" className="px-0">
                      <a href={file.url} target="_blank" rel="noreferrer">
                        View file
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </div>
  );
}
