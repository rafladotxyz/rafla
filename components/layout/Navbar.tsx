"use client";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import Base from "@/assets/base.png";
import BaseSepolia from "@/assets/baseSepolia.png";
import { useAppKit } from "@reown/appkit/react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { SignInButton } from "../connector/SigninButton";
import { useRouter } from "next/navigation";
export const Navbar = () => {
  const { open } = useAppKit();
  const router = useRouter();

  const { showToast } = useToast();
  const { isConnected, status } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const getNetworkIcon = (name: string) => {
    switch (name) {
      case "Base Sepolia":
        return BaseSepolia;
      case "Base":
        return Base;
      default:
        return Base; // Fallback icon
    }
  };

  useEffect(() => {
    if (status === "connected") {
      showToast("Wallet connected successfully!", "success");
    }
  }, [status, showToast]);

  const handleConnect = () => {
    open();
  };
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1100px] h-16 border-[2px] rounded-2xl border-[#1A1A1A] flex justify-between items-center py-2 px-6 backdrop-blur-xl bg-black/20 shadow-2xl shadow-black/50">
      <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => router.push("/")}>
        <Image height={32} width={70} src={Logo} alt="rafla logo" className="w-auto h-8 md:h-10" />
      </div>

      <div className="flex items-center gap-4">
        <SignInButton />
      </div>
    </nav>
  );
};
