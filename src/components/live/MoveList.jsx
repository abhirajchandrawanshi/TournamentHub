import moves from "../../data/moves";

export default function MoveList() {
  return (
    <div className="movelist">
      {moves.map((move, index) => (
        <div className="move-row" key={index}>
          <span>{move[0]}</span>

          <span className="move-cell">
            {move[1]}
          </span>

          <span
            className={`move-cell ${
              index === moves.length - 1 ? "cur" : ""
            }`}
          >
            {move[2]}
          </span>
        </div>
      ))}
    </div>
  );
}