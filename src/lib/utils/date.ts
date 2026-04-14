export function formatMonthYear(date: string) {
  const d = new Date(date);

  return d.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}
