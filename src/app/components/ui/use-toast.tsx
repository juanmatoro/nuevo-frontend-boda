import { useCallback } from "react";
export function useToast() {
  const toast = useCallback(
    ({
      title,
      description,
    }: {
      title: string;
      description?: string;
      variant?: string;
    }) => {
      window.alert(`${title}\n${description || ""}`);
    },
    []
  );
  return { toast };
}
