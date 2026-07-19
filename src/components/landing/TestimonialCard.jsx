export default function TestimonialCard({
  initials,
  name,
  role,
  quote,
}) {
  return (
    <div className="glass testi-card">

      <div className="stars">
        ★★★★★
      </div>

      <p className="quote">
        {quote}
      </p>

      <div className="testi-person">

        <div className="avatar-sm">
          {initials}
        </div>

        <div>

          <p>{name}</p>

          <p>{role}</p>

        </div>

      </div>

    </div>
  );
}