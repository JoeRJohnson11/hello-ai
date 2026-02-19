'use client';

import * as React from 'react';
import { Button } from '@hello-ai/shared-ui';
import { tokens } from '@hello-ai/shared-design';

const HEIC_TYPES = new Set(['image/heic', 'image/heif']);
const HEIC_EXT = /\.heic$/i;
const HEIF_EXT = /\.heif$/i;

function isHeicFile(file: File): boolean {
  if (HEIC_TYPES.has(file.type)) return true;
  // iOS Safari often reports empty type for HEIC - check extension
  if (!file.type && (HEIC_EXT.test(file.name) || HEIF_EXT.test(file.name)))
    return true;
  return false;
}

/** Resize image blob to fit within maxBytes by downscaling and re-encoding. */
async function resizeImageToFit(
  blob: Blob,
  maxBytes: number,
  fileName: string
): Promise<File> {
  const img = await createImageBitmap(blob);
  let { width, height } = img;
  let quality = 0.85;
  let out: Blob;

  do {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2d context unavailable');
    ctx.drawImage(img, 0, 0);
    out = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
        'image/jpeg',
        quality
      );
    });
    if (out.size <= maxBytes) break;
    // Reduce dimensions by 20% or quality
    if (quality > 0.5) {
      quality -= 0.1;
    } else {
      width = Math.floor(width * 0.8);
      height = Math.floor(height * 0.8);
      quality = 0.85;
    }
  } while (width > 100 && height > 100);

  img.close();
  const baseName = fileName.replace(/\.[^.]+$/i, '');
  return new File([out], `${baseName}.jpg`, { type: 'image/jpeg' });
}

export type ImageAttachmentPickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  maxCount?: number;
  maxBytesPerFile?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  /** Validation error message to display */
  error?: string | null;
};

const DEFAULT_MAX_COUNT = 4;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5MB (OpenAI allows 20MB; most iPhone HEIC fit)
const DEFAULT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function ImageAttachmentPicker({
  files,
  onChange,
  maxCount = DEFAULT_MAX_COUNT,
  maxBytesPerFile = DEFAULT_MAX_BYTES,
  allowedTypes = DEFAULT_TYPES,
  disabled = false,
  error,
}: ImageAttachmentPickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      e.target.value = '';
      if (selected.length === 0) return;

      const combined = [...files, ...selected].slice(0, maxCount);
      const valid: File[] = [];

      const HEIC_MAX_BYTES = 20 * 1024 * 1024; // Allow large HEIC (conversion + resize)
      for (const f of combined) {
        if (isHeicFile(f)) {
          if (f.size > HEIC_MAX_BYTES) continue; // Too large even for conversion
          try {
            const { default: heic2any } = await import('heic2any');
            const converted = await heic2any({
              blob: f,
              toType: 'image/jpeg',
              quality: 0.9,
            });
            const blob = Array.isArray(converted) ? converted[0] : converted;
            let jpegFile = new File(
              [blob],
              f.name.replace(/\.[^.]+$/i, '.jpg'),
              { type: 'image/jpeg' }
            );
            if (jpegFile.size > maxBytesPerFile) {
              jpegFile = await resizeImageToFit(
                blob,
                maxBytesPerFile,
                jpegFile.name
              );
            }
            if (jpegFile.size <= maxBytesPerFile) valid.push(jpegFile);
          } catch {
            // Skip HEIC files that fail to convert
          }
        } else {
          if (f.size > maxBytesPerFile) continue;
          if (allowedTypes.includes(f.type)) valid.push(f);
        }
      }
      onChange(valid);
    },
    [files, maxCount, maxBytesPerFile, allowedTypes, onChange],
  );

  const remove = React.useCallback(
    (index: number) => {
      onChange(files.filter((_, i) => i !== index));
    },
    [files, onChange],
  );

  // Use image/* so iOS shows full photo library including HEIC (type often empty on iOS)
  const accept = 'image/*';
  const inputId = React.useId();
  const isDisabled = disabled || files.length >= maxCount;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap justify-start">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple
          onChange={handleSelect}
          disabled={isDisabled}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
          aria-label="Attach images"
          tabIndex={-1}
        />
        <label
          htmlFor={inputId}
          className={cx(
            'inline-flex items-center justify-center rounded-xl border font-medium shadow transition-all duration-150 cursor-pointer select-none',
            'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 active:scale-[0.98]',
            'px-3 py-1.5 text-xs',
            isDisabled && 'pointer-events-none opacity-40 cursor-not-allowed'
          )}
          title={
            files.length >= maxCount
              ? `Maximum ${maxCount} images`
              : 'Attach images'
          }
        >
          + Attach photo
        </label>
        {files.map((file, i) => (
          <div
            key={`${file.name}-${i}`}
            className="relative group flex-shrink-0"
          >
            <div
              className={cx(
                'w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900',
                'flex items-center justify-center',
              )}
              style={{ borderRadius: tokens.radius.sm }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
                onLoad={(e) =>
                  URL.revokeObjectURL((e.target as HTMLImageElement).src)
                }
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 min-w-0 p-0 rounded-full text-xs"
              onClick={() => remove(i)}
              disabled={disabled}
              aria-label={`Remove ${file.name}`}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
