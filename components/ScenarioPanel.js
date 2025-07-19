export default function ScenarioPanel({ scenarios, scenarioIdx, setScenarioIdx }) {
  if (!scenarios.length) return null;
  const current = scenarios[scenarioIdx];
  return (
    <section>
      <h4>Scenario Simulator</h4>
      <label>Scenario:</label>
      <select
        value={scenarioIdx}
        onChange={e => setScenarioIdx(Number(e.target.value))}
      >
        {scenarios.map((s, i) => (
          <option key={i} value={i}>{s.wind}</option>
        ))}
      </select>
      <div className="risk-outcome">{current.risk_label}</div>
    </section>
  );
}
