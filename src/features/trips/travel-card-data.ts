export type TravelCardData = {
  tripName: string;
  city: string;
  dateRange: string;
  dayCount: number;
  memberNames: string[];
  destinationNames: string[];
  baseCurrency: string;
  routeDays: Array<{
    day: number;
    points: Array<{ lat: number; lng: number }>;
  }>;
};

export function uniqueNames(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    const key = value.toLocaleLowerCase("id-ID");
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

export function summarizeList(values: string[], limit: number): string {
  const unique = uniqueNames(values);
  const shown = unique.slice(0, limit);
  const remaining = unique.length - shown.length;
  if (remaining <= 0) return shown.join(", ");
  return `${shown.join(", ")} +${remaining} lainnya`;
}

export function safeCardFilename(
  tripName: string,
  variant: "card" | "overlay" = "card",
): string {
  const slug = tripName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = variant === "overlay" ? "-overlay-rute" : "";
  return `petacerita-${slug || "perjalanan"}${suffix}.png`;
}
