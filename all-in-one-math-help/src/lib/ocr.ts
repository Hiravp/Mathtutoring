import puter from "@heyputer/puter.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * OCR via Puter.js `puter.ai.img2txt` (client-side; user may be prompted to sign in).
 * Docs: https://docs.puter.com/AI/img2txt/
 */
export async function extractTextFromImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 5MB or smaller.");
  }

  const text = await puter.ai.img2txt(file);

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("No text could be read from that image.");
  }

  return text.trim();
}

export const OCR_DEMO_NOTICE =
  "Image text is extracted with Puter.js OCR. You may be asked to sign in to Puter to use credits.";
