export default function StandingsRow({

index,

player

}){

const icons={

win:"+",

loss:"−",

draw:"="

}

return(

<tr>

<td className="rank-cell">

{index+1}

</td>

<td>

<div className="player-cell">

<div className="avatar-sm">

{player.name.slice(0,2)}

</div>

<div>

<b>

{player.name}

</b>

<div className="r">

{player.rating}

</div>

</div>

</div>

</td>

<td>

<div className="sheet">

{

player.results.map((item,i)=>(

<i
key={i}
className={item}
>

{icons[item]}

</i>

))

}

</div>

</td>

<td className="score-cell">

{player.score}

</td>

</tr>

)

}