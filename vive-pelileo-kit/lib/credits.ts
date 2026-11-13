import credits from "@/public/images/credits.json";

export type Credit = { id: string; kind: string; title: string; source: string; author: string; license: string };
const C = credits as Record<string, Credit>;

export function creditFor(id: string): Credit | undefined {
  return C[id];
}
