/**
 * Peyton, Colorado timezone: America/Denver (Mountain Time)
 * - MST (UTC-7) during standard time (early Nov to mid-Mar)
 * - MDT (UTC-6) during daylight saving time (mid-Mar to early Nov)
 */
export const TIMEZONE = "America/Denver";

/**
 * Parse date/time in Mountain Time to UTC.
 * Simple approach: assume DST for Apr-Oct, standard time otherwise.
 */
export function parseEventDateTime(dateStr: string, timeStr?: string): Date {
  try {
    if (!dateStr || typeof dateStr !== "string") {
      throw new Error("Date string is required");
    }

    const parts = dateStr.split("-");
    if (parts.length !== 3) throw new Error(`Invalid date format: ${dateStr}`);

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error(`Invalid date values: ${dateStr}`);
    }

    const timeParts = (timeStr || "00:00").split(":");
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;

    // Mountain Time offset: MDT (Apr-Oct) = UTC-6, MST (Nov-Mar) = UTC-7
    const isDST = month >= 4 && month <= 10;
    const offsetHours = isDST ? 6 : 7;

    // Input is local Mountain Time, add offset to get UTC
    return new Date(Date.UTC(year, month - 1, day, hours + offsetHours, minutes, 0));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`parseEventDateTime failed: ${message}`);
  }
}

/**
 * Format a UTC timestamp for display in Mountain Time.
 */
export function formatMountainTime(
  date: Date | { toDate: () => Date } | unknown,
  lang: string = "es"
): string {
  if (!date) return "-";

  let dateObj: Date;
  try {
    if (typeof (date as { toDate: () => Date }).toDate === "function") {
      dateObj = (date as { toDate: () => Date }).toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date as string);
    }
  } catch {
    return "-";
  }

  if (isNaN(dateObj.getTime())) return "-";

  try {
    return dateObj.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "-";
  }
}

/**
 * Format a UTC timestamp as just the date in Mountain Time.
 */
export function formatMountainDate(
  date: Date | { toDate: () => Date } | unknown,
  lang: string = "es"
): string {
  if (!date) return "-";

  let dateObj: Date;
  try {
    if (typeof (date as { toDate: () => Date }).toDate === "function") {
      dateObj = (date as { toDate: () => Date }).toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date as string);
    }
  } catch {
    return "-";
  }

  if (isNaN(dateObj.getTime())) return "-";

  try {
    return dateObj.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}
