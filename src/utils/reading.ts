/** Estimate reading time in minutes from raw markdown body. */
export function readingMinutes(body?: string): number {
  if (!body) return 1;
  return Math.max(1, Math.round(body.split(/\s+/).length / 220));
}
