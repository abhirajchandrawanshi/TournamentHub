import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import LiveTournament from "@/components/landing/LiveTournament";
import LeaderboardPreview from "@/components/landing/LeaderboardPreview";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
      <h1 className="text-5xl font-bold">
        Chess Tournament Platform 🚀
      </h1>
    </main>
  );
}