const shortMonths = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const longMonths = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export function formatMonthYear(date: string) {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  return `${shortMonths[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatShortDate(date: string) {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  return `${shortMonths[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatLongDate(date: string) {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  return `${longMonths[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function getSafeTime(date: string | null) {
  if (!date) return 0;

  const time = new Date(date).getTime();
  return isNaN(time) ? 0 : time;
}
