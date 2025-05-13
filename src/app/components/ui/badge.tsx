function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}
export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700",
        className
      )}
    />
  );
}
