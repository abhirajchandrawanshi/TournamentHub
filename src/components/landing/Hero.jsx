import ChessBoard from "../board/ChessBoard";
import { Link } from "react-router-dom";
export default function Hero() {
  return (
    <section className="hero">

      <div className="hero-board-bg"></div>

      <div className="wrap hero-grid">

        <div>

          <div className="eyebrow">
            <span className="dot-live"></span>
            2,481 players online right now
          </div>

          <h1>
            Compete in tournaments
            <span> built for serious players.</span>
          </h1>

          <p>
            Host, join and stream chess tournaments with real prize pools,
            live brackets and rating-based matchmaking —
            all in one platform.
          </p>

          <div className="lp-cta-group">

  <Link to="/auth">
    <button className="btn btn-primary">
      Create Free Account
    </button>
  </Link>

  <Link to="/live">
    <button className="btn btn-ghost">
      Watch Live Broadcast →
    </button>
  </Link>

</div>

          <div className="hero-stats">

            <div>
              <p>₹42L+</p>
              <p>Prize pools paid</p>
            </div>

            <div>
              <p>18,900</p>
              <p>Tournaments hosted</p>
            </div>

            <div>
              <p>310K</p>
              <p>Registered players</p>
            </div>

          </div>

        </div>

        {/* Right Chess Card */}

        <div className="glass hero-board-card">

          <div className="hb-topbar">

            <div className="hb-player">
              <div className="avatar-sm">
                MG
              </div>

              Magnus G.

              <span className="rating-tag mono">
                2847
              </span>

            </div>

            <div className="clock-chip">
              04:12
            </div>

          </div>

         <ChessBoard

empty={[
[1,4],
[6,4],
[1,3],
[7,6]
]}

from={[6,4]}

to={[4,4]}

/>
          <div
            className="hb-topbar"
            style={{
              marginTop: "14px",
              marginBottom: "0"
            }}
          >

            <div className="hb-player">

              <div className="avatar-sm">
                HN
              </div>

              Hikaru N.

              <span className="rating-tag mono">
                2802
              </span>

            </div>

            <div className="clock-chip active">
              02:47
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}