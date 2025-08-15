export function slugify(input: string): string {
  return (input ?? '')
    .normalize('NFKD')               // quita acentos
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')     // todo lo no alfanumérico -> '-'
    .replace(/^-+|-+$/g, '')         // bordes
    .replace(/-{2,}/g, '-');         // múltiples guiones
}
