import ChessBoard from "../components/board/ChessBoard";

export default function Arena() {
  return (
    <section className="arena-page">

      <div className="wrap">

        <div className="arena-header">

          <div>
            <h1>Tournament Arena</h1>
            <p>
              Join live games, follow standings and compete for prizes.
            </p>
          </div>

          <button className="btn btn-primary">
            Join Arena
          </button>

        </div>

        <div className="arena-grid">

          {/* Left */}

          <div className="glass arena-left">

            <h3>Current Match</h3>

            <ChessBoard />

          </div>

          {/* Center */}

          <div className="glass arena-center">

            <h3>Leaderboard</h3>

            <table className="leaderboard">

              <thead>

                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Rating</th>
                  <th>Points</th>
                </tr>

              </thead>

              <tbody>

                <tr>
                  <td>1</td>
                  <td>Magnus Carlsen</td>
                  <td>2830</td>
                  <td>9</td>
                </tr>

                <tr>
                  <td>2</td>
                  <td>Hikaru Nakamura</td>
                  <td>2795</td>
                  <td>8</td>
                </tr>

                <tr>
                  <td>3</td>
                  <td>Fabiano Caruana</td>
                  <td>2785</td>
                  <td>7</td>
                </tr>

                <tr>
                  <td>4</td>
                  <td>Arjun Erigaisi</td>
                  <td>2760</td>
                  <td>6</td>
                </tr>

              </tbody>

            </table>

          </div>

          {/* Right */}

          <div className="glass arena-right">

            <h3>Upcoming Pairings</h3>

            <ul>

              <li>Magnus vs Hikaru</li>

              <li>Arjun vs Fabiano</li>

              <li>Praggnanandhaa vs Gukesh</li>

              <li>Wei Yi vs Firouzja</li>

            </ul>

          </div>

        </div>

      </div>

    </section>
  );
}