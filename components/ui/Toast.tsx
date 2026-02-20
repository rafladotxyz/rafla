import { CheckCircleIcon, XCircleIcon } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const Toast = ({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) => {
  const isSuccess = toast.type === "success";
  return (
    <div
      onClick={onDismiss.bind(null, toast.id)}
      className={`inline-flex items-center h-8 rounded-lg py-1.5 px-3 gap-1.5 cursor-pointer select-none transition-opacity ml-auto mr-auto active:opacity-70 ${
        isSuccess ? "bg-[#EFFAF6]" : "bg-[#FEF2F2]"
      }`}
    >
      {isSuccess ? (
        <CheckCircleIcon size={16} color="#34D399" strokeWidth={2.5} />
      ) : (
        <XCircleIcon size={16} color="#F87171" strokeWidth={2.5} />
      )}
      <p
        className={`text-[12px] font-medium leading-none ${
          isSuccess ? "text-[#065F46]" : "text-[#991B1B]"
        }`}
      >
        {toast.message}
      </p>
    </div>
  );
};
