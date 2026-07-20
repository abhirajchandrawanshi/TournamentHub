type Props = {
  name: string;
  rating: number;
};

export default function PlayerInfo({
  name,
  rating,
}: Props) {
  return (
    <div className="bg-[#141922] rounded-xl p-5 border border-gray-800">

      <h2 className="font-bold text-lg">
        {name}
      </h2>

      <p className="text-green-400">
        Rating : {rating}
      </p>

    </div>
  );
}