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
export const Navbar = () => {
  const { open } = useAppKit();

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
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-221 h-17 ml-auto mr-auto border-[2.5px] rounded-xl border-[#1A1A1A]  flex justify-between py-3 px-4 backdrop-blur-md">
      <div className="w-24 h-[43.88px] ">
        <Image height={43} width={96} src={Logo} alt="rafla logo" />
      </div>

      <SignInButton />
    </nav>
  );
};
