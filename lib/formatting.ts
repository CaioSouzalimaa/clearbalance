/**
 * Formats a numeric value as BRL currency.
 * Use when you already have a number (e.g. from the DB or calculation).
 * @example formatBRLFromNumber(1234.5) → "R$ 1.234,50"
 */
export function formatBRLFromNumber(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Formats a raw input string (digits only, last 2 are decimals) as BRL currency.
 * Use for currency input fields where the user types digits and the last 2 digits are cents.
 * @example formatBRLInputFromString("123450") → "R$ 1.234,50"
 */
export function formatBRLInputFromString(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return (Number(digits) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Formats a raw input string (digits only, last 2 are decimals) as a decimal number (no currency symbol).
 * Use for numeric fields like budget inputs.
 * @example formatDecimalInputFromString("123450") → "1.234,50"
 */
export function formatDecimalInputFromString(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return (Number(digits) / 100).toLocaleString("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parses a formatted BRL or decimal string back to a number.
 * Works by stripping all non-digit characters and dividing by 100.
 * @example parseBRLInput("R$ 1.234,50") → 1234.5
 */
export function parseBRLInput(value: string): number {
  return Number(value.replace(/\D/g, "")) / 100;
}
