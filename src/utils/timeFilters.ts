// Utility to compute epoch (seconds) date ranges for common time filter labels
// All calculations use the local timezone and return seconds since epoch

export type TimeFilterLabel =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last 30 Days"
  | "This Week"
  | "Last Week"
  | "This Month"
  | "Last Month";

export interface EpochRange {
  from_date: number; // epoch seconds
  to_date: number;   // epoch seconds
}

export const timeFilterLabels: TimeFilterLabel[] = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
];

// Helpers
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
const toEpoch = (d: Date) => Math.floor(d.getTime() / 1000);

const startOfWeek = (d: Date) => {
  // Monday as the first day of week
  const date = new Date(d);
  const day = date.getDay(); // 0 (Sun) .. 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  date.setDate(date.getDate() + diff);
  return startOfDay(date);
};

const endOfWeek = (d: Date) => {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return endOfDay(end);
};

export function epochRangeForLabel(label: string): EpochRange {
  const now = new Date();

  switch (label) {
    case "Today": {
      return { from_date: toEpoch(startOfDay(now)), to_date: toEpoch(endOfDay(now)) };
    }
    case "Yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { from_date: toEpoch(startOfDay(y)), to_date: toEpoch(endOfDay(y)) };
    }
    case "Last 7 Days": {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      return { from_date: toEpoch(startOfDay(from)), to_date: toEpoch(endOfDay(now)) };
    }
    case "Last 30 Days": {
      const from = new Date(now);
      from.setDate(now.getDate() - 29);
      return { from_date: toEpoch(startOfDay(from)), to_date: toEpoch(endOfDay(now)) };
    }
    case "This Week": {
      return { from_date: toEpoch(startOfWeek(now)), to_date: toEpoch(endOfDay(now)) };
    }
    case "Last Week": {
      const lastWeekRef = new Date(now);
      lastWeekRef.setDate(now.getDate() - 7);
      return { from_date: toEpoch(startOfWeek(lastWeekRef)), to_date: toEpoch(endOfWeek(lastWeekRef)) };
    }
    case "This Month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return { from_date: toEpoch(start), to_date: toEpoch(endOfDay(now)) };
    }
    case "Last Month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59); // last day of prev month
      return { from_date: toEpoch(start), to_date: toEpoch(end) };
    }
    default: {
      // Fallback to Today if unknown label passed
      return { from_date: toEpoch(startOfDay(now)), to_date: toEpoch(endOfDay(now)) };
    }
  }
}