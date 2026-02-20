// ─── Toast Container — drop this once anywhere in your layout ────────────────

import { useToastStore } from "@/store/useToastStore";
import { Toast } from "./Toast";

export const ToastContainer = () => {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
};
