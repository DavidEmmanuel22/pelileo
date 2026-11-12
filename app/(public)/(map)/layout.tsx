import { MapStage } from "@/components/map/MapStage";

/** Layout con mapa persistente: el mapa no se desmonta al navegar entre Explorar, Lugar, Eventos y Gaia. */
export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] overflow-hidden lg:top-[var(--topbar-h)] lg:bottom-0">
      <div className="absolute inset-0 lg:left-[var(--panel-w)]">
        <MapStage />
      </div>
      {children}
    </div>
  );
}
