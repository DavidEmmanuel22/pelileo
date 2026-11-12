import type { Metadata } from "next";
import { getPlace, PLACES } from "@/lib/data";
import { PlaceView } from "@/components/place/PlaceView";

export const dynamicParams = false;
export function generateStaticParams() {
  return PLACES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPlace(id);
  return { title: p ? p.name : "Lugar", description: p?.short };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaceView key={id} id={id} />;
}
