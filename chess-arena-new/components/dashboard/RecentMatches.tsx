const matches = [
  {
    opponent: "Rahul",
    result: "Win",
  },
  {
    opponent: "Ankit",
    result: "Loss",
  },
  {
    opponent: "Riya",
    result: "Win",
  },
];

export default function RecentMatches() {
  return (
    <div className="bg-[#141922] rounded-2xl p-8 border border-gray-800">

      <h2 className="text-2xl font-bold mb-6">
        Recent Matches
      </h2>

      {matches.map((match, index) => (

        <div
          key={index}
          className="flex justify-between py-3 border-b border-gray-700"
        >

          <span>{match.opponent}</span>

          <span
            className={
              match.result === "Win"
                ? "text-green-400"
                : "text-red-400"
            }
          >
            {match.result}
          </span>

        </div>

      ))}

    </div>
  );
}