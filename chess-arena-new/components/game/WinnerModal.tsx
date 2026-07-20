"use client";

type Props = {
  open?: boolean;
};

export default function WinnerModal({ open = false }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

      <div className="bg-[#141922] rounded-2xl p-10 w-[420px]">

        <h1 className="text-4xl font-bold text-green-400">
          🎉 Victory
        </h1>

        <p className="mt-5">
          Congratulations! You won this match.
        </p>

        <button className="w-full mt-8 bg-green-500 text-black py-3 rounded-xl font-bold">
          Continue
        </button>

      </div>

    </div>
  );
}