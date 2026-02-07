import * as React from "react";

export type LoaderProps = {
  label?: string;
  size?: number; // px
  className?: string;
};

export function Loader({ label = "Loading…", size = 20, className }: LoaderProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span
        aria-hidden
        className="inline-block animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-200"
        style={{ width: size, height: size }}
      />
      <span className="text-sm text-zinc-400">{label}</span>
    </span>
  );
}
