"use client";

interface AddEntryButtonProps {
  amount: number;
  loading?: boolean;
  onClick: () => void;
}

export function AddEntryButton({
  amount,
  loading = false,
  onClick,
}: AddEntryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-4 px-6 rounded-xl bg-white text-black font-semibold text-base border border-[#1A1A1A] hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        `Add Entry ${amount} USDC`
      )}
    </button>
  );
}
