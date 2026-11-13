import type { Metadata } from "next";
import { EventsView } from "@/components/events/EventsView";

export const metadata: Metadata = { title: "Eventos" };

export default function Page() {
  return <EventsView />;
}
