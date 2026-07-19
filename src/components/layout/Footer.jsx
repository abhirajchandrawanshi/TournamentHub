import { Link } from "react-router-dom";
export default function Footer() {
    return (
        <footer>

            <div className="wrap">

                <div className="foot-grid">

                    <div>

                        <div
                            className="brand"
                            style={{ marginBottom: "14px" }}
                        >
                            <div className="mark">♔</div>
                            Checkmate League
                        </div>

                        <p>
                            The competitive home for online chess tournaments —
                            rated play,
                            real prizes,
                            live broadcasts.
                        </p>

                    </div>

                    <div>

                        <h4>Product</h4>

                        <Link to="/tournaments">Tournaments</Link>
                        <Link to="/leaderboard">Leaderboard</Link>
                        <Link to="/wallet">Wallet</Link>
                    </div>

                    <div>

                        <h4>Company</h4>

                        <Link to="/about">About</Link>
                        <Link to="/careers">Careers</Link>
                        <Link to="/blog">Blog</Link>

                    </div>

                    <div>

                        <h4>Support</h4>

                        <Link to="/help">Help Center</Link>
                        <Link to="/fair-play">Fair Play</Link>
                        <Link to="/contact">Contact</Link>

                    </div>

                </div>

                <div className="foot-bottom">

                    <span>
                        © 2026 Checkmate League.
                    </span>

                    <span>
                        Made for players, by players.
                    </span>

                </div>

            </div>

        </footer>
    );
}