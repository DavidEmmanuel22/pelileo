import Link from "next/link";
import { Lockup } from "@/components/brand/Brand";

export default function NotFound() {
  return (
    <main id="contenido" className="grid min-h-dvh place-items-center bg-bg px-6">
      <div className="flex max-w-[380px] flex-col items-center text-center">
        <Lockup size="md" />
        <p className="mt-10 text-[22px] font-bold tracking-[-0.02em] text-ink">No encontramos esta página</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
          Puede que el enlace esté incompleto. Vuelve al mapa o pídele un plan a Gaia.
        </p>
        <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row">
          <Link href="/" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-surface sm:flex-1">
            Ir a Explorar
          </Link>
          <Link
            href="/gaia"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--clapzy)_40%,var(--line))] bg-clapzy-soft text-[15px] font-semibold text-clapzy-ink sm:flex-1"
          >
            Hablar con Gaia
          </Link>
        </div>
      </div>
    </main>
  );
}
