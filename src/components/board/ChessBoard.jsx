import Square from "./Square";

const blackBack = [
  "♜",
  "♞",
  "♝",
  "♛",
  "♚",
  "♝",
  "♞",
  "♜",
];

const whiteBack = [
  "♖",
  "♘",
  "♗",
  "♕",
  "♔",
  "♗",
  "♘",
  "♖",
];

export default function ChessBoard({

  empty=[],

  from,

  to

}) {

  const squares=[];

  for(let r=0;r<8;r++){

    for(let c=0;c<8;c++){

      let piece="";
      let cls="";

      if(r===0){

        piece=blackBack[c];

        cls="pc-b";

      }

      else if(r===1){

        piece="♟";

        cls="pc-b pawn";

      }

      else if(r===6){

        piece="♙";

        cls="pc-w pawn";

      }

      else if(r===7){

        piece=whiteBack[c];

        cls="pc-w";

      }

      const remove=empty.some(

        pos=>pos[0]===r && pos[1]===c

      );

      if(remove){

        piece="";

      }

      let highlight="";

      if(

        from &&
        from[0]===r &&
        from[1]===c

      ){

        highlight="hl-from";

      }

      if(

        to &&
        to[0]===r &&
        to[1]===c

      ){

        highlight="hl-to";

      }

      squares.push(

        <Square

          key={`${r}-${c}`}

          light={(r+c)%2===0}

          piece={piece}

          pieceClass={cls}

          highlight={highlight}

        />

      );

    }

  }

  return (

    <div className="board8">

      {squares}

    </div>

  );

}