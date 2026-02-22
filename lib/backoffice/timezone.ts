const TZ = "Asia/Kuching";

export function formatInBackofficeTz(date: Date): string {
  return new Date(date).toLocaleString("en-MY", { timeZone: TZ });
}

export function formatDateOnlyInBackofficeTz(date: Date): string {
  return new Date(date).toLocaleDateString("en-MY", { timeZone: TZ });
}
