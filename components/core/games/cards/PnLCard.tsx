import PnlGroup from "@/components/base/PnlGroup";

export const PnL = () => {
  return (
    <div className="min-w-screen fixed z-999 backdrop-blur-xs min-h-screen flex items-center justify-center">
      <PnLCard />
    </div>
  );
};

const PnLCard = () => {
  return (
    <div className="fixed flex flex-col w-178.25 h-[537.85px]">
      <PnlGroup className="fixed inset-0 w-full h-full -z-10" />
      <div className="w-61.75 h-[196.28px] gap-[32.21px]">
        <div className="w-61.75 h-27.5 gap-[5.37px]">
          <p className="w-20.75 h-8.5 text-[24px] text-[#737373]">You won</p>
          <p className="w-61.75 h-17.5 text-[64px] text-[#229EFF]">+$109.25</p>
        </div>
        <p></p>
      </div>
    </div>
  );
};
