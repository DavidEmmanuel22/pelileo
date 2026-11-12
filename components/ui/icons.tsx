import {
  BedDouble,
  CalendarDays,
  Landmark,
  Martini,
  Palette,
  ShoppingBag,
  Trees,
  UtensilsCrossed,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { Category, EventItem } from "@/data/types";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  comer: UtensilsCrossed,
  beber: Martini,
  dormir: BedDouble,
  aventura: Wind,
  cultura: Landmark,
  compras: ShoppingBag,
  naturaleza: Trees,
  experiencia: Palette,
};

export const EVENT_ICON: Record<EventItem["category"], LucideIcon> = {
  feria: ShoppingBag,
  musica: CalendarDays,
  gastronomia: UtensilsCrossed,
  deporte: Wind,
  cultura: Landmark,
  tradicion: CalendarDays,
};

export function CategoryIcon({
  category,
  size = 16,
  strokeWidth = 1.75,
  className = "",
}: {
  category: Category;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Icon = CATEGORY_ICON[category];
  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
