import { useState, useEffect } from "react";
import RegionMap from "../components/RegionMap";
import RegionDropdown from "../components/RegionDropdown";
import LegendBar from "../components/LegendBar";
import InfoPanel from "../components/InfoPanel";

export default function Home() {
  const [regionData, setRegionData] = useState<Record<string, any>>({});
  const [regions, setRegions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("Africa");
  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    fetch("/data/region_summaries.json")
      .then(res => res.json())
      .then((data: any[]) => {
        setRegionData(Object.fromEntries(data.map(d => [d.region, d])));
        setRegions(data.map(d => d.region));
        setSelected(data[0]?.region || "Africa");
      });
  }, []);

  useEffect(() => {
    setCurrent(regionData[selected]);
  }, [regionData, selected]);

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Legendary Bird Migration Dashboard</h1>
      <div className="text-lg mb-2 text-gray-500">
        Pick a region to view migration impacts, safe construction height, flying floor, and optimal construction months. 🌍
      </div>
      <LegendBar />
      <RegionDropdown regions={regions} selected={selected} onChange={setSelected} />
      <div className="flex flex-col md:flex-row gap-8 mt-2">
        <div className="flex-1">
          <RegionMap selectedRegion={selected} regionData={regionData} />
        </div>
        <div className="flex-1">
          <InfoPanel data={current} />
        </div>
      </div>
    </main>
  );
}
