export default function ActiveTournament() {
  return (
    <div className="bg-[#141922] rounded-2xl p-8 border border-gray-800">

      <h2 className="text-2xl font-bold">
        Active Tournament
      </h2>

      <p className="text-gray-400 mt-3">
        Summer Chess Championship 2026
      </p>

      <div className="mt-8 flex justify-between">

        <div>

          <p className="text-gray-500">
            Prize Pool
          </p>

          <h3 className="text-green-400 text-3xl font-bold">
            ₹50,000
          </h3>

        </div>

        <button className="bg-green-500 text-black px-6 rounded-xl font-semibold">
          Join
        </button>

      </div>

    </div>
  );
}