/** Last 10 digits, digits only — matches employee sign-in and DB storage. */
export function normalizePhoneDigits(input: string): string {
  return String(input).replace(/\D/g, "").slice(-10);
}
