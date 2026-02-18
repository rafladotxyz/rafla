"use client";

import Image from "next/image";
import Draw from "@/assets/usdc.svg";
import Spin from "@/assets/roulete.svg";
import Head from "@/assets/head.svg";
import { ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Game {
  name: string;
  imageUrl: string;
  url: string;
  about: string;
}

export const ExploreGames = () => {
  const games: Game[] = [
    {
      name: "Rafla Spin",
      imageUrl: Spin,
      url: "/spin",
      about: "All eyes on the wheel, one big spin, one lucky winner.",
    },
    {
      name: "Rafla Flip",
      imageUrl: Head,
      url: "/flip",
      about: "Heads or tails? Pick a side, one moment, one answer, one winner.",
    },
    {
      name: "Rafla Draw",
      imageUrl: Draw,
      url: "/draw",
      about:
        "Seconds away from a life-changing moment. Take your spot before the timer hits zero.",
    },
  ];

  const router = useRouter();

  const handleRoute = (route: string) => {
    console.log("Routing to :", route);
    router.push(route);
  };

  return (
    <div className="w-full max-w-244 mx-auto mt-20 flex flex-col px-4">
      <div className="w-full mb-6">
        <h2 className="text-[18px] font-normal text-[#D9D9D9]">
          Explore Games
        </h2>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, idx) => (
          <ExploreCard
            key={idx}
            name={game.name}
            about={game.about}
            imageUrl={game.imageUrl}
            url={game.url}
            routeHandler={handleRoute}
          />
        ))}
      </div>
    </div>
  );
};

const ExploreCard = ({
  name,
  url,
  imageUrl,
  about,
  routeHandler,
}: {
  name: string;
  url: string;
  imageUrl: string;
  about: string;
  routeHandler: (route: string) => void;
}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className="group relative w-full flex flex-col border border-[#141414] backdrop-blur-xs rounded-xl p-4 cursor-pointer overflow-hidden transition-all duration-500 hover:border-[#2A2A2A] hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-1"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onClick={() => routeHandler(url)}
    >
      {/* Animated Border Shimmer */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer-slow" />
      </div>

      {/* Main Shimmer Effect */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Secondary Shimmer (Delayed) */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 delay-150 ${isActive ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 delay-200 bg-linear-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Radial Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      {/* Image Container */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-4 flex items-center justify-center bg-[#0A0A0A] transition-transform duration-500 group-hover:scale-[1.03] z-10">
        <Image
          className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110 group-hover:contrast-105"
          src={imageUrl}
          height={180}
          width={350}
          alt={name}
          priority
        />

        {/* Image Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Shine Effect on Image */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="w-full flex flex-col gap-2 relative z-10">
        <div className="flex w-full items-center justify-between">
          <h3 className="text-[16px] font-medium text-[#CBCBCB] group-hover:text-white transition-colors duration-300">
            {name}
          </h3>
          <div className="relative">
            {/* Arrow Glow */}
            <div
              className={`absolute inset-0 blur-md transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
            >
              <ArrowDownRight className="text-white" size={20} />
            </div>
            {/* Main Arrow */}
            <ArrowDownRight
              className={`relative transition-all duration-300 ${
                isActive
                  ? "text-white rotate-0 translate-x-0 translate-y-0"
                  : "text-[#737373] -rotate-45 -translate-x-1 -translate-y-1"
              }`}
              size={20}
            />
          </div>
        </div>
        <div className="w-full">
          <p className="text-[#737373] text-[14px] leading-relaxed group-hover:text-[#A3A3A3] transition-colors duration-300">
            {about}
          </p>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
        <div
          className={`h-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ${
            isActive ? "translate-x-0" : "-translate-x-full"
          }`}
        />
      </div>

      {/* Corner Accents */}
      <div
        className={`absolute top-0 left-0 w-8 h-8 border-l border-t border-white/20 rounded-tl-xl transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-0 right-0 w-8 h-8 border-r border-b border-white/20 rounded-br-xl transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
