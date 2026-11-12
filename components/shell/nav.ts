export type NavItem = { href: string; label: string; match: (path: string) => boolean; gaia?: boolean };

export const NAV: NavItem[] = [
  { href: "/", label: "Explorar", match: (p) => p === "/" || p.startsWith("/lugar") },
  { href: "/eventos", label: "Eventos", match: (p) => p.startsWith("/eventos") },
  { href: "/gaia", label: "Gaia", match: (p) => p.startsWith("/gaia"), gaia: true },
  { href: "/guardados", label: "Guardados", match: (p) => p.startsWith("/guardados") },
];
