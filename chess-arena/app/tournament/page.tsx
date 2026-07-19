import TournamentGrid from "@/components/tournament/TournamentGrid";
import TournamentSearch from "@/components/tournament/TournamentSearch";

export default function TournamentPage() {
  return (
    <div className="container py-24">

      <h1 className="text-5xl font-bold mb-10">
        Chess Tournaments
      </h1>

      <TournamentSearch />

      <TournamentGrid />

    </div>
  );
}