// pages/index.tsx
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
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const [viewMode, setViewMode] = useState<"region" | "country">("region");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // NE country name

  useEffect(() => {
    const load = async () => {
      try {
        // Regions
        const r1 = await fetch("/data/region_summaries.json");
        const regionArr: any[] = await r1.json();
        const byName: Record<string, Summary> = {};
        regionArr.forEach((d) => { if (d?.region) byName[d.region] = d; });
        setRegionData(byName);

        const regionList = regionArr.map((d) => d.region).filter(Boolean);
        setRegions(regionList as string[]);
        if (!selectedRegion && regionList.length > 0) {
          setSelectedRegion(regionList[0] as string);
        }

        // Countries
        const r2 = await fetch("/data/country_summaries.json");
        const countryArr: any[] = await r2.json();
        const byNE: Record<string, Summary> = {};
        countryArr.forEach((d: any) => {
          if (d?.ne_country_name) byNE[d.ne_country_name] = d;
        });
        setCountryData(byNE);
      } catch {
        // ignore network errors for now
      }
    };
    load();
  }, []); // end useEffect

  // Reset to region view when region changes
  useEffect(() => {
    setViewMode("region");
    setSelectedCountry(null);
  }, [selectedRegion]);

  const currentInfo: Summary | null =
    viewMode === "country" && selectedCountry && countryData[selectedCountry]
      ? countryData[selectedCountry]
      : selectedRegion
      ? regionData[selectedRegion] || null
      : null;

  return (
    <main className="max-w-6xl md:max-w-7xl mx-auto p-6 md:p-8">
      <h1 className="text-4xl font-bold mb-2">Legendary Bird Migration Dashboard</h1>
      <div className="text-lg mb-3 text-gray-500">
        Pick a region to view migration impacts, then click a country to drill down. 🌍
      </div>

      <LegendBar />

      <div className="mt-2 mb-3">
        <RegionDropdown
          regions={regions}
          selected={selectedRegion || ""}
          onChange={(val) => setSelectedRegion(val)}
        />
      </div>

      {viewMode === "country" && selectedCountry && (
        <div className="my-2">
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => {
              setViewMode("region");
              setSelectedCountry(null);
            }}
          >
            ← Back to {selectedRegion}
          </button>
        </div>
      )}

      {/* Layout: RegionMap larger, InfoPanel narrower, side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-2 items-start">
        <div className="lg:col-span-3">
          <RegionMap
            selectedRegion={selectedRegion || regions[0] || "Africa"}
            regionData={regionData}
            viewMode={viewMode}
            selectedCountry={selectedCountry}
            onCountrySelect={(neName) => {
              setSelectedCountry(neName);
              setViewMode("country");
            }}
          />
        </div>

        <div className="lg:col-span-2">
          <InfoPanel data={currentInfo} />
        </div>
      </div>
    </main>
  );
}
