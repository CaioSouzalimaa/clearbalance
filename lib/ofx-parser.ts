/**
 * Minimal OFX/QFX parser.
 * Handles both legacy SGML format and modern XML-wrapped OFX.
 */

export interface OFXTransaction {
  type: "INCOME" | "EXPENSE";
  date: string; // ISO "YYYY-MM-DD"
  amount: number; // positive value
  description: string;
}

/**
 * Parse the raw text content of an OFX/QFX file.
 * Returns an array of transactions, or throws on a completely unrecognised format.
 */
export function parseOFX(content: string): OFXTransaction[] {
  const results: OFXTransaction[] = [];

  // Extract all <STMTTRN>…</STMTTRN> blocks (case-insensitive)
  const blockPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(content)) !== null) {
    const block = match[1];

    const dtposted = extractTag(block, "DTPOSTED") ?? "";
    const trnamt = extractTag(block, "TRNAMT") ?? "0";
    const name = extractTag(block, "NAME") ?? extractTag(block, "MEMO") ?? "";

    const amount = parseFloat(trnamt.replace(",", "."));
    if (isNaN(amount)) continue;

    const date = parseOFXDate(dtposted);
    if (!date) continue;

    const type: OFXTransaction["type"] = amount >= 0 ? "INCOME" : "EXPENSE";
    const description = sanitizeDescription(name);

    results.push({ type, date, amount: Math.abs(amount), description });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Extract the value of a tag like <TAGNAME>value or <TAGNAME>value</TAGNAME> */
function extractTag(block: string, tag: string): string | null {
  // XML style: <TAG>value</TAG>
  const xmlMatch = new RegExp(
    `<${tag}\\s*>([^<]*)<\\/${tag}>`,
    "i",
  ).exec(block);
  if (xmlMatch) return xmlMatch[1].trim();

  // SGML style: <TAG>value\n
  const sgmlMatch = new RegExp(`<${tag}\\s*>([^\r\n<]*)`, "i").exec(block);
  if (sgmlMatch) return sgmlMatch[1].trim();

  return null;
}

/**
 * Parse OFX date formats:
 * - 20250315 (YYYYMMDD)
 * - 20250315120000 (YYYYMMDDHHmmss)
 * - 20250315120000.000[-3:BRT] (with timezone suffix)
 */
function parseOFXDate(raw: string): string | null {
  // Strip anything after period or bracket (timezone info)
  const clean = raw.replace(/[.\[].*/g, "").trim();
  if (clean.length < 8) return null;

  const year = clean.substring(0, 4);
  const month = clean.substring(4, 6);
  const day = clean.substring(6, 8);

  const y = parseInt(year, 10);
  const mo = parseInt(month, 10);
  const d = parseInt(day, 10);

  if (isNaN(y) || isNaN(mo) || isNaN(d)) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;

  return `${year}-${month}-${day}`;
}

/** Remove leading/trailing whitespace and collapse inner whitespace */
function sanitizeDescription(raw: string): string {
  return raw.replace(/\s+/g, " ").trim() || "Importado via OFX";
}
