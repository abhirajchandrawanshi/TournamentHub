type Props = {
  title: string;
  prize: string;
  players: number;
  status: string;
};

export default function TournamentCard({
  title,
  prize,
  players,
  status,
}: Props) {
  return (
    <div className="bg-[#141922] rounded-2xl border border-gray-800 p-6">

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-4 text-gray-400">
        Prize Pool
      </p>

      <h3 className="text-green-400 text-3xl font-bold">
        {prize}
      </h3>

      <div className="mt-6 flex justify-between">

        <span>{players} Players</span>

        <span className="text-green-400">
          {status}
        </span>

      </div>

      <button className="w-full mt-6 bg-green-500 rounded-xl py-3 text-black font-bold">
        Join Tournament
      </button>

    </div>
  );
}