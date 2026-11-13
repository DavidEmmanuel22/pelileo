export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Traslado según BRIEF §5: km × 2.2 min (vías de montaña), redondeado a 5, mínimo 3. < 400 m = a pie. */
export function travelBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): { minutes: number; mode: "auto" | "a pie"; km: number } {
  const km = haversineKm(a, b);
  if (km < 0.4) {
    return { minutes: Math.max(2, Math.round((km * 1000) / 80)), mode: "a pie", km };
  }
  const rounded = Math.round((km * 2.2) / 5) * 5;
  return { minutes: Math.max(3, rounded), mode: "auto", km };
}

export function travelLabel(minutes?: number, mode?: string): string | null {
  if (minutes == null) return null;
  if (mode === "a pie") return `${minutes} min a pie`;
  if (mode === "camioneta") return `${minutes} min en camioneta`;
  return `${minutes} min en auto`;
}
