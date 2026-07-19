import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import LiveTournament from "@/components/landing/LiveTournament";
import LeaderboardPreview from "@/components/landing/LeaderboardPreview";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
    return (
        <>
            <Navbar />
            <Hero />
            <LiveTournament />
            <LeaderboardPreview />
            <Footer />
        </>
    );
}