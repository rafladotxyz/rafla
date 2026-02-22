import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Constellation from "@/components/base/Constellation";
import { headers } from "next/headers";
import ContextProvider from "@/Providers/ReownProvider";
import { Analytics } from "@vercel/analytics/next";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { Suspense } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rafla",
  description: "Simple games. Real suspense",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
      >
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <Analytics />
        <ContextProvider cookies={cookies}>
          <ToastContainer />
          {/* Fixed starry background */}
          <Constellation className="fixed inset-0 w-full h-full -z-10" />

          <main className="relative z-10 pt-0 ">{children}</main>
        </ContextProvider>
      </body>
    </html>
  );
}
