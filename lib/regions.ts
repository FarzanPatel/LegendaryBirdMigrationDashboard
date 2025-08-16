// lib/regions.ts

export const riskColor: Record<string, string> = {
  Green: "#22c55e",
  Warning: "#fbbf24",
  Red: "#ef4444"
};

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function formatMonths(months: number[]): string {
  return months.map((m) => MONTHS[m - 1]).join(', ');
}

export interface RegionData {
  region: string;
  risk_zone: "Green" | "Warning" | "Red";
  safe_build_height_m: number;
  safe_flight_floor_m: number;
  migration_density: number;
  best_months: number[];
  monthly_density: number[];
}
