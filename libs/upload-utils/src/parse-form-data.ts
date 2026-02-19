/**
 * Parse a request body as either JSON (message only) or multipart/form-data (message + files).
 * Used by chat API to support both text-only and image-attached messages.
 */
const CONTENT_TYPE_JSON = 'application/json';

export type ParsedChatFormData =
  | { format: 'json'; message: string; files: File[] }
  | { format: 'multipart'; message: string; files: File[] };

export async function parseChatFormData(req: Request): Promise<ParsedChatFormData> {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes(CONTENT_TYPE_JSON)) {
    const body = (await req.json()) as { message?: string };
    const message = (body.message ?? '').trim();
    return { format: 'json', message, files: [] };
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const raw = formData.get('message');
    const message = (typeof raw === 'string' ? raw : '').trim();
    const files: File[] = [];
    const entries = formData.getAll('files');
    for (const entry of entries) {
      if (entry instanceof File) {
        files.push(entry);
      }
    }
    return { format: 'multipart', message, files };
  }

  return { format: 'json', message: '', files: [] };
}
