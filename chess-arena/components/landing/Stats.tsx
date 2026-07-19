export default function Stats() {
  const stats = [
    { title: "Players", value: "10K+" },
    { title: "Tournaments", value: "250+" },
    { title: "Prize Pool", value: "₹10L+" },
    { title: "Live Matches", value: "150+" },
  ];

  return (
    <section className="py-20">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-[#141922] rounded-2xl p-8 text-center border border-gray-800"
          >
            <h2 className="text-4xl font-bold text-green-400">
              {item.value}
            </h2>

            <p className="mt-3 text-gray-400">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}