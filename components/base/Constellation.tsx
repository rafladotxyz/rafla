"use client";
import Texture from "@/assets/texture.svg";
import Image from "next/image";
//import { usePathname } from "next/navigation";
import React from "react";

interface ConstellationProps {
  className?: string;
}

const Constellation: React.FC<ConstellationProps> = ({ className }) => {
  return (
    <div
      className={`${className} absolute -z-10 pointer-events-none`}
      aria-hidden
    >
      <Image
        src={Texture}
        width={1940}
        height={3907}
        alt=""
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
};

export default Constellation;
