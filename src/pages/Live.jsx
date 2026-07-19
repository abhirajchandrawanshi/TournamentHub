import ChessBoard from "../components/board/ChessBoard";
import EvaluationBar from "../components/live/EvaluationBar";
import MoveList from "../components/live/MoveList";
import PlayerCard from "../components/live/PlayerCard";
import PlayerStrip from "../components/live/PlayerStrip";
import MatchInfo from "../components/live/MatchInfo";

export default function Live() {
  return (
    <section className="live-page">

      {/* Left Sidebar */}
      <aside className="live-left">
        <PlayerCard
          name="Magnus Carlsen"
          rating={2830}
          country="Norway"
          score="1"
        />

        <EvaluationBar />

        <PlayerCard
          name="Hikaru Nakamura"
          rating={2795}
          country="USA"
          score="0"
        />
      </aside>

      {/* Chess Board */}
      <main className="live-center">
        <ChessBoard />
      </main>

      {/* Right Sidebar */}
      <aside className="live-right">
        <MatchInfo />

        <PlayerStrip
          initials="MC"
          name="Magnus Carlsen"
          rating={2830}
          color="white"
          active={true}
        />

        <PlayerStrip
          initials="HN"
          name="Hikaru Nakamura"
          rating={2795}
          color="black"
          active={false}
        />

        <MoveList />
      </aside>

    </section>
  );
}