import { ExploreGames } from "@/components/core/home/explore";
import { Hero } from "@/components/core/home/hero";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden font-sans pb-10 md:pb-16">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6">
        <Navbar />
      </header>
      <Hero />
      <ExploreGames />
    </div>
  );
}
