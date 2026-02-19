"use client";
import Texture from "@/assets/pnlgroup.svg";
import Image from "next/image";
//import { usePathname } from "next/navigation";
import React from "react";

interface ConstellationProps {
  className?: string;
}

const PnlGroup: React.FC<ConstellationProps> = ({ className }) => {
  return (
    <div className={`${className} absolute pointer-events-none`} aria-hidden>
      <Image
        src={Texture}
        width={741.3}
        height={513.53}
        alt=""
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
};

export default PnlGroup;
