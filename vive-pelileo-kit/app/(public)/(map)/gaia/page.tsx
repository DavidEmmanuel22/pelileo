import type { Metadata } from "next";
import { GaiaView } from "@/components/gaia/GaiaView";

export const metadata: Metadata = { title: "Gaia" };

export default function Page() {
  return <GaiaView />;
}
