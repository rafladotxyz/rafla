import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Constellation from "@/components/base/Constellation";
import ContextProvider from "@/Providers";
import { Analytics } from "@vercel/analytics/next";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { Suspense } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AuthProvider } from "../context/AuthContext";

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

// The provider tree (Privy) initializes network calls on mount, which cannot
// run during static prerendering. Every route here is client-rendered anyway.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen bg-[#050505] text-[#f5f5f5]`}
      >
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <Analytics />
        <ContextProvider>
          <AuthProvider>
            <ToastContainer />
            {/* Fixed starry background */}
            <Constellation className="fixed inset-0 w-full h-full -z-10" />

            <main className="relative z-10 pt-0 ">{children}</main>
          </AuthProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
