export type TodoCheckIconProps = {
  className?: string;
  /** Size in logical pixels (controls both width and height). Default: 24 */
  size?: number;
  'aria-hidden'?: boolean;
};

/**
 * Checkmark icon used for todo/task branding.
 * Matches the icon used on the landing page Todo App card.
 */
export function TodoCheckIcon({
  className,
  size = 24,
  'aria-hidden': ariaHidden = true,
}: TodoCheckIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
