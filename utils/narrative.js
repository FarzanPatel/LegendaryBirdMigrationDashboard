// utils/narrative.js

/**
 * Generate narrative from migration data (array of routes).
 * Usage: getNarrative(routes) → string[]
 */
export function getNarrative(data) {
  if (!data || data.length === 0) {
    return ["No migration data in current view."];
  }

  // Compute average risk
  const avgRisk = (data.reduce((acc, d) => acc + (d.risk || d.Risk_Score || 0), 0) / data.length).toFixed(2);

  // Top species
  const sCount = {};
  data.forEach(d => {
    const s = d.species || d.Species || "Unknown";
    sCount[s] = sCount[s] || { risk: 0, count: 0 };
    sCount[s].risk += d.risk || d.Risk_Score || 0;
    sCount[s].count += 1;
  });
  const [topSpecies, topSpeciesStat] = Object.entries(sCount)
    .map(([species, obj]) => [species, obj.risk / obj.count])
    .sort((a, b) => b[1] - a[1])[0] || ["None", 0];

  // Most common migration region
  const regCount = {};
  data.forEach(d => {
    const reg = d.region || d.Region || "Unknown";
    regCount[reg] = (regCount[reg] || 0) + 1;
  });
  const [topRegion] = Object.entries(regCount).sort((a, b) => b[1] - a[1])[0] || ["None"];

  // Most common interruption reason
  const disCount = {};
  data.forEach(d => {
    const reason = d.disruption || d.Interrupted_Reason || "None";
    disCount[reason] = (disCount[reason] || 0) + 1;
  });
  const [topDisruption] = Object.entries(disCount).sort((a, b) => b[1] - a[1])[0] || ["None"];

  return [
    `Average risk score: ${avgRisk}`,
    `Highest risk species: ${topSpecies}`,
    `Most common migration region: ${topRegion}`,
    topDisruption !== "None" ? `Top reason for interruption: ${topDisruption}` : null
  ].filter(Boolean);
}
