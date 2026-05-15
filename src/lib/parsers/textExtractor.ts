import { parsePdf } from "./pdfParser";
import { parseDocx } from "./docxParser";

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return parsePdf(file);
  if (name.endsWith(".docx")) return parseDocx(file);
  if (name.endsWith(".txt") || file.type.startsWith("text/")) return file.text();
  // fallback
  return file.text();
}
