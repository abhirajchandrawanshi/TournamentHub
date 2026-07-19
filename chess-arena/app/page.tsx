import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LiveTournament from "@/components/landing/LiveTournament";
import LeaderboardPreview from "@/components/landing/LeaderboardPreview";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <LiveTournament />
      <LeaderboardPreview />
      <Testimonials />
      <Footer />
    </>
  );
}