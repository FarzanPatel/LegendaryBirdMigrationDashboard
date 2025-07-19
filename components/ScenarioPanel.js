import { useState } from "react";

export default function ScenarioPanel({ onSimulate, scenarioResult }) {
  const [infra, setInfra] = useState(0);
  const [wind, setWind] = useState("Normal");
  return (
    <section>
      <h4>Scenario Simulator</h4>
      <label>Infrastructure Count</label>
      <input type="range" min={0} max={10} value={infra} onChange={e=>setInfra(Number(e.target.value))}/>
      <label>Wind Pattern</label>
      <select value={wind} onChange={e=>setWind(e.target.value)}>
        <option>Normal</option>
        <option>High Winds</option>
      </select>
      <button onClick={() => onSimulate(infra,wind)}>Simulate</button>
      {scenarioResult && <div className="risk-outcome">{scenarioResult}</div>}
    </section>
  );
}
