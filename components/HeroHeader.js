export default function HeroHeader({ stats }) {
  return (
    <header className="hero-header">
      <h1>🦅 Legendary Bird Migration Dashboard</h1>
      <p>
        Explore, simulate, and protect bird migration with immersive maps and live ML/stat insights.
      </p>
      <div className="kpi-row">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="kpi-card">
            <div className="value">{value}</div>
            <div className="label">{label.replaceAll("_"," ")}</div>
          </div>
        ))}
      </div>
    </header>
  );
}
