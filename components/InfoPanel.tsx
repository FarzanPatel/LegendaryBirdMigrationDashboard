export default function InfoPanel({ data }: { data: any }) {
  if (!data) return null;

  // Helper to show best months as names
  const getMonthNames = (monthNums: number[] = []) =>
    monthNums
      .map(m => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1])
      .join(", ");

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 min-w-[320px]">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-xl font-semibold">{data.region}</span>
        <span className="rounded px-3 py-1 text-white text-base"
          style={{
            background: data.risk_zone === "Green" ? "#22c55e" : data.risk_zone === "Warning" ? "#fbbf24" : "#ef4444"
          }}>{data.risk_zone}</span>
      </div>
      <div className="mb-3 text-sm leading-relaxed">
        <b>Safe Building Height:</b> {data.safe_build_height_m} m<br />
        <b>Safe Flight Floor:</b> {data.safe_flight_floor_m} m<br />
        <b>Best Construction Months:</b> {getMonthNames(data.best_months)}<br />
        <b>Migration Density:</b> {data.migration_density}
      </div>
      <div>
        <div className="text-sm mb-1">Seasonality</div>
        <div className="grid grid-cols-12 items-end gap-1 h-12 mb-2">
          {data.monthly_density && data.monthly_density.map((d: number, i: number) => (
            <div key={i} style={{
              width: "100%",
              height: Math.max(8, d / Math.max(...data.monthly_density, 1) * 45),
              background: data.best_months?.includes(i + 1) ? "#22c55e" : "#d1d5db",
              borderRadius: 2,
              transition: "background 0.3s"
            }}></div>
          ))}
        </div>
        <div className="grid grid-cols-12 text-xs text-gray-500">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
            <span key={m} className="text-center">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
