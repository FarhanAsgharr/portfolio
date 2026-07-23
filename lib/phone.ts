/**
 * Phone-number handling.
 *
 * Deliberately lenient on input and strict on comparison: people type numbers
 * with spaces, dashes and brackets, but two numbers are "the same" only if
 * their digits match. Normalising to digits-plus-leading-plus lets the reset
 * flow accept "+92 331 398 8471", "0331 3988471" and "+923313988471" as the
 * same registered number without a full libphonenumber dependency.
 */

/** Strip everything except digits, keeping a single leading "+". */
export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/** A plausible phone number: 7–15 digits, optional leading plus (E.164 range). */
export function isValidPhone(input: string): boolean {
  const normalized = normalizePhone(input);
  return /^\+?\d{7,15}$/.test(normalized);
}

/**
 * Whether two numbers refer to the same phone.
 *
 * Compares the last 9 digits, which sidesteps the "+92 vs 0" national-prefix
 * mismatch that would otherwise make a correct number look wrong. Nine digits
 * is enough to be unambiguous for a single known owner.
 */
export function phonesMatch(a: string, b: string): boolean {
  const da = normalizePhone(a).replace(/\D/g, "");
  const db = normalizePhone(b).replace(/\D/g, "");
  if (da.length < 7 || db.length < 7) return false;
  const tail = (s: string) => s.slice(-9);
  return tail(da) === tail(db);
}

/** Mask for display: "+92 331 •••• 471". Never reveals the full number. */
export function maskPhone(input: string): string {
  const digits = normalizePhone(input).replace(/\D/g, "");
  if (digits.length < 4) return "•••";
  const start = digits.slice(0, Math.min(4, digits.length - 3));
  const end = digits.slice(-3);
  return `${input.trim().startsWith("+") || normalizePhone(input).startsWith("+") ? "+" : ""}${start}•••••${end}`;
}
