import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3-geo";

type Risk = "Green" | "Warning" | "Red";

const REGION_COLORS: Record<Risk, string> = {
  Green: "#22c55e",
  Warning: "#fbbf24",
  Red: "#ef4444",
};

type Feature = {
  type: "Feature";
  properties: Record<string, any>;
  geometry: any;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

export default function RegionMap({
  selectedRegion,
  regionData,
  viewMode,
  selectedCountry,
  onCountrySelect,
}: {
  selectedRegion: string;
  regionData: Record<string, { risk_zone: Risk }>;
  viewMode: "region" | "country";
  selectedCountry: string | null;
  onCountrySelect: (neCountryName: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 800, h: 560 });

  const [regions, setRegions] = useState<FeatureCollection | null>(null);
  const [countries, setCountries] = useState<FeatureCollection | null>(null);

  const [hoverName, setHoverName] = useState<string | null>(null);
  const [hoverXY, setHoverXY] = useState<[number, number] | null>(null);

  // Resize observer for responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(600, rect.width);
      const h = Math.max(520, Math.min(window.innerHeight * 0.65, 760));
      setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load geojson once
  useEffect(() => {
    const safeFetch = async (url: string) => {
      const res = await fetch(url);
      const txt = await res.text();
      if (!res.ok) throw new Error(`${url} HTTP ${res.status}: ${txt.slice(0, 200)}`);
      return JSON.parse(txt) as FeatureCollection;
    };
    let mounted = true;
    Promise.all([
      safeFetch("/data/regions.geojson"),
      safeFetch("/data/countries.geojson"),
    ])
      .then(([r, c]) => {
        if (!mounted) return;
        setRegions(r);
        setCountries(c);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error("GeoJSON load error:", e);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Region feature and countries filtered to region
  const regionFeature: Feature | null = useMemo(() => {
    if (!regions) return null;
    return regions.features.find((f) => f?.properties?.NAME === selectedRegion) || null;
  }, [regions, selectedRegion]);

  const regionCountries: FeatureCollection | null = useMemo(() => {
    if (!countries) return null;
    const feats = countries.features.filter(
      (f) => f?.properties?.CONTINENT === selectedRegion
    );
    return { type: "FeatureCollection", features: feats };
  }, [countries, selectedRegion]);

  // Projection and path generator that fits to region or country
  const { projection, path } = useMemo(() => {
    const proj = d3.geoNaturalEarth1(); // great-looking, compact projection
    const pth = d3.geoPath(proj);
    const pad = 20; // px padding
    const fitTo = (fc: FeatureCollection | null) => {
      if (!fc || fc.features.length === 0) {
        proj.fitExtent(
          [
            [pad, pad],
            [size.w - pad, size.h - pad],
          ],
          {
            type: "Sphere",
          } as any
        );
        return;
      }
      proj.fitExtent(
        [
          [pad, pad],
          [size.w - pad, size.h - pad],
        ],
        fc as any
      );
    };

    // Decide target to fit
    if (viewMode === "country" && selectedCountry && regionCountries) {
      const cf =
        regionCountries.features.find(
          (f) => f?.properties?.NAME === selectedCountry
        ) || null;
      if (cf) {
        fitTo({ type: "FeatureCollection", features: [cf] });
      } else {
        fitTo(regionFeature ? { type: "FeatureCollection", features: [regionFeature] } : null);
      }
    } else {
      fitTo(regionFeature ? { type: "FeatureCollection", features: [regionFeature] } : null);
    }

    return { projection: proj, path: pth };
  }, [size, regionFeature, regionCountries, viewMode, selectedCountry]);

  // Color for the selected region
  const regionRisk: Risk = (regionData[selectedRegion]?.risk_zone || "Warning") as Risk;
  const regionColor = REGION_COLORS[regionRisk];

  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden bg-white shadow relative"
      style={{
        height: "min(65vh, 760px)",
        minHeight: "560px",
        width: "100%",
        isolation: "isolate",
      }}
      onMouseLeave={() => {
        setHoverName(null);
        setHoverXY(null);
      }}
    >
      <svg width={size.w} height={size.h} role="img" aria-label="Migration map">
        {/* Light background */}
        <rect width={size.w} height={size.h} fill="#eef4f8" />

        {/* Region polygon outline and fill */}
        {regionFeature && (
          <>
            <path
              d={path(regionFeature) || ""}
              fill={viewMode === "region" ? regionColor : regionColor + "33"}
              stroke={regionColor}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          </>
        )}

        {/* Countries hit layer */}
        {regionCountries &&
          regionCountries.features.map((f) => {
            const d = path(f) || "";
            if (!d) return null;
            const name = f.properties?.NAME as string;
            const isSelected = viewMode === "country" && selectedCountry === name;
            return (
              <g key={name}>
                {/* Invisible hit area */}
                <path
                  d={d}
                  fill="#000"
                  fillOpacity={0}
                  onMouseMove={(e) => {
                    setHoverName(name);
                    setHoverXY([e.clientX, e.clientY]);
                  }}
                  onMouseOut={() => {
                    setHoverName(null);
                    setHoverXY(null);
                  }}
                  onClick={() => onCountrySelect(name)}
                  style={{ cursor: "pointer" }}
                />
                {/* Highlight if selected */}
                {isSelected && (
                  <>
                    <path d={d} fill={regionColor} fillOpacity={0.55} />
                    <path d={d} fill="none" stroke="#111827" strokeWidth={2} />
                  </>
                )}
              </g>
            );
          })}
      </svg>

      {/* Reset button */}
      <button
        onClick={() => onCountrySelect("")}
        className="absolute right-3 top-3 z-10 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1 shadow"
      >
        Reset view
      </button>

      {/* Tooltip */}
      {hoverName && hoverXY && (
        <div
          className="pointer-events-none text-white text-xs rounded-lg px-2 py-1 shadow"
          style={{
            position: "fixed",
            left: hoverXY[0] + 10,
            top: hoverXY[1] + 10,
            background: "rgba(17,24,39,0.92)",
            zIndex: 20,
          }}
        >
          {hoverName}
        </div>
      )}
    </div>
  );
}
