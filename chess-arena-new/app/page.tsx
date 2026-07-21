import Hero from "@/components/landing/Hero";
import LiveGames from "@/components/landing/LiveGames";
import LiveTournament from "@/components/landing/LiveTournament";
import Features from "@/components/landing/Features";
import Leaderboard from "@/components/landing/Leaderboard";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

export default function Home() {
  return (
    <div className="bg-[#0b0b0b] text-white">
      <Hero />
      <LiveGames />
      <LiveTournament />
      <Features />
      <Leaderboard />
      <Testimonials />
      <CTA />
    </div>
  );
}