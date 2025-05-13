import { useCallback } from "react";
import axios from "@/services/axiosInstance";
export function useTemplates(bodaId?: string) {
  const fetchAll = useCallback(async () => {
    const { data } = await axios.get(`/templates`, { params: { bodaId } });
    return data;
  }, [bodaId]);
  const save = useCallback(async (template: any) => {
    if (!template._id) {
      const { data } = await axios.post(`/templates`, template);
      return data;
    }
    const { data } = await axios.patch(`/templates/${template._id}`, template);
    return data;
  }, []);
  return { fetchAll, save };
}
