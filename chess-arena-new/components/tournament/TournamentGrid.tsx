import TournamentCard from "./TournamentCard";

const tournaments = [
  {
    title: "Summer Championship",
    prize: "₹50,000",
    players: 120,
    status: "Live",
  },
  {
    title: "Weekend Blitz",
    prize: "₹15,000",
    players: 80,
    status: "Open",
  },
  {
    title: "Rapid Masters",
    prize: "₹25,000",
    players: 150,
    status: "Registration",
  },
];

export default function TournamentGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

      {tournaments.map((item) => (

        <TournamentCard
          key={item.title}
          {...item}
        />

      ))}

    </div>
  );
}