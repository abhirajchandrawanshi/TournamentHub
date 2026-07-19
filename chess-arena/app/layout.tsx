import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ChessArena",
  description: "Real-Time Chess Tournament Hosting Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0B0D12] text-white">
        <Navbar />

        <main className="min-h-screen pt-16">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}