import { BadgeAlertIcon, BadgeCheckIcon } from "lucide-react";

export const Toast = ({
  isSuccess,
  message,
}: {
  isSuccess: boolean;
  message: string;
}) => {
  return (
    <div className="flex min-w-25 h-8.25 rounded-lg py-2 px-3 gap-1 bg-[#EFFAF6]">
      {isSuccess ? (
        <BadgeCheckIcon color="#002B0D" size={16} />
      ) : (
        <BadgeAlertIcon size={16} color="red" />
      )}
      <p className="text-[12px] text-[#000000] ">{message}</p>
    </div>
  );
};
