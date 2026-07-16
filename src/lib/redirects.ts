/** Hanya izinkan path internal absolut. Tolak protocol-relative dan backslash. */
export function safeInternalPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/dashboard",
): string {
  if (typeof value !== "string") return fallback;
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://petacerita.local");
    if (parsed.origin !== "https://petacerita.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
