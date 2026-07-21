import ChessBoard from "./ChessBoard";
import ChessClock from "./ChessClock";
import MoveHistory from "./MoveHistory";
import PlayerInfo from "./PlayerInfo";
import GameControls from "./GameControls";
import MatchStatus from "./MatchStatus";

export default function GameLayout() {
    return (
        <div className="min-h-screen bg-[#050816] py-10 text-white">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.15fr_0.55fr] lg:px-6">
                <div>
                    <PlayerInfo name="Opponent" rating={1840} />
                    <div className="my-5">
                        <ChessBoard />
                    </div>
                    <PlayerInfo name="You" rating={1820} />
                </div>

                <div className="space-y-4">
                    <ChessClock />
                    <MatchStatus />
                    <MoveHistory />
                    <GameControls />
                </div>
            </div>
        </div>
    );
}