import ChessBoard from "./ChessBoard";
import ChessClock from "./ChessClock";
import MoveHistory from "./MoveHistory";
import PlayerInfo from "./PlayerInfo";
import CapturedPieces from "./CapturedPieces";
import GameControls from "./GameControls";
import GameChat from "./GameChat";
import SpectatorPanel from "./SpectatorPanel";
import MatchStatus from "./MatchStatus";
import WinnerModal from "./WinnerModal";
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

                    <CapturedPieces />

                    <MoveHistory />

                    <GameControls />
                    <ChessClock />

<MatchStatus />

<SpectatorPanel />

<CapturedPieces />

<MoveHistory />

<GameChat />

<GameControls />

<WinnerModal open={false} />

                </div>

            </div>

        </div>
    );
}