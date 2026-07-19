const moves = [
  "1. e4 e5",
  "2. Nf3 Nc6",
  "3. Bb5 a6",
];

export default function MoveHistory() {
  return (
    <div className="bg-[#141922] rounded-xl p-6 border border-gray-800">

      <h2 className="text-xl font-bold mb-5">
        Move History
      </h2>

      {moves.map((move) => (

        <p
          key={move}
          className="py-2 border-b border-gray-700"
        >
          {move}
        </p>

      ))}

    </div>
  );
}