import type { Metadata } from "next";
import { Dashboard } from "@/components/municipio/Dashboard";

export const metadata: Metadata = { title: "Panel de Turismo · GAD Pelileo", robots: { index: false } };

export default function Page() {
  return <Dashboard />;
}
