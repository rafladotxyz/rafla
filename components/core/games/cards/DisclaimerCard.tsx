import Image from "next/image";
import { useState } from "react";
import AlertIcon from "@/assets/alertIcon.svg";

export const Disclaimer = ({ toggle }: { toggle?: () => void }) => {
  return (
    <div className="fixed inset-0 z-999 backdrop-blur-sm flex items-center justify-center">
      <DisclaimerCard toggle={toggle} />
    </div>
  );
};

const DISCLAIMER_POINTS = [
  "This is a chance based game. You may lose your entry.",
  "All outcomes are probably fair and random.",
  "Only play with funds you can afford to lose.",
  "Rafla is for entertainment. Play responsibly.",
];

const DisclaimerCard = ({ toggle }: { toggle?: () => void }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="relative flex flex-col items-center w-[340px] rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] py-6 px-4 gap-6">
      {/* Alert Icon + Title */}
      <div className="flex flex-col items-center gap-3">
        <Image src={AlertIcon} height={48} width={48} alt="Alert icon" />
        <p className="text-[#D9D9D9] text-xl font-semibold text-center">
          Before you Play
        </p>
      </div>

      {/* Bullet points */}
      <ul className="w-full flex flex-col gap-3 pl-1">
        {DISCLAIMER_POINTS.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-[#CBCBCB] text-[14px] leading-none mt-[3px]">
              •
            </span>
            <p className="text-[14px] text-[#CBCBCB] leading-snug">{point}</p>
          </li>
        ))}
      </ul>

      {/* Checkbox + confirmation text */}
      <div className="flex items-start gap-2 w-full">
        <button
          role="checkbox"
          aria-checked={checked}
          onClick={() => setChecked((prev) => !prev)}
          className={`mt-0.5 shrink-0 w-5 h-5 rounded border transition-colors ${
            checked
              ? "bg-white border-white"
              : "bg-transparent border-[#444444]"
          }`}
        >
          {checked && (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="w-full h-full p-0.5"
            >
              <path
                d="M3 8l4 4 6-7"
                stroke="#0A0A0A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <p className="text-[#737373] text-[13px] leading-snug">
          By continuing, you confirm you are 18+ and understand the risks
          involved in chance-based games.
        </p>
      </div>

      {/* CTA button */}
      <button
        onClick={toggle}
        disabled={!checked}
        className="w-full h-11 rounded-xl bg-white flex items-center justify-center transition-opacity disabled:opacity-40"
      >
        <p className="text-[14px] font-medium text-[#0A0A0A]">{`Let's Play`}</p>
      </button>
    </div>
  );
};
