"use client";
import Texture from "@/assets/group.svg";
import Image from "next/image";
//import { usePathname } from "next/navigation";
import React from "react";

interface ConstellationProps {
  className?: string;
}

const Group: React.FC<ConstellationProps> = ({ className }) => {
  return (
    <div
      className={`${className} absolute -z-10 pointer-events-none`}
      aria-hidden
    >
      <Image
        src={Texture}
        width={421.79}
        height={201.65}
        alt=""
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
};

export default Group;
