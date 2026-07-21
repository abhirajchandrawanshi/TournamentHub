"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clock, setClock] = useState("3+0");
  const [type, setType] = useState("Arena");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Backend ready hone par yahan API call hogi (POST /tournaments)
    router.push("/tournament");
  }

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[440px] mx-auto px-4 py-10">
        <h1 className="text-[20px] font-semibold text-text-strong mb-5">Create a tournament</h1>

        <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-3">
          <div>
            <label className="label-eyebrow block mb-1" htmlFor="name">
              Tournament name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-1" htmlFor="clock">
              Time control
            </label>
            <select
              id="clock"
              value={clock}
              onChange={(e) => setClock(e.target.value)}
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent"
            >
              <option value="1+0">1+0 Bullet</option>
              <option value="3+0">3+0 Blitz</option>
              <option value="5+3">5+3 Blitz</option>
              <option value="10+0">10+0 Rapid</option>
              <option value="15+10">15+10 Classical</option>
            </select>
          </div>

          <div>
            <label className="label-eyebrow block mb-1" htmlFor="type">
              Format
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent"
            >
              <option value="Arena">Arena</option>
              <option value="Swiss">Swiss</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Create
          </button>
        </form>
      </div>
    </main>
  );
}