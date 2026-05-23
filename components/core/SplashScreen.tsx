
"use client";

import Logo from "@/assets/Logo.svg";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-background transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="relative animate-fade-up">
        <Image
          src={Logo}
          alt="Rafla logo"
          width={180}
          height={180}
          className="animate-float"
          priority
        />
        <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full origin-left bg-white animate-progress" />
          </div>
        </div>
      </div>
    </div>
  );
}
