export default function EvaluationBar() {
  return (
    <div className="lb-evalcol">
      <div style={{ position: "relative" }}>
        <span className="eval-num">+0.8</span>

        <div className="eval-bar">
          <div
            className="eval-fill"
            style={{ height: "58%" }}
          />
        </div>
      </div>
    </div>
  );
}