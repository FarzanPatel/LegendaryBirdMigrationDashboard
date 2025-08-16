const riskColor: Record<string, string> = {
  Green: "#22c55e",
  Warning: "#fbbf24",
  Red: "#ef4444"
};
export default function LegendBar() {
  return (
    <div className="flex gap-6 items-center text-base mb-2 mt-2">
      <span>Legend:</span>
      {["Green", "Warning", "Red"].map(zone => (
        <span key={zone} className="flex items-center gap-2">
          <span
            className="inline-block"
            style={{
              width: 18,
              height: 10,
              background: riskColor[zone],
              borderRadius: 5
            }}
          />
          {zone}
        </span>
      ))}
    </div>
  );
}
