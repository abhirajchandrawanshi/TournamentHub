export default function PlayerStrip({
  initials,
  name,
  rating,
  color,
  clock,
  active = false,
}) {
  return (
    <div className="player-strip">
      <div className="player-info">
        <div className="avatar-sm">{initials}</div>

        <div>
          <b style={{ fontSize: "13.5px" }}>{name}</b>

          <div className="rating-tag">
            {rating} · {color}
          </div>
        </div>
      </div>

      <div className={`clock-chip ${active ? "active" : ""}`}>
        {clock}
      </div>
    </div>
  );
}