export default function RegionDropdown({ regions, selected, onChange }: {
  regions: string[];
  selected: string;
  onChange: (region: string) => void;
}) {
  return (
    <select
      className="border border-gray-300 rounded px-3 py-2 mb-2 text-base"
      value={selected}
      onChange={e => onChange(e.target.value)}
      aria-label="Select region"
    >
      {regions.map(region => (
        <option key={region} value={region}>{region}</option>
      ))}
    </select>
  );
}
