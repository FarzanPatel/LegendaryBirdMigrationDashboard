import { useEffect, useState } from "react";
import HeroHeader from "../components/HeroHeader";
import MigrationMap from "../components/MigrationMap";
import StatsCards from "../components/StatsCards";
import ScenarioPanel from "../components/ScenarioPanel";
import InsightsPanel from "../components/InsightsPanel";
import "../styles/legendary-theme.css";

export default function IndexPage() {
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({});
  const [scenarios, setScenarios] = useState([]);
  const [insights, setInsights] = useState([]);
  const [scenarioIdx, setScenarioIdx] = useState(0);

  useEffect(() => {
    fetch("/data/routes.geojson")
      .then(r => r.json()).then(data => {
        setRoutes(data.features.map(f => ({
          ...f.properties,
          start_lat: f.geometry.coordinates[0][1],
          start_long: f.geometry.coordinates[0][0],
          end_lat: f.geometry.coordinates[1][1],
          end_long: f.geometry.coordinates[1][0],
          risk: f.properties.Risk_Score || 0,
          species: f.properties.Species,
          region: f.properties.Region,
          disruption: f.properties.Interrupted_Reason || ""
        })));
      });
    fetch("/data/dashboard_stats.json").then(r=>r.json()).then(setStats);
    fetch("/data/scenarios.json").then(r=>r.json()).then(setScenarios);
    fetch("/data/insights.json").then(r=>r.json()).then(setInsights);
  }, []);

  return (
    <div>
      <HeroHeader stats={stats}/>
      <MigrationMap routes={routes}/>
      <StatsCards stats={stats}/>
      <ScenarioPanel
        scenarios={scenarios}
        scenarioIdx={scenarioIdx}
        setScenarioIdx={setScenarioIdx}
      />
      <InsightsPanel insights={insights} />
    </div>
  );
}
