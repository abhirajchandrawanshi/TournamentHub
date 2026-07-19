"use client";

const testimonials = [
  {
    name: "Aman",
    role: "Professional Player",
    text: "ChessArena offers the smoothest online tournament experience I've ever had.",
  },
  {
    name: "Sneha",
    role: "Organizer",
    text: "Creating tournaments takes only a few minutes. Everything feels premium.",
  },
  {
    name: "Rohit",
    role: "Blitz Player",
    text: "The real-time gameplay and leaderboard system are amazing.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-black py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-14 text-center text-5xl font-bold">
          What Our Players Say
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-white/10 bg-slate-900 p-8"
            >
              <p className="leading-8 text-gray-300">"{item.text}"</p>

              <div className="mt-8">
                <h4 className="font-bold">{item.name}</h4>
                <span className="text-sm text-emerald-400">
                  {item.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}