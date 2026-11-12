"use client";

import Link from "next/link";
import type { Place } from "@/data/types";
import { CATEGORY_LABEL, EVENT_CATEGORY_LABEL, eventImage, placeImage, priceLevelLabel } from "@/lib/data";
import type { DatedEvent } from "@/lib/events";
import { useNow } from "@/lib/hooks";
import { monthShort, openStatus, WEEKDAY_SHORT, weekdayOf } from "@/lib/time";
import { Photo } from "@/components/ui/Photo";
import { Stars } from "@/components/ui/bits";
import { CategoryIcon } from "@/components/ui/icons";

export function PlaceCard({
  place,
  active,
  onFocus,
  priority,
  className = "",
}: {
  place: Place;
  active?: boolean;
  onFocus?: () => void;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/lugar/${place.id}`}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      data-place={place.id}
      className={`group block overflow-hidden rounded-[var(--radius-card)] border bg-surface transition-[border-color,box-shadow] duration-300 ${
        active ? "border-ink shadow-soft" : "border-line hover:border-ink-3"
      } ${className}`}
    >
      <Photo
        src={placeImage(place)}
        alt={place.name}
        category={place.category}
        className="aspect-[4/3] w-full"
        sizes="(max-width: 1023px) 70vw, 200px"
        priority={priority}
      />
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
          <CategoryIcon category={place.category} size={13} />
          <span>{CATEGORY_LABEL[place.category]}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{place.parish}</span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">{place.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-2">{place.short}</p>
      </div>
    </Link>
  );
}

export function OpenBadge({ place, compact = false }: { place: Place; compact?: boolean }) {
  const now = useNow();
  if (!now) return <span className="skeleton inline-block h-3.5 w-20 rounded" aria-hidden="true" />;
  const st = openStatus(place.hours, now);
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] ${st.open ? "text-pel-green" : "text-ink-2"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${st.open ? "bg-pel-green" : "bg-ink-3"}`} aria-hidden="true" />
      <span className="font-semibold">{st.open ? "Abierto" : "Cerrado"}</span>
      {!compact && <span className="text-ink-2">· {st.label}</span>}
    </span>
  );
}

export function PlaceRow({ place, onHover }: { place: Place; onHover?: (id: string | null) => void }) {
  return (
    <Link
      href={`/lugar/${place.id}`}
      onMouseEnter={() => onHover?.(place.id)}
      onMouseLeave={() => onHover?.(null)}
      className="flex items-center gap-3.5 px-5 py-3 transition-colors duration-200 hover:bg-bg"
    >
      <Photo
        src={placeImage(place)}
        alt=""
        category={place.category}
        className="h-16 w-16 shrink-0 rounded-xl"
        sizes="64px"
        iconSize={20}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-ink">{place.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-2">
          <span>{CATEGORY_LABEL[place.category]}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{place.parish}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{priceLevelLabel(place)}</span>
        </span>
        <span className="mt-1 flex items-center gap-3">
          <OpenBadge place={place} compact />
          {place.rating && <Stars rating={place.rating} />}
        </span>
      </span>
    </Link>
  );
}

export function DateBlock({ date, className = "" }: { date: Date; className?: string }) {
  return (
    <span
      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-surface leading-none ${className}`}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-2">{WEEKDAY_SHORT[weekdayOf(date)]}</span>
      <span className="mt-1 text-[19px] font-bold tabular text-ink">{date.getDate()}</span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-2">{monthShort(date)}</span>
    </span>
  );
}

export function EventMini({ d }: { d: DatedEvent }) {
  return (
    <Link href={`/eventos#${d.ev.id}`} className="flex items-center gap-3.5 px-5 py-2.5 transition-colors duration-200 hover:bg-bg">
      <DateBlock date={d.date} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-semibold text-ink">{d.ev.title}</span>
        <span className="mt-0.5 block truncate text-[12.5px] text-ink-2">
          {d.ev.start} · {d.placeName}
        </span>
        <span className="mt-0.5 block text-[12.5px] font-medium text-ink">{d.ev.price ? `$${d.ev.price}` : "Gratis"}</span>
      </span>
      <Photo
        src={eventImage(d.ev)}
        alt=""
        category="evento"
        className="hidden h-14 w-14 shrink-0 rounded-xl sm:block"
        sizes="56px"
        iconSize={16}
      />
    </Link>
  );
}

export { EVENT_CATEGORY_LABEL };
