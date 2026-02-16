import Image from "next/image";
import Draw from "@/assets/usdc.svg";
import Spin from "@/assets/roulete.svg";
import Head from "@/assets/head.svg";
import { ArrowDownRight } from "lucide-react";
interface game {
  name: string;
  url: string;
  about: string;
}
export const ExploreGames = () => {
  const games: game[] = [
    {
      name: "Rafla Spin",
      url: Spin,
      about: "All eyes on the wheel, one big spin, one lucky winner.",
    },
    {
      name: "Rafla Flip",
      url: Head,
      about: "Heads or tails? Pick a side, one moment, one answer, one winner.",
    },
    {
      name: "Rafla Draw",
      url: Draw,
      about:
        "Seconds away from a life-changing moment. Take your spot before the timer hits zero.",
    },
  ];
  return (
    <div className="w-244  mt-20 flex  flex-col  px-4">
      <div className="w-244 mb-6">
        <h2 className="text-[18px] font-normal text-[#D9D9D9]">
          Explore Games
        </h2>
      </div>
      <div className="w-244 flex gap-6 flex-row justify-center">
        {games.map((game, idx) => (
          <ExploreCard
            key={idx}
            name={game.name}
            about={game.about}
            url={game.url}
          />
        ))}
      </div>
    </div>
  );
};

const ExploreCard = ({
  name,
  url,
  about,
}: {
  name: string;
  url: string;
  about: string;
}) => {
  return (
    <div className="w-full flex flex-col border border-[#141414] backdrop-blur-xs rounded-xl p-4 cursor-pointer">
      <div className="w-full rounded-2xl overflow-hidden mb-4  flex items-center justify-center">
        <Image
          className="w-full h-full object-cover"
          src={url}
          height={180}
          width={350}
          alt={name}
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <h3 className="text-[16px] font-medium text-[#CBCBCB]">{name}</h3>
          <ArrowDownRight />
        </div>
        <div className="w-full">
          <p className="text-[#737373] text-[14px] leading-relaxed">{about}</p>
        </div>
      </div>
    </div>
  );
};
