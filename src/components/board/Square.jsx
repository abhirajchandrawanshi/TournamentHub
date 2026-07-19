export default function Square({
  light,
  piece,
  pieceClass,
  highlight
}) {

  return (

    <div
      className={`
      sq
      ${light ? "light" : "dark"}
      ${highlight}
      `}
    >

      {piece && (

        <span className={pieceClass}>
          {piece}
        </span>

      )}

    </div>

  );

}