import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center select-none whitespace-nowrap rounded-xl font-medium shadow disabled:opacity-40 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  } as const;

  const variants = {
    primary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors",
    secondary:
      "border border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition-colors",
  } as const;

  return (
    <button
      type={props.type ?? "button"}
      className={cx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
