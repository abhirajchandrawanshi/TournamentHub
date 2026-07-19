export default function PlayerCard({
  name,
  rating,
  country,
  score,
}) {
  return (
    <div className="glass player-card">

      <div className="player-top">

        <div className="avatar-lg">
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        <div>
          <h3>{name}</h3>
          <p>{country}</p>
        </div>

      </div>

      <div className="player-info">

        <div>
          <span>Rating</span>
          <strong>{rating}</strong>
        </div>

        <div>
          <span>Score</span>
          <strong>{score}</strong>
        </div>

      </div>

    </div>
  );
}