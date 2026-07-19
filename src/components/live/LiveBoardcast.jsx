import ChessBoard from "../board/ChessBoard";
import EvaluationBar from "./EvaluationBar";
import PlayerStrip from "./PlayerStrip";
import MoveList from "./MoveList";
import GameControls from "./GameControls";

export default function LiveBroadcast() {
  return (
    <>
      <div className="lb-topbar">
        <div className="lb-title">

          <div className="brand">
            <div className="mark">♔</div>
            Checkmate League
          </div>

          <h2>· Titled Tuesday Blitz</h2>

          <span className="round-chip">
            Round 4 / 9
          </span>

        </div>

        <div className="live-chip">
          <span className="dot-live"></span>

          Live · 8,204 watching
        </div>
      </div>
      <div className="lb-body">

<EvaluationBar/>

<div className="lb-boardcol">

<PlayerStrip
initials="MG"
name="Magnus G."
rating="2847"
color="White"
clock="04:12"
/>

<div className="capt-row">
♟♟♝
</div>

<ChessBoard
size="large"
empty={[
[1,4],
[6,4],
[1,2],
[6,2],
[7,6],
[0,1]
]}
from={[1,2]}
to={[3,2]}
/>

<div className="capt-row">
♙♘
</div>

<PlayerStrip
initials="HN"
name="Hikaru N."
rating="2802"
color="Black"
clock="02:47"
active
/>

<GameControls/>

</div>
<div className="lb-side">

<div className="side-tabs">

<div className="side-tab active">
Moves
</div>

<div className="side-tab">
Players
</div>

<div className="side-tab">
Chat
</div>

</div>

<MoveList/>

</div>

</div>

</>

);
}