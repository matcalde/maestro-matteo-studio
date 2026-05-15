import mammoth from "mammoth";

export async function parseDocx(file: File): Promise<string> {
  const ab = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: ab });
  return result.value || "";
}
