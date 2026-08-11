import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEur(value: number, compact = false): string {
  if (compact) {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number, digits = 0): string {
  return `${(value * (Math.abs(value) <= 1 ? 100 : 1)).toFixed(digits)}%`;
}

export function formatMonths(months: number | null | undefined): string {
  if (months == null) return "—";
  if (months >= 12) {
    const y = Math.floor(months / 12);
    const m = months % 12;
    return m ? `${y}y ${m}mo` : `${y}y`;
  }
  return `${months} mo`;
}
