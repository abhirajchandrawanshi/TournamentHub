"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";

const testimonials = [
  { name: "Aman", role: "Competitive player", text: "ChessArena feels clean, fast, and professional. It keeps the focus on the match instead of the interface." },
  { name: "Sneha", role: "Tournament organizer", text: "The layout is simple to scan and the live tournament presentation makes the platform feel premium." },
  { name: "Rohit", role: "Blitz specialist", text: "The overall design is minimal but not boring. It has the confidence of a real chess product." },
];

export default function Testimonials() {
  return (
    <section className="border-t border-white/5 bg-[#090909] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          align="center"
          title={<>Built for players who care about quality.</>}
          description="Real players want clarity, speed, and trust. This section keeps the message direct and elegant."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <Card className="h-full p-6">
                <Quote size={20} className="text-[#81b64c]" />
                <p className="mt-5 text-sm leading-7 text-slate-300">“{item.text}”</p>
                <div className="mt-6">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-sm text-slate-400">{item.role}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}