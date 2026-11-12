"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkX, CalendarDays, Trash2 } from "lucide-react";
import { getPlace, placeImage } from "@/lib/data";
import { itineraryTotal } from "@/lib/gaia";
import { useApp, type SavedPlan } from "@/lib/store";
import { useGaia } from "@/lib/gaiaStore";
import { Lockup, GaiaMark } from "@/components/brand/Brand";
import { Photo } from "@/components/ui/Photo";
import { FooterLinks } from "@/components/ui/bits";
import { PlaceRow } from "@/components/places/cards";

export function SavedView() {
  const hydrated = useApp((s) => s.hydrated);
  const savedPlaces = useApp((s) => s.savedPlaces);
  const savedPlans = useApp((s) => s.savedPlans);
  const toggle = useApp((s) => s.toggleSavedPlace);
  const places = savedPlaces.map((id) => getPlace(id)).filter((p): p is NonNullable<typeof p> => !!p);
  const empty = hydrated && places.length === 0 && savedPlans.length === 0;

  return (
    <main className="min-h-dvh bg-bg pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+24px)] pt-[max(16px,env(safe-area-inset-top))] lg:pb-10 lg:pt-[calc(var(--topbar-h)+40px)]">
      <div className="mx-auto max-w-[760px]">
        <div className="px-5 lg:hidden">
          <Lockup size="sm" />
        </div>
        <header className="mt-6 px-5 lg:mt-0">
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink lg:text-[32px]">Guardados</h1>
          <p className="mt-1 text-[14.5px] text-ink-2">Tus lugares favoritos y los planes que armaste con Gaia. Se guardan en este dispositivo.</p>
        </header>

        {!hydrated ? (
          <div className="mt-8 space-y-3 px-5" aria-hidden="true">
            <div className="skeleton h-28 rounded-[var(--radius-card)]" />
            <div className="skeleton h-20 rounded-[var(--radius-card)]" />
          </div>
        ) : empty ? (
          <EmptyState />
        ) : (
          <>
            <section className="mt-8" aria-labelledby="planes">
              <h2 id="planes" className="flex items-baseline gap-2 px-5 text-[18px] font-semibold tracking-[-0.01em] text-ink">
                Planes de Gaia <span className="text-[13px] font-medium text-ink-2">{savedPlans.length}</span>
              </h2>
              {savedPlans.length === 0 ? (
                <Link
                  href="/gaia"
                  className="mx-5 mt-3 flex items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line bg-surface p-4 text-[14px] text-ink-2 transition-colors hover:border-ink-3"
                >
                  <GaiaMark size={32} />
                  <span>
                    Aún no guardas planes. <span className="font-semibold text-clapzy-ink">Arma uno con Gaia →</span>
                  </span>
                </Link>
              ) : (
                <ul className="mt-3 grid gap-3 px-5 sm:grid-cols-2">
                  {savedPlans.map((p) => (
                    <li key={p.id}>
                      <PlanCard plan={p} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-10" aria-labelledby="lugares">
              <h2 id="lugares" className="flex items-baseline gap-2 px-5 text-[18px] font-semibold tracking-[-0.01em] text-ink">
                Lugares <span className="text-[13px] font-medium text-ink-2">{places.length}</span>
              </h2>
              {places.length === 0 ? (
                <p className="mx-5 mt-3 rounded-[var(--radius-card)] border border-dashed border-line bg-surface p-4 text-[14px] text-ink-2">
                  Toca <Bookmark size={14} className="inline -translate-y-px" aria-label="Guardar" /> en cualquier lugar para tenerlo a mano aquí.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-line overflow-hidden border-y border-line bg-surface sm:mx-5 sm:rounded-[var(--radius-card)] sm:border">
                  {places.map((p) => (
                    <li key={p.id} className="flex items-center">
                      <div className="min-w-0 flex-1">
                        <PlaceRow place={p} />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        aria-label={`Quitar ${p.name} de Guardados`}
                        className="mr-3 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-bg hover:text-ink"
                      >
                        <BookmarkX size={18} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
        <FooterLinks />
      </div>
    </main>
  );
}

function PlanCard({ plan }: { plan: SavedPlan }) {
  const router = useRouter();
  const removePlan = useApp((s) => s.removePlan);
  const loadPlan = useGaia((s) => s.loadPlan);
  const it = plan.itinerary;
  const total = itineraryTotal(it);
  const first = it.days[0]?.steps.find((s) => placeImage({ id: s.placeId }));
  const cover = first ? getPlace(first.placeId) : undefined;
  const stops = it.days.reduce((a, d) => a + d.steps.length, 0);
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      <button
        type="button"
        onClick={() => {
          loadPlan(it);
          router.push("/gaia");
        }}
        className="flex w-full gap-3.5 p-3.5 text-left"
      >
        <Photo src={cover ? placeImage(cover) : null} alt="" category={cover?.category} className="h-[72px] w-[72px] shrink-0 rounded-xl" sizes="72px" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15.5px] font-semibold leading-snug text-ink">{it.title}</span>
          <span className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-2">
            <CalendarDays size={13} aria-hidden="true" />
            {it.days.map((d) => d.label).join(" y ")} · {stops} paradas
          </span>
          <span className="mt-1 block text-[13px] text-ink">
            <span className="font-semibold">${total}</span> <span className="text-ink-2">de ${it.budget}</span>
          </span>
        </span>
      </button>
      <div className="flex items-center border-t border-line px-1.5 py-1">
        <button
          type="button"
          onClick={() => {
            loadPlan(it);
            router.push("/gaia");
          }}
          className="inline-flex h-10 items-center rounded-full px-3 text-[13.5px] font-semibold text-clapzy-ink transition-colors hover:bg-clapzy-soft"
        >
          Abrir en Gaia
        </button>
        <button
          type="button"
          onClick={() => removePlan(plan.id)}
          aria-label={`Eliminar el plan ${it.title}`}
          className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-2 transition-colors hover:bg-bg hover:text-ink"
        >
          <Trash2 size={14} aria-hidden="true" />
          Eliminar
        </button>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="mx-5 mt-8 flex flex-col items-center rounded-[var(--radius-card)] border border-line bg-surface px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-bg-2 text-ink-2">
        <Bookmark size={24} aria-hidden="true" />
      </span>
      <p className="mt-4 text-[18px] font-semibold text-ink">Aún no guardas nada</p>
      <p className="mt-1.5 max-w-[340px] text-[14.5px] leading-relaxed text-ink-2">
        Guarda los lugares que te gusten o pídele a Gaia un plan a tu medida. Todo quedará aquí.
      </p>
      <div className="mt-6 flex w-full max-w-[360px] flex-col gap-2.5 sm:flex-row">
        <Link href="/" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink sm:flex-1 text-[14.5px] font-semibold text-surface">
          Explorar Pelileo
        </Link>
        <Link
          href="/gaia"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border sm:flex-1 border-[color-mix(in_srgb,var(--clapzy)_40%,var(--line))] bg-clapzy-soft text-[14.5px] font-semibold text-clapzy-ink"
        >
          Arma un plan con Gaia
        </Link>
      </div>
    </div>
  );
}
