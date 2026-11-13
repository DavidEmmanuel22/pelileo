export type NavItem = { href: string; label: string; match: (path: string) => boolean; gaia?: boolean };

export const NAV: NavItem[] = [
  { href: "/", label: "Inicio", match: (p) => p === "/" },
  { href: "/explorar", label: "Explorar", match: (p) => p.startsWith("/explorar") || p.startsWith("/lugar") },
  { href: "/gaia", label: "Gaia", match: (p) => p.startsWith("/gaia"), gaia: true },
  { href: "/eventos", label: "Eventos", match: (p) => p.startsWith("/eventos") },
  { href: "/guardados", label: "Guardados", match: (p) => p.startsWith("/guardados") },
];
