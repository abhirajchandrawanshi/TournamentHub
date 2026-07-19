import TournamentCard from "./TournamentCard";
import { Link } from "react-router-dom";

const tournaments = [
  {
    badge: "● Live",
    badgeClass: "badge-live",
    round: "Round 4/9",
    title: "Titled Tuesday Blitz",
    type: "3+2 Blitz · Swiss",
    prize: "₹1,50,000",
    fee: "₹299",
    players: "1024 / 1200",
    button: "View Bracket",
    primary: false,
  },

  {
    badge: "Starts in 2h",
    badgeClass: "badge-soon",
    title: "Weekend Rapid Open",
    type: "10+0 Rapid",
    prize: "₹80,000",
    fee: "Free",
    players: "612 / 2000",
    button: "Join Tournament",
    primary: true,
  },

  {
    badge: "Starts Tomorrow",
    badgeClass: "badge-soon",
    title: "Grandmaster Invitational",
    type: "90+30 Classical",
    prize: "₹5,00,000",
    fee: "Invite Only",
    players: "16 / 16",
    button: "Notify Me",
    primary: false,
  },
];

export default function TournamentSection() {
  return (
    <section>

      <div className="wrap">

        <div className="section-title">

          <div className="eyebrow">
            Featured
          </div>

          <h2>
            Tournaments starting soon
          </h2>

          <p>
            Jump into a rated event,
            climb the leaderboard,
            and win real prizes.
          </p>

        </div>

        <div className="t-cards">

          {tournaments.map((item, index) => (
            <TournamentCard
              key={index}
              {...item}
            />
          ))}

        </div>

      </div>

    </section>
  );
}