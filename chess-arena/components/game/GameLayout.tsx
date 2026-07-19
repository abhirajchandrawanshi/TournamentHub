import ChessBoard from "./ChessBoard";
import ChessClock from "./ChessClock";
import MoveHistory from "./MoveHistory";
import PlayerInfo from "./PlayerInfo";

export default function GameLayout() {
  return (
    <div className="container py-10">

      <div className="grid lg:grid-cols-[700px_350px] gap-8">

        <div>

          <PlayerInfo
            name="Opponent"
            rating={1840}
          />

          <div className="my-5">
            <ChessBoard />
          </div>

          <PlayerInfo
            name="You"
            rating={1820}
          />

        </div>

        <div className="space-y-6">

          <ChessClock />

          <MoveHistory />

        </div>

      </div>

    </div>
  );
}
