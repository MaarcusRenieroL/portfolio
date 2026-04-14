export function formatMonthYear(date: string) {
  const d = new Date(date);

  return d.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function getSafeTime(date: string | null) {
  if (!date) return 0;

  const time = new Date(date).getTime();
  return isNaN(time) ? 0 : time;
}
