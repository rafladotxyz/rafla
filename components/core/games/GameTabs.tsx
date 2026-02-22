"use client";

import { useState } from "react";

type TabType = "public" | "private";

export function GameTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("public");

  return (
    <div className="flex items-center justify-center gap-8 mb-8">
      <button
        onClick={() => setActiveTab("public")}
        className={`relative pb-2 text-base font-medium transition-colors ${
          activeTab === "public"
            ? "text-[#E8E8E8]"
            : "text-[#6B6B6B] hover:text-[#A3A3A3]"
        }`}
      >
        Public
        {activeTab === "public" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8E8E8] rounded-full" />
        )}
      </button>

      <button
        onClick={() => setActiveTab("private")}
        className={`relative pb-2 text-base font-medium transition-colors ${
          activeTab === "private"
            ? "text-[#E8E8E8]"
            : "text-[#6B6B6B] hover:text-[#A3A3A3]"
        }`}
      >
        Private
        {activeTab === "private" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8E8E8] rounded-full" />
        )}
      </button>
    </div>
  );
}
