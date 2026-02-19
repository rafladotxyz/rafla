import Group from "@/components/base/Group";
import Image from "next/image";
import Win from "@/assets/won.svg";

export const WinOrLoss = ({ handleClick }: { handleClick: () => void }) => {
  return (
    <div className="min-w-screen fixed z-999 backdrop-blur-xs min-h-screen flex items-center justify-center">
      <WinOrLossCard handleClick={handleClick} />
    </div>
  );
};

const WinOrLossCard = ({ handleClick }: { handleClick: () => void }) => {
  return (
    <div className="w-103.5 h-132 flex gap-1 border-[1.5px] border-[#282828] fixed bg-[#0A0A0A] rounded-3xl">
      <Group className="fixed inset-0 w-full h-full -z-10" />
      <div className="w-103.5 h-107.5 flex flex-col items-center justify-between">
        <Image src={Win} height={149} width={94} alt="won or loose" />
        <div className="w-91.5 h-63.75 gap-6 flex">
          <div className="w-39.75 h-32.75 flex-col items-center justify-between">
            <div className="w-39.75 h-27.5">
              <p className="w-39.75 h-13.25 text-[48px] text-[#737373]">
                You Lost
              </p>
              <p className="w-39.75 h-13.25 text-[48px] text-[#DF1C41]">
                -$5.00
              </p>
            </div>
            <p className="w-39.75 h-5 text-[13px] text-[#737373]">
              Winner: 0x9i0j...1k21
            </p>
          </div>
          <div className="w-91.5 h-25">
            <button
              onClick={handleClick}
              className="flex items-center justify-center w-91.5 border h-11 rounded-xl text- py-3 px-3 gap-1 text-[] bg-[#FFFFFF] "
            >
              Enter next draw
            </button>
            <button className="flex items-center justify-center w-91.5 border h-11 rounded-xl text- py-3 px-3 gap-1 text-white backdrop-blur-lg ">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
