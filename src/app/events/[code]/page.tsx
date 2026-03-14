"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EventDetails } from "@/app/events/_components/event-details";
import { useEventsData } from "@/lib/use-events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventDetailPage() {
  const params = useParams<{ code?: string }>();
  const { data: events, loading, error } = useEventsData();
  const code = params?.code ? params.code.toUpperCase() : "";
  const event = code ? events.find((item) => item.code === code) : undefined;

  if (!event && loading) {
    return (
      <div className="px-6 py-8 md:px-8 md:py-10">
        <Card className="mx-auto w-full max-w-3xl">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Loading event details…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-6 py-8 md:px-8 md:py-10">
        <Card className="mx-auto w-full max-w-3xl">
          {error ? (
            <CardContent className="border-b py-4 text-sm text-destructive">
              {error}
            </CardContent>
          ) : null}
          <CardHeader>
            <CardTitle>Event not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We could not locate an event with code “{code}”.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Available event codes:
              </p>
              <div className="flex flex-wrap gap-2">
                {events.map((item) => (
                  <Button
                    key={item.code}
                    asChild
                    size="sm"
                    variant="secondary"
                  >
                    <Link href={`/events/${item.code}`}>{item.code}</Link>
                  </Button>
                ))}
              </div>
            </div>
            <Button asChild variant="link" className="px-0">
              <Link href="/events">Back to events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EventDetails event={event} />;
}
