export default function StatsCards({ stats }) {
  return (
    <div className="stats-cards">
      {Object.entries(stats).map(([label, value]) => (
        <div key={label} className="stat-card">
          <span className="stat-value">{value}</span>
          <span className="stat-label">{label.replaceAll("_", " ")}</span>
        </div>
      ))}
    </div>
  );
}
