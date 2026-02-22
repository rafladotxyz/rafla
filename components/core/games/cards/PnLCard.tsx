"use client";
import PnlGroup from "@/components/base/PnlGroup";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

// Install deps if not already:
// npm install qrcode.react html2canvas

interface PnLProps {
  isWin?: boolean;
  amount?: string;
  handleClick?: () => void;
  shareUrl?: string; // URL to encode in QR — defaults to RAFLA.XYZ
}

export const PnL = ({
  isWin = true,
  amount = "$109.25",
  handleClick,
  shareUrl = "https://rafla.xyz",
}: PnLProps) => {
  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center">
      <PnLCard
        isWin={isWin}
        amount={amount}
        handleClick={handleClick}
        shareUrl={shareUrl}
      />
    </div>
  );
};

const PnLCard = ({
  isWin = true,
  amount = "$109.25",
  handleClick,
  shareUrl = "https://rafla.xyz",
}: PnLProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // ─── Download as image ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!cardRef.current) return;

    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(cardRef.current, {
      background: "#0A0A0A",
      useCORS: true,
      allowTaint: true,
    });

    const link = document.createElement("a");
    link.download = `rafla-pnl-${isWin ? "win" : "loss"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ─── Share on Twitter ───────────────────────────────────────────────────────
  const handleTwitterShare = async () => {
    if (!cardRef.current) return;

    const tweetText = isWin
      ? `🏆 Hey, I just won ${amount} on @RaflaXYZ! Chance made social. Try your luck 👇`
      : `😤 I lost ${amount} on @RaflaXYZ today... but I'm not done! Chance made social 👇`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;

    // Generate and upload image, then open Twitter
    // For now opens tweet with text — to attach image you'd need an upload endpoint
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col w-[714px] rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Capturable card area ── */}
      <div
        ref={cardRef}
        className="relative flex flex-col w-full bg-[#0A0A0A] overflow-hidden"
      >
        {/* Background texture */}
        <PnlGroup className="absolute inset-0 w-full h-full" />

        {/* Main content */}
        <div className="relative z-10 flex flex-col px-14 pt-16 pb-10 gap-8">
          {/* Win/Loss text + amount */}
          <div className="flex flex-col gap-1">
            <p className="text-[24px] text-[#737373]">
              You {isWin ? "won" : "lost"}
            </p>
            <p
              className="text-[64px] font-bold leading-none"
              style={{ color: isWin ? "#229EFF" : "#DF1C41" }}
            >
              {isWin ? "+" : "-"}
              {amount}
            </p>
          </div>

          {/* Tagline */}
          <div className="flex flex-col gap-0.5">
            <p className="text-[14px] text-[#636363]">Chance made social</p>
            <p className="text-[14px] font-semibold text-[#636363]">
              RAFLA.XYZ
            </p>
          </div>

          {/* Bottom row: QR left, Logo right */}
          <div className="flex items-end justify-between mt-4">
            {/* ✅ Real QR code */}
            <div className="rounded-lg overflow-hidden border border-[#2a2a2a] bg-white p-2">
              <QRCodeSVG
                value={shareUrl}
                size={88}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>

            <div className="flex flex-col items-center gap-1">
              <Image src={Logo} height={43.88} width={96} alt="logo" />
              <p className="text-white text-[16px] font-semibold tracking-wide">
                Draw
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action buttons strip (outside capturable area) ── */}
      <div className="w-full bg-[#0f0f0f] border-t border-[#1f1f1f] px-6 py-3 flex items-center gap-3">
        {/* Download button */}
        <button
          onClick={handleDownload}
          className="flex-1 h-12 flex items-center justify-center gap-2 text-white text-[14px] font-medium rounded-xl hover:bg-white/5 transition-colors border border-[#282828]"
        >
          Download PnL Card
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        {/* Twitter / X share button */}
        <button
          onClick={handleTwitterShare}
          className="h-12 w-12 flex items-center justify-center rounded-xl bg-black border border-[#282828] hover:bg-[#1a1a1a] transition-colors flex-shrink-0"
          title="Share on X (Twitter)"
        >
          {/* X logo */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
        </button>

        {/* Close / done button */}
        {handleClick && (
          <button
            onClick={handleClick}
            className="h-12 w-12 flex items-center justify-center rounded-xl border border-[#282828] hover:bg-white/5 transition-colors flex-shrink-0"
            title="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#737373"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
