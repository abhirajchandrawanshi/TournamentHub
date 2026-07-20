export default function ChessClock() {
  return (
    <div className="bg-[#141922] rounded-xl p-6 border border-gray-800">

      <h2 className="text-xl font-bold">
        Chess Clock
      </h2>

      <div className="mt-6 space-y-5">

        <div className="flex justify-between">

          <span>White</span>

          <span className="text-green-400 text-2xl">
            10:00
          </span>

        </div>

        <div className="flex justify-between">

          <span>Black</span>

          <span className="text-green-400 text-2xl">
            10:00
          </span>

        </div>

      </div>

    </div>
  );
}