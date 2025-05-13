export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        className
      )}
    />
  );
}
export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("border-b border-gray-100 px-4 py-3 font-medium", className)}
    />
  );
}
export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("p-4", className)} />;
}
