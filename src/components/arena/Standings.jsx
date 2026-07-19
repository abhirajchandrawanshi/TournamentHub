import { arenaPlayers } from "../../data/players";

import StandingsRow from "./StandingsRow";
export default function Standings(){

return(

<div className="glass standings-card">

<div className="standings-head">

<h3>

Standings

</h3>

<span>

Winner Not Yet Decided

</span>

</div>

<table className="standings">

<thead>

<tr>

<th>#</th>

<th>Player</th>

<th>Rounds</th>

<th>

Score

</th>

</tr>

</thead>

<tbody>

{

arenaPlayers.map((player,index)=>(

<StandingsRow

key={index}

index={index}

player={player}

/>

))

}

</tbody>

</table>

</div>

)

}