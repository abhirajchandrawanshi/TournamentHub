import Navbar from "../components/layout/Navbar";
import Hero from "../components/landing/Hero";
import TournamentSection from "../components/landing/TournamentSection";
import Testimonials from "../components/landing/Testimonials";
import Partners from "../components/landing/Partners";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <TournamentSection />
      <Testimonials />
      <Partners />
      <Footer />
    </>
  );
}