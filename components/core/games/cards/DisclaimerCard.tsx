import Image from "next/image";
import AlertIcon from "@/assets/alertIcon.svg";
export const Disclaimer = ({ toggle }: { toggle?: () => void }) => {
  return (
    <div className="min-w-screen fixed z-999 backdrop-blur-xs min-h-screen flex items-center justify-center">
      <DisclaimerCard toggle={toggle} />
    </div>
  );
};

const DisclaimerCard = ({ toggle }: { toggle?: () => void }) => {
  return (
    <div className="fixed flex w-85 h-112.25 rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] py-6 px-4 ">
      <div className="flex flex-col items-center w-77 h-66.25 gap-6">
        {/** Alert  Icon */}
        <div className="flex-col items-center justify-center w-34 h-22 gap-3">
          <Image
            src={AlertIcon}
            height={48}
            width={48}
            alt="Alert icon"
            className="ml-auto mr-auto"
          />

          <p className="w-34 h-auto text-[20px] font-semibold text-[#D9D9D9] flex items-center justify-center">
            Before you Play
          </p>
        </div>
        {/** Content */}
        <div className="w-77 h-38.25 gap-4">
          <p className="w-77 h-10.5 text-[14px] text-[#CBCBCB] ">
            This is a chance based game .You may lose your entry.
          </p>
          <p className="w-77 h-5.25 text-[14px] text-[#CBCBCB] ">
            All outcomes are probably fair and random.
          </p>
          <p className="w-77 h-5.25 text-[14px] text-[#CBCBCB] ">
            Only play with funds you can afford to lose.
          </p>
          <p className="w-77 h-5.25 text-[14px] text-[#CBCBCB] ">
            Rafla is for entertainment .Play responsibly.
          </p>
        </div>
        {/** Confirm  */}
        <div className="flex w-70 h-15 gap-2">
          <div className="flex w-5 h-7 py-1 px-1 gap-1">
            <div className="w-5 h-5"></div>
          </div>
          <p className="w-70 h-15 text-[#737373] text-[13px]">
            By continuing, you confirm you are 18+ and understand the risks
            involved in chance-based games.
          </p>
        </div>
        {/** bottom */}
        <button
          onClick={toggle}
          className="flex items-center justify-center w-77 h-11 rounded-xl text- py-3 px-3 gap-1 bg-[#FFFFFF] "
        >
          <p className="w-15.5 h-5 text-[14px] text-center text-[#0A0A0A]">{`Let's Play`}</p>
        </button>
      </div>
    </div>
  );
};
