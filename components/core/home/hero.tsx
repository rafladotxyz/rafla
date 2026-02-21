export const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 pt-6 px-4">
      {/* Main Heading */}
      <div className="text-center space-y-0">
        <h1 className="text-5xl md:text-6xl font-medium text-[#E8E8E8] leading-tight">
          Simple games.
        </h1>
        <h1 className="text-5xl md:text-6xl font-medium bg-linear-to-r from-[#D946EF] to-[#d9addf] bg-clip-text text-transparent leading-tight">
          Real suspense.
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-sm md:text-base text-[#A3A3A3] text-center max-w-md leading-relaxed">
        Rafla turns chance into shared moments spins, flips, and draws in real
        time.
      </p>
    </div>
  );
};
