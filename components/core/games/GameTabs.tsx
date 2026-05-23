"use client";

type TabType = "public" | "private";

interface GameTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function GameTabs({ activeTab, onTabChange }: GameTabsProps) {
  return (
    <div className="mx-auto mb-8 flex w-full max-w-[420px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-1.5 shadow-lg shadow-black/20 backdrop-blur-xl">
      <button
        onClick={() => onTabChange("public")}
        className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
          activeTab === "public"
            ? "bg-white text-black shadow-sm"
            : "text-[#9A9A9A] hover:text-white"
        }`}
      >
        Public
      </button>

      <button
        onClick={() => onTabChange("private")}
        className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
          activeTab === "private"
            ? "bg-white text-black shadow-sm"
            : "text-[#9A9A9A] hover:text-white"
        }`}
      >
        Private
      </button>
    </div>
  );
}
