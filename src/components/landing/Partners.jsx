export default function Partners() {
  const partners = [
    "ChessBase",
    "FIDE",
    "Kasparov Chess",
    "Rook & Pawn",
    "Grand Slam",
  ];

  return (
    <section
      style={{
        padding: "50px 0",
      }}
    >
      <div className="wrap">

        <div className="section-title">
          <div className="eyebrow">Partners</div>

          <h2>Trusted by the chess community</h2>

          <p>
            Official partners, organizers and sponsors powering tournaments
            across the world.
          </p>
        </div>

        <div className="partners">
          {partners.map((partner, index) => (
            <span key={index}>{partner}</span>
          ))}
        </div>

      </div>
    </section>
  );
}