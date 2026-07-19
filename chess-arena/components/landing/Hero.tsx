import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center">
      <div className="container grid md:grid-cols-2 gap-16 items-center">

        <div>

          <span className="text-green-400 font-semibold uppercase tracking-widest">
            Real-Time Tournament Platform
          </span>

          <h1 className="text-6xl font-extrabold leading-tight mt-5">
            Play.
            <br />
            Compete.
            <br />
            <span className="gradient-text">
              Win.
            </span>
          </h1>

          <p className="text-gray-400 mt-8 text-lg leading-8 max-w-xl">
            Join professional online chess tournaments,
            compete with players worldwide,
            win prizes,
            and climb the global leaderboard.
          </p>

          <div className="flex gap-5 mt-10">

            <Link
              href="/tournament"
              className="bg-green-500 text-black px-7 py-4 rounded-xl font-semibold hover:bg-green-400"
            >
              Join Tournament
            </Link>

            <Link
              href="/game"
              className="border border-green-500 px-7 py-4 rounded-xl hover:bg-green-500 hover:text-black"
            >
              Watch Live
            </Link>

          </div>

        </div>

        <div className="flex justify-center">

          <img
            src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=900"
            alt="Chess"
            className="rounded-3xl shadow-2xl"
          />

        </div>

      </div>
    </section>
  );
}