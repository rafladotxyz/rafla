import { ExploreGames } from "@/components/core/home/explore";
import { Hero } from "@/components/core/home/hero";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col  min-h-screen items-center justify-center font-sans ">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6">
        <Navbar />
      </header>
      <Hero />
      <ExploreGames />
    </div>
  );
}
