/**
 * Validate image attachments for chat uploads.
 * Enforces count, size, and MIME type limits.
 */

const DEFAULT_MAX_COUNT = 4;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class ImageValidationError extends Error {
  constructor(
    message: string,
    public readonly code: 'TOO_MANY' | 'TOO_LARGE' | 'INVALID_TYPE'
  ) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

export type ValidateImageOptions = {
  maxCount?: number;
  maxBytesPerFile?: number;
  allowedTypes?: string[];
};

export function validateImageFiles(
  files: File[],
  opts: ValidateImageOptions = {}
): void {
  const maxCount = opts.maxCount ?? DEFAULT_MAX_COUNT;
  const maxBytes = opts.maxBytesPerFile ?? DEFAULT_MAX_BYTES;
  const allowed = new Set(opts.allowedTypes ?? DEFAULT_ALLOWED_TYPES);

  if (files.length > maxCount) {
    throw new ImageValidationError(
      `Maximum ${maxCount} images allowed. You attached ${files.length}.`,
      'TOO_MANY'
    );
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > maxBytes) {
      const mb = (maxBytes / (1024 * 1024)).toFixed(1);
      throw new ImageValidationError(
        `Image "${file.name}" is too large. Maximum ${mb}MB per file.`,
        'TOO_LARGE'
      );
    }
    if (!allowed.has(file.type)) {
      throw new ImageValidationError(
        `Image "${file.name}" has unsupported type "${file.type}". Allowed: jpeg, png, webp.`,
        'INVALID_TYPE'
      );
    }
  }
}
