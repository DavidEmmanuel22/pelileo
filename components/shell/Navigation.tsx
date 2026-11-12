"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, CalendarDays, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Lockup } from "@/components/brand/Brand";
import { NAV } from "./nav";

const ICONS = { "/": MapIcon, "/eventos": CalendarDays, "/guardados": Bookmark } as const;

function GaiaGlyph({ size = 22 }: { size?: number }) {
  return (
    <Image
      src="/brand/clapzy-icon.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

/** Barra superior de escritorio (≥1024px). */
export function TopBar() {
  const path = usePathname() ?? "/";
  return (
    <header className="fixed inset-x-0 top-0 z-40 hidden h-[var(--topbar-h)] items-center border-b border-line bg-surface/92 px-6 backdrop-blur-md lg:flex">
      <Link href="/" aria-label="Vive Pelileo, ir a Explorar" className="rounded-lg">
        <Lockup size="sm" />
      </Link>
      <nav aria-label="Secciones" className="ml-12 flex h-full items-stretch gap-1">
        {NAV.map((item) => {
          const active = item.match(path);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-2 px-3.5 text-[14px] font-medium transition-colors duration-200 ${
                active ? "text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {item.gaia && <GaiaGlyph size={16} />}
              {item.label}
              {active && (
                <motion.span
                  layoutId="topbar-active"
                  className={`absolute inset-x-3 bottom-0 h-[2px] rounded-full ${item.gaia ? "bg-clapzy" : "bg-ink"}`}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto flex items-center gap-4 text-[13px] text-ink-2">
        <span className="hidden xl:inline">Cantón San Pedro de Pelileo · Tungurahua</span>
      </div>
    </header>
  );
}

/** Tab bar inferior (mobile y tablet, <1024px). */
export function TabBar() {
  const path = usePathname() ?? "/";
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-[var(--tabbar-h)] max-w-[560px] grid-cols-4">
        {NAV.map((item) => {
          const active = item.match(path);
          const Icon = item.gaia ? null : ICONS[item.href as keyof typeof ICONS];
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200 ${
                  active ? (item.gaia ? "text-clapzy-ink" : "text-ink") : "text-ink-2"
                }`}
              >
                <span className="grid h-6 place-items-center">
                  {Icon ? (
                    <Icon size={22} strokeWidth={active ? 2 : 1.6} aria-hidden="true" />
                  ) : (
                    <span className={active ? "" : "opacity-80 grayscale-[35%]"}>
                      <GaiaGlyph size={21} />
                    </span>
                  )}
                </span>
                {item.label}
                {active && (
                  <motion.span
                    layoutId="tabbar-active"
                    className={`absolute top-0 h-[2px] w-8 rounded-full ${item.gaia ? "bg-clapzy" : "bg-ink"}`}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
