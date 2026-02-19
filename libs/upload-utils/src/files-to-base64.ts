/**
 * Convert File objects to base64 data URLs for OpenAI vision API.
 * Each URL is of the form: data:image/png;base64,{base64}
 */
export async function filesToBase64DataUrls(files: File[]): Promise<string[]> {
  const results: string[] = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    results.push(dataUrl);
  }
  return results;
}
