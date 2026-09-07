const CLASS_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates a 6-character class code.
 * Excludes ambiguous characters: O, 0, I, 1.
 */
export function generateClassCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += CLASS_CODE_ALPHABET[bytes[i]! % CLASS_CODE_ALPHABET.length];
  }
  return code;
}
