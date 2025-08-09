export function epochToCustomLocalTime(epoch: number): string {
  const date = new Date(epoch * 1000);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return date.toLocaleString(undefined, options);
}

export function epochToCustomLocalStringTime(epoch: number): string {
  const date = new Date(epoch * 1000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" }); // e.g., Aug
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // convert 0 to 12 for 12-hour format

  return `${day} ${month} ${year}, ${String(hours).padStart(
    2,
    "0"
  )}:${minutes}:${seconds} ${ampm}`;
}
