export function formatDate(input: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options
  }).format(new Date(input));
}

export function formatShortDate(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(input));
}

export function articleIntro(content: string) {
  return content.slice(0, 150);
}

export function getYearMonth(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(new Date(input));
}

export function dateKey(input: string) {
  return new Date(input).toISOString().slice(0, 10);
}

export function sameYear(input: string, year: number) {
  return new Date(input).getFullYear() === year;
}

export function sameMonth(input: string, yearMonth: string) {
  return new Date(input).toISOString().slice(0, 7) === yearMonth;
}

export function daysPassedInYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000) + 1;
}
