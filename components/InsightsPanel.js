export default function InsightsPanel({ insights }) {
  return (
    <section className="insights-panel">
      <h3>Key Insights</h3>
      <ul>
        {insights.map((line, i) => (<li key={i}>{line}</li>))}
      </ul>
    </section>
  );
}
