import { Link } from "react-router-dom";
export default function Navbar() {
  return (
    <nav className="lp-nav wrap">
      <div className="brand">
        <div className="mark">♔</div>
        Checkmate League
      </div>

      <div className="lp-links">
        <a href="#">Tournaments</a>
        <a href="#">Leaderboard</a>
        <a href="#">How it works</a>
        <a href="#">Pricing</a>
      </div>
<div className="lp-cta-group">

  <Link to="/auth">
    <button className="btn btn-ghost">
      Sign In
    </button>
  </Link>

  <Link to="/auth">
    <button className="btn btn-primary">
      Play Now
    </button>
  </Link>

</div>
      
    </nav>
  );
}