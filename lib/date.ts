/**
 * Date & Time Utility Suite for CSE Community
 */

/**
 * Formats an ISO string, timestamp integer, or date string into a relative human-readable time.
 * Examples: "Just now", "5m ago", "2h ago", "3d ago", "Aug 12, 2026"
 */
export function formatRelativeTime(rawDate?: string | number | Date | null): string {
  if (!rawDate) return "Just now";

  if (typeof rawDate === "string") {
    const trimmed = rawDate.trim();
    // Return pre-formatted relative strings as-is
    if (trimmed.includes("ago") || trimmed === "Just now" || trimmed.includes("Just authorized")) {
      return trimmed;
    }
    // If it's a date-only string without time (e.g. "Aug 12", "March 15", "Oct 24, 2026")
    if (/^[A-Za-z]{3,9}\s+\d{1,2}(,\s+\d{4})?$/.test(trimmed)) {
      return trimmed;
    }
  }

  const d = new Date(rawDate);
  if (isNaN(d.getTime())) {
    return typeof rawDate === "string" ? rawDate : "Just now";
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - d.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Parses an event date string and extracts standardized Month (MMM) and Day (DD).
 */
export function parseEventDate(dateStr?: string | null): { month: string; day: string; formattedDate: string } {
  if (!dateStr) {
    return { month: "TBA", day: "--", formattedDate: "Upcoming" };
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Fallback parsing for strings like "Oct 24" or "October 24, 2026"
    const parts = dateStr.trim().split(/[\s,/-]+/);
    if (parts.length >= 2) {
      const monthPart = parts[0].substring(0, 3).toUpperCase();
      const dayPart = parts[1].padStart(2, "0");
      return { month: monthPart, day: dayPart, formattedDate: dateStr };
    }
    return { month: "TBA", day: "--", formattedDate: dateStr };
  }

  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  const formattedDate = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return { month, day, formattedDate };
}

/**
 * Calculates remaining days until a deadline.
 */
export function calculateDaysRemaining(deadlineStr?: string | null): { daysRemaining: number; label: string } {
  if (!deadlineStr || deadlineStr === "Upcoming" || deadlineStr === "Open") {
    return { daysRemaining: 14, label: deadlineStr || "Upcoming" };
  }

  const deadlineDate = new Date(deadlineStr);
  if (isNaN(deadlineDate.getTime())) {
    return { daysRemaining: 14, label: deadlineStr };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(23, 59, 59, 999);

  const diffMs = deadlineDate.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { daysRemaining: 0, label: "Expired" };
  }
  if (days === 0) {
    return { daysRemaining: 0, label: "Ends Today" };
  }
  return { daysRemaining: days, label: `${days} ${days === 1 ? "day" : "days"} left` };
}

/**
 * Formats a time string or Date object into 12-hour AM/PM format.
 */
export function formatTime12h(timeInput?: string | Date | null): string {
  if (!timeInput) return "5:00 PM";
  if (typeof timeInput === "string" && (timeInput.includes("AM") || timeInput.includes("PM"))) {
    return timeInput;
  }

  const d = typeof timeInput === "string" ? new Date(`1970-01-01T${timeInput}`) : timeInput;
  if (isNaN(d.getTime())) {
    return typeof timeInput === "string" ? timeInput : "5:00 PM";
  }

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
