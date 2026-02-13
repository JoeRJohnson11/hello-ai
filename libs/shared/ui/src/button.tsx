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
    "inline-flex items-center justify-center select-none whitespace-nowrap rounded-xl font-medium shadow cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  } as const;

  const variants = {
    primary:
      "bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-md hover:shadow-zinc-900/10 active:scale-[0.98] disabled:hover:bg-zinc-100 disabled:hover:shadow disabled:hover:shadow-none transition-all duration-150",
    secondary:
      "border border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 active:scale-[0.98] disabled:hover:border-zinc-800 disabled:hover:bg-zinc-950 disabled:hover:text-zinc-300 transition-all duration-150",
  } as const;

  return (
    <button
      type={props.type ?? "button"}
      className={cx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
