"use client";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import Base from "@/assets/Base.svg";
import { useAppKit } from "@reown/appkit/react";
import { useState } from "react";
export const Navbar = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const { open } = useAppKit();
  const handleConnect = () => {
    open();
    //alert("Connecting ....");
    setConnected(!connected);
  };
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-221 h-17 ml-auto mr-auto border-[2.5px] rounded-xl border-[#1A1A1A]  flex justify-between py-3 px-4 backdrop-blur-md">
      <div className="w-24 h-[43.88px] ">
        <Image height={43} width={96} src={Logo} alt="rafla logo" />
      </div>
      {connected ? (
        <div
          onClick={() => handleConnect()}
          className="w-28.75 h-11 py-3 px-4 rounded-xl flex items-center justify-between text-xs bg-[#0A0A0A] text-black border border-[#1A1A1A] drop-shadow-[#242628] cursor-pointer"
        >
          <div className="w-5 h-5">
            <Image height={20} width={20} src={Base} alt="Base logo" />
          </div>
          <p className="text-[#D9D9D9] text-[14px]">Base</p>
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
