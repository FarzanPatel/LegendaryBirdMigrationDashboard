import { useEffect, useState } from "react";
import RegionMap from "../components/RegionMap";
import RegionDropdown from "../components/RegionDropdown";
import LegendBar from "../components/LegendBar";
import InfoPanel from "../components/InfoPanel";

type Summary = {
  region?: string;
  country?: string;
  risk_zone: "Green" | "Warning" | "Red";
  safe_build_height_m: number | null;
  safe_flight_floor_m: number | null;
  best_months: number[];
  migration_density: number;
  monthly_density: number[];
  ne_country_name?: string;
};

export default function Home() {
  const [regionData, setRegionData] = useState<Record<string, Summary>>({});
  const [countryData, setCountryData] = useState<Record<string, Summary>>({});
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("Africa");

  const [viewMode, setViewMode] = useState<"region" | "country">("region");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // NE country name

  useEffect(() => {
    // Regions
    fetch("/data/region_summaries.json")
      .then(r => r.json())
      .then((arr: any[]) => {
        const byName: Record<string, Summary> = {};
        arr.forEach(d => { byName[d.region] = d; });
        setRegionData(byName);
        setRegions(arr.map(d => d.region));
        if (arr[0]?.region) setSelectedRegion(arr.region);
      })
      .catch(() => {});
    // Countries
    fetch("/data/country_summaries.json")
      .then(r => r.json())
      .then((arr: any[]) => {
        const byNE: Record<string, Summary> = {};
        arr.forEach((d: any) => {
          if (d.ne_country_name) byNE[d.ne_country_name] = d;
        });
        setCountryData(byNE);
      })
      .catch(() => {});
  }, []);

  // Reset to region view when region changes
  useEffect(() => {
    setViewMode("region");
    setSelectedCountry(null);
  }, [selectedRegion]);

  const currentInfo: Summary | null =
    viewMode === "country" && selectedCountry && countryData[selectedCountry]
      ? countryData[selectedCountry]
      : regionData[selectedRegion] || null;

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Legendary Bird Migration Dashboard</h1>
      <div className="text-lg mb-2 text-gray-500">
        Pick a region to view migration impacts, then click a country to drill down. 🌍
      </div>
      <LegendBar />
      <RegionDropdown regions={regions} selected={selectedRegion} onChange={setSelectedRegion} />

      {viewMode === "country" && selectedCountry && (
        <div className="my-2">
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => { setViewMode("region"); setSelectedCountry(null); }}
          >
            ← Back to {selectedRegion}
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 mt-2">
        <div className="flex-1">
          <RegionMap
            selectedRegion={selectedRegion}
            regionData={regionData}
            viewMode={viewMode}
            selectedCountry={selectedCountry}
            onCountrySelect={(neName) => {
              setSelectedCountry(neName);
              setViewMode("country");
            }}
          />
        </div>
        <div className="flex-1">
          <InfoPanel data={currentInfo} />
        </div>
      </div>
    </main>
  );
}
