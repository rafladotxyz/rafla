import { useToastStore } from "@/store/useToastStore";

export const useToast = () => {
  const { showToast, success, error } = useToastStore();
  return { showToast, success, error };
};
