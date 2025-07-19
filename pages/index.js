import { useState, useEffect } from "react";
import HeroHeader from "../components/HeroHeader";
import MigrationMap from "../components/MigrationMap";
import StatsCards from "../components/StatsCards";
import ScenarioPanel from "../components/ScenarioPanel";
import InsightsPanel from "../components/InsightsPanel";
import styles from "../styles/legendary-theme.css";

export default function IndexPage() {
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({});
  const [insights, setInsights] = useState([]);
  const [scenarioResult, setScenarioResult] = useState("");

  // Load migration routes once
  useEffect(() => {
    fetch("/data/routes.geojson")
      .then((r) => r.json())
      .then((data) => {
        // Flatten features to { ...properties, ...flattened geo, ... }
        const mapped = data.features.map(f => ({
          ...f.properties,
          start_lat: f.geometry.coordinates[0][1],
          start_long: f.geometry.coordinates[0][0],
          end_lat: f.geometry.coordinates[1][1],
          end_long: f.geometry.coordinates[1][0],
          risk: f.properties.Risk_Score || 0,
          species: f.properties.Species,
          disruption: f.properties.Interrupted_Reason || "None",
        }));
        setRoutes(mapped);
      });
  }, []);

  // Fetch key stats from backend
  useEffect(() => {
    fetch("/api/stats").then(res => res.json()).then(setStats);
  }, []);

  // Fetch insights (simulate narrative)
  useEffect(() => {
    // Simple local fallback; you'd use /api/stats or local JS for narrative
    setInsights([
      `Birds shown: ${stats.birds_shown || 0}`,
      `High-risk segments: ${stats.high_risk_segments || 0}`
    ]);
  }, [stats]);

  // Scenario handler (simulate infra/wind change)
  async function handleScenario(infra, wind) {
    const res = await fetch("/api/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ infra, wind })
    });
    const data = await res.json();
    setScenarioResult(data.risk_label);
  }

  return (
    <div>
      <HeroHeader stats={stats} />
      <MigrationMap routes={routes} />
      <StatsCards stats={stats} />
      <ScenarioPanel onSimulate={handleScenario} scenarioResult={scenarioResult} />
      <InsightsPanel insights={insights} />
    </div>
  );
}
