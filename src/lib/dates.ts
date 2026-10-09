/**
 * Date display helpers.
 *
 * Post dates are calendar dates ("2026-10-09"), parsed as midnight UTC. Formatting in UTC keeps
 * them on the same day for every reader and build machine, whatever their time zone.
 */
const displayFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "9 Oct 2026" */
export function formatDate(date: Date): string {
  return displayFormat.format(date);
}

/** "2026-10-09": for <time datetime="…"> and structured data. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
