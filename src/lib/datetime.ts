export function toLocalInputValue(date: Date | string | null | undefined) {
  if (!date) return '';
  const d = new Date(date);
  // Ajuste: quitamos el offset para que toISOString dé hora local
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}
