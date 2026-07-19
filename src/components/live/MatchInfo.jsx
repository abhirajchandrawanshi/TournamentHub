export default function MatchInfo() {
  return (
    <div className="match-info">

      <div className="match-title">
        Magnus Carlsen
        <span>vs</span>
        Hikaru Nakamura
      </div>

      <div className="match-meta">

        <div>
          <p>Round</p>
          <h4>Final</h4>
        </div>

        <div>
          <p>Time Control</p>
          <h4>10 + 0</h4>
        </div>

        <div>
          <p>Status</p>
          <h4 className="live-status">LIVE</h4>
        </div>

      </div>

    </div>
  );
}