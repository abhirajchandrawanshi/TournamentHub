import { Link } from "react-router-dom";
export default function TournamentCard({
  badge,
  badgeClass,
  round,
  title,
  type,
  prize,
  fee,
  players,
  button,
  primary
}) {
  return (
    <div className="glass t-card">

      <div className="t-card-head">

        <span className={`badge ${badgeClass}`}>
          {badge}
        </span>

        {round && (
          <span
            style={{
              color: "var(--text-3)",
              fontSize: "12px",
            }}
          >
            {round}
          </span>
        )}

      </div>

      <h3>{title}</h3>

      <p className="meta">{type}</p>

      <div className="t-row">
        <span>Prize pool</span>
        <span style={{ color: "var(--green)" }}>
          {prize}
        </span>
      </div>

      <div className="t-row">
        <span>Entry fee</span>
        <span>{fee}</span>
      </div>

      <div className="t-row">
        <span>Players</span>
        <span>{players}</span>
      </div>

      <div className="t-foot">

        <div className="avatars-stack">
          <div className="avatar-sm">A</div>
          <div className="avatar-sm">B</div>
          <div className="avatar-sm">C</div>
        </div>

       <Link
  to={
    button === "View Bracket"
      ? "/arena"
      : button === "Join Tournament"
      ? "/auth"
      : "/live"
  }
>
  <button
    className={`btn ${
      primary ? "btn-primary" : "btn-ghost"
    }`}
    style={{
      padding: "8px 16px",
      fontSize: "12px",
    }}
  >
    {button}
  </button>
</Link>

      </div>

    </div>
  );
}