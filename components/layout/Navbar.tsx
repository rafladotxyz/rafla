"use client";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import Base from "@/assets/Base.svg";
import { useAppKit } from "@reown/appkit/react";
import {
  useWalletInfo,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
export const Navbar = () => {
  const { open } = useAppKit();
  const walletInfo = useWalletInfo();
  const { isConnected, status, address } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  console.log("Wallet Info:", walletInfo);
  console.log("Account:", { isConnected, status, address });
  console.log("Networks:", caipNetwork);
  const handleConnect = () => {
    open();
  };
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-221 h-17 ml-auto mr-auto border-[2.5px] rounded-xl border-[#1A1A1A]  flex justify-between py-3 px-4 backdrop-blur-md">
      <div className="w-24 h-[43.88px] ">
        <Image height={43} width={96} src={Logo} alt="rafla logo" />
      </div>
      {isConnected ? (
        <div
          onClick={() => handleConnect()}
          className="w-auto h-11 py-3 px-4 rounded-xl flex items-center justify-between text-xs bg-[#0A0A0A] text-black border border-[#1A1A1A] drop-shadow-[#242628] cursor-pointer"
        >
          <div className="w-5 h-5">
            <Image
              height={20}
              width={20}
              src={caipNetwork?.assets?.imageUrl || Base}
              alt="Base logo"
            />
          </div>
          <p className="text-[#D9D9D9] w-auto text-[14px]">
            {caipNetwork?.name || "Base"}
          </p>
        </div>
      ) : (
        <button
          onClick={() => handleConnect()}
          className="h-11 py-3 px-6 rounded-xl text-[14px] font-medium bg-white text-black border border-[#1A1A1A] hover:bg-gray-100 transition-colors"
        >
          Connect wallet
        </button>
      )}
    </nav>
  );
};
