const controls = [
  "↻",
  "🔊",
  "½",
  "⚑",
  "⛶",
  "🎨",
];

export default function GameControls() {
  return (
    <div className="game-controls">
      {controls.map((item, index) => (
        <button key={index} className="ctrl-btn">
          {item}
        </button>
      ))}
    </div>
  );
}