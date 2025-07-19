import dynamic from "next/dynamic";
import HeroHeader from "../components/HeroHeader";
import StatsCards from "../components/StatsCards";
import ScenarioPanel from "../components/ScenarioPanel";
import InsightsPanel from "../components/InsightsPanel";
import "../styles/legendary-theme.css";

// ONLY load the map client-side:
const MigrationMap = dynamic(() => import("../components/MigrationMap"), { ssr: false });

export default function IndexPage() {
  // ... your useStates and useEffects
  return (
    <div>
      <HeroHeader stats={stats}/>
      {/* No map logic/imports except for this dynamic: */}
      <MigrationMap routes={routes} />
      <StatsCards stats={stats}/>
      <ScenarioPanel scenarios={scenarios} scenarioIdx={scenarioIdx} setScenarioIdx={setScenarioIdx}/>
      <InsightsPanel insights={insights} />
    </div>
  );
}
