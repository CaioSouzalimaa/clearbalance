export const PT_MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const PT_MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/**
 * Formats an ISO date string (YYYY-MM-DD) to a human-readable pt-BR date.
 * @example fmtDateShort("2025-03-05") → "05 Mar 2025"
 */
export function fmtDateShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d} ${PT_MONTHS_SHORT[parseInt(m, 10) - 1]} ${y}`;
}

/**
 * Parses a human-readable pt-BR date string (e.g. "05 Mar 2025") back to ISO format (YYYY-MM-DD).
 * @example parseShortDateToIso("05 Mar 2025") → "2025-03-05"
 */
export function parseShortDateToIso(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split(" ");
  if (parts.length !== 3) return "";
  const day = parts[0].padStart(2, "0");
  const monthIndex = PT_MONTHS_SHORT.indexOf(parts[1]);
  const year = parts[2];
  if (monthIndex === -1) return "";
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day}`;
}
