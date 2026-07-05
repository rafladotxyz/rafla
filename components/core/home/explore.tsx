
"use client";

import Image from "next/image";
import Link from "next/link";
import Draw from "@/assets/usdc.svg";
import Spin from "@/assets/roulete.svg";
import Head from "@/assets/head.svg";
import { ArrowDownRight } from "lucide-react";
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
    router.push(route);
  };

  return (
    <section
      id="explore"
      className="w-full max-w-6xl mx-auto mt-16 md:mt-20 flex flex-col px-4 sm:px-6 md:px-10 pb-10 md:pb-16"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
        
          <h2 className="mt-2 text-xl font-medium text-[#E8E8E8] md:text-2xl">Explore games</h2>
        </div>
       
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 md:gap-6">
        {games.map((game, idx) => (
          <ExploreCard
            key={game.name}
            name={game.name}
            about={game.about}
            imageUrl={game.imageUrl}
            url={game.url}
            routeHandler={handleRoute}
            delay={idx * 110}
          />
        ))}
      </div>
    </section>
  );
};

const ExploreCard = ({
  name,
  url,
  imageUrl,
  about,
  routeHandler,
  delay,
}: {
  name: string;
  url: string;
  imageUrl: string;
  about: string;
  routeHandler: (route: string) => void;
  delay: number;
}) => {
  return (
    <button
      type="button"
      onClick={() => routeHandler(url)}
      style={{ animationDelay: `${delay}ms` }}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-left backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 animate-fade-up"
    >
      <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-shimmer-slow" />
      <div className="absolute -inset-1 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#0A0A0A]">
        <Image
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={imageUrl}
          height={180}
          width={350}
          alt={name}
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </div>

      <div className="relative z-10 flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-[#E8E8E8] transition-colors duration-300 group-hover:text-white md:text-[16px]">
            {name}
          </h3>
          <div className="relative shrink-0">
            <div className="absolute inset-0 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ArrowDownRight className="text-white" size={20} />
            </div>
            <ArrowDownRight
              className="relative -rotate-45 -translate-x-1 -translate-y-1 text-[#737373] transition-all duration-300 group-hover:rotate-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-white"
              size={20}
            />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[#8A8A8A] transition-colors duration-300 group-hover:text-[#BEBEBE] md:text-[14px]">
          {about}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
        <div className="h-full -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-0" />
      </div>
    </button>
  );
};
