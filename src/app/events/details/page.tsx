import { EventDetails } from "@/app/events/_components/event-details";
import { events } from "@/lib/sample-data";

export default function EventDetailsPreviewPage() {
  return <EventDetails event={events[0]} />;
}
