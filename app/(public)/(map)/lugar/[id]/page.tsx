import { PLACES } from "@/lib/data";

export const dynamicParams = false;
export function generateStaticParams() {
  return PLACES.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="p-8">{id}</div>;
}
