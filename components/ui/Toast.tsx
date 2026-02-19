import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export const Toast = ({
  isSuccess,
  message,
  handleClick,
}: {
  isSuccess: boolean;
  message: string;
  handleClick?: () => void;
}) => {
  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center h-8 rounded-lg py-1.5 px-3 gap-1.5 cursor-pointer select-none transition-opacity active:opacity-70 ${
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
        {message}
      </p>
    </div>
  );
};
