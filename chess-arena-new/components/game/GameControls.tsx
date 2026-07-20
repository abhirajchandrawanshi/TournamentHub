export default function GameControls() {
  return (
    <div className="bg-[#141922] border border-gray-800 rounded-xl p-5">

      <h2 className="text-xl font-bold mb-5">
        Match Controls
      </h2>

      <div className="space-y-3">

        <button className="w-full bg-green-500 text-black py-3 rounded-lg font-bold">
          Offer Draw
        </button>

        <button className="w-full bg-red-500 py-3 rounded-lg font-bold">
          Resign
        </button>

        <button className="w-full border border-gray-700 py-3 rounded-lg">
          Flip Board
        </button>

      </div>

    </div>
  );
}