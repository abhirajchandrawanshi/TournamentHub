export default function CapturedPieces() {
  return (
    <div className="bg-[#141922] border border-gray-800 rounded-xl p-5">

      <h2 className="text-xl font-bold mb-4">
        Captured Pieces
      </h2>

      <div className="flex justify-between">

        <div>
          <p className="text-gray-400 mb-2">White</p>

          <div className="text-3xl">
            ♟ ♞
          </div>
        </div>

        <div>
          <p className="text-gray-400 mb-2">Black</p>

          <div className="text-3xl">
            ♙ ♘
          </div>
        </div>

      </div>

    </div>
  );
}