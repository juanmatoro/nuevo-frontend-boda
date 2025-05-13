import { cn } from "@/utils/cn";
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300",
        className
      )}
    />
  );
}
