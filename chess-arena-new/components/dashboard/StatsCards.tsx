const stats = [
  {
    title: "Rating",
    value: "1820",
    color: "text-yellow-400",
  },
  {
    title: "Wallet",
    value: "₹500",
    color: "text-green-400",
  },
  {
    title: "Matches",
    value: "248",
    color: "text-blue-400",
  },
  {
    title: "Wins",
    value: "174",
    color: "text-pink-400",
  },
];

export default function StatsCards() {
  return (
    <div className="grid md:grid-cols-4 gap-6">

      {stats.map((item) => (

        <div
          key={item.title}
          className="bg-[#141922] rounded-2xl p-6 border border-gray-800"
        >

          <p className="text-gray-400">
            {item.title}
          </p>

          <h2 className={`text-4xl font-bold mt-4 ${item.color}`}>
            {item.value}
          </h2>

        </div>

      ))}

    </div>
  );
}