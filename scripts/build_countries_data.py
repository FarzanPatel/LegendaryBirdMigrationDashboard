# scripts/build_countries_data.py
import os, io, json, zipfile, hashlib, math, requests, random
import pandas as pd
import geopandas as gpd
import numpy as np
from rapidfuzz import process, fuzz

# ========= Paths =========
CSV_PATH = "../data_raw/Bird Migration Data Final Version.csv"  # Must contain listed columns below
OUTPUT_COUNTRIES_GEOJSON = "../public/data/countries.geojson"
OUTPUT_COUNTRY_SUMMARIES = "../public/data/country_summaries.json"

# ========= Required CSV columns =========
COL_COUNTRY = "StartCountryName"
COL_REGION = "StartRegion"
COL_MAX_ALT = "Max_Altitude_m"
COL_MIN_ALT = "Min_Altitude_m"
COL_MIG_START = "Migration_Start_Month"  # e.g., "Jan"
COL_MIG_END   = "Migration_End_Month"    # e.g., "Apr"

MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
MONTH_INDEX = {m:i for i,m in enumerate(MONTHS)}  # 0..11

# ========= Helpers =========
def ensure_dirs(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def download_natural_earth_countries():
    url = "https://naturalearth.s3.amazonaws.com/110m_cultural/ne_110m_admin_0_countries.zip"
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    z = zipfile.ZipFile(io.BytesIO(resp.content))
    shp_name = [n for n in z.namelist() if n.endswith(".shp")][0]
    tmp_dir = "tmp_ne_countries"
    os.makedirs(tmp_dir, exist_ok=True)
    z.extractall(tmp_dir)
    shp_path = os.path.join(tmp_dir, shp_name)
    gdf = gpd.read_file(shp_path).to_crs(epsg=4326)
    # Normalize name column
    for col in ["NAME_EN","ADMIN","NAME"]:
        if col in gdf.columns:
            gdf["NAME"] = gdf[col]
            break
    keep = [c for c in ["NAME","CONTINENT","geometry"] if c in gdf.columns]
    return gdf[keep]

def seed_from_text(text: str) -> int:
    return int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16) % (2**32 - 1)

def derive_risk_zone(min_alt: float, max_alt: float, region: str) -> str:
    span = max(0.0, float(max_alt) - float(min_alt))
    region = (region or "").lower()
    # Region-tuned thresholds for altitude span (meters)
    if "antarctica" in region:
        t1, t2 = 500, 1500
    elif "oceania" in region:
        t1, t2 = 700, 1700
    else:
        t1, t2 = 600, 1600
    if span <= t1: return "Green"
    if span <= t2: return "Warning"
    return "Red"

def monthly_curve_from_window(start_m: int, end_m: int, intensity: float, seed: int):
    """
    Build a 12-value monthly density focused between start and end months (inclusive),
    with smooth shoulders and optional wrap (e.g., Oct -> Feb).
    intensity in [0,1] scales overall magnitude.
    """
    rng = random.Random(seed)
    x = np.arange(12)

    # Convert to 0..11 indices and handle wrap
    s, e = start_m % 12, end_m % 12
    in_window = np.zeros(12, dtype=float)
    if s <= e:
        in_window[s:e+1] = 1.0
    else:
        in_window[s:12] = 1.0
        in_window[0:e+1] = 1.0

    # Create a bell-shaped weight centered around mid of the window
    if s <= e:
        mids = (s + e) / 2.0
        length = max(1, e - s + 1)
    else:
        length = (12 - s) + (e + 1)
        # approximate mid via circular mean
        mids = (s + (length/2.0)) % 12

    # Gaussian around mids, scaled to window, with soft shoulders
    width = max(1.2, length / 3.0)
    gauss = np.exp(-0.5 * ((x - mids) / width) ** 2)

    # Mask with window so tails fade outside
    weights = gauss * (0.25 + 0.75 * in_window)

    # Normalize and add small jitter
    weights = weights / (weights.max() + 1e-9)
    noise = np.array([rng.uniform(-0.06, 0.06) for _ in range(12)])
    weights = np.clip(weights + noise, 0, None)
    weights = weights / (weights.max() + 1e-9)

    # Scale base magnitude by intensity
    base = 80 + 270 * intensity   # overall magnitude
    monthly = (base * (0.35 + 0.65 * weights)).tolist()
    return [round(float(v), 1) for v in monthly]

def fuzzy_match_country(name, candidates, cutoff=75):
    if pd.isna(name) or not str(name).strip():
        return None, 0
    res = process.extractOne(str(name), candidates, scorer=fuzz.WRatio, score_cutoff=cutoff)
    if res:
        matched, score, _ = res
        return matched, score
    return None, 0

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

# ========= Main =========
def main():
    ensure_dirs(OUTPUT_COUNTRIES_GEOJSON)
    ensure_dirs(OUTPUT_COUNTRY_SUMMARIES)

    # Load world countries geometry
    print("Downloading Natural Earth countries…")
    ne = download_natural_earth_countries()
    ne_names = ne["NAME"].astype(str).tolist()

    # Load CSV
    print(f"Loading CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)

    # Validate required columns
    required = [COL_COUNTRY, COL_REGION, COL_MAX_ALT, COL_MIN_ALT, COL_MIG_START, COL_MIG_END]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"CSV missing required columns: {missing}")

    # Write full countries GeoJSON
    print(f"Writing {OUTPUT_COUNTRIES_GEOJSON}")
    ne.to_file(OUTPUT_COUNTRIES_GEOJSON, driver="GeoJSON")

    # Build summaries
    records = []
    for _, row in df.iterrows():
        country = str(row[COL_COUNTRY]).strip()
        region  = str(row[COL_REGION]).strip() if pd.notna(row[COL_REGION]) else ""

        # Altitudes
        try:
            max_alt = float(row[COL_MAX_ALT]) if pd.notna(row[COL_MAX_ALT]) else None
            min_alt = float(row[COL_MIN_ALT]) if pd.notna(row[COL_MIN_ALT]) else None
        except Exception:
            max_alt, min_alt = None, None

        if min_alt is None: min_alt = 0.0
        if max_alt is None: max_alt = 8000.0
        if max_alt < min_alt: max_alt, min_alt = min_alt, max_alt
        span = max(0.0, max_alt - min_alt)

        # Migration window
        s_raw = str(row[COL_MIG_START]).strip().title() if pd.notna(row[COL_MIG_START]) else "Jan"
        e_raw = str(row[COL_MIG_END]).strip().title() if pd.notna(row[COL_MIG_END]) else "Dec"
        s_idx = MONTH_INDEX.get(s_raw[:3], 0)
        e_idx = MONTH_INDEX.get(e_raw[:3], 11)

        # Derived fields
        risk_zone = derive_risk_zone(min_alt, max_alt, region)
        safe_build_height_m = int(round(clamp(min_alt * 0.15 + 120.0, 50.0, 400.0)))
        safe_flight_floor_m = int(round(clamp(max_alt - 200.0, 1500.0, 12000.0)))

        # Intensity from altitude span (200..2500 m -> 0..1)
        intensity = (span - 200.0) / (2500.0 - 200.0)
        intensity = clamp(intensity, 0.05, 1.0)

        seed = seed_from_text(country + "|" + region + "|" + s_raw + "-" + e_raw)
        monthly = monthly_curve_from_window(s_idx, e_idx, intensity, seed)
        migration_density = int(round(sum(monthly)))

        # Best months: top 2 months by density
        best_idxs = np.argsort(monthly)[-2:][::-1]
        best_months = sorted([int(best_idxs[0]) + 1, int(best_idxs[1]) + 1])

        # Join to NE name for map drilldown
        ne_match, ne_score = fuzzy_match_country(country, ne_names, cutoff=70)

        rec = {
            "country": country,
            "region": region,
            "risk_zone": risk_zone,
            "safe_build_height_m": safe_build_height_m,
            "safe_flight_floor_m": safe_flight_floor_m,
            "best_months": best_months,
            "migration_density": migration_density,
            "monthly_density": monthly,
            "ne_country_name": ne_match,
            "ne_match_score": int(ne_score)
        }
        records.append(rec)

    print(f"Writing {OUTPUT_COUNTRY_SUMMARIES}")
    with open(OUTPUT_COUNTRY_SUMMARIES, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    weak = [r for r in records if (r["ne_match_score"] or 0) < 70]
    if weak:
        print("\n[NOTE] Review low-confidence matches (edit 'ne_country_name' if needed):")
        for r in weak[:25]:
            print(f" - {r['country']} -> {r['ne_country_name']} (score {r['ne_match_score']})")
        if len(weak) > 25:
            print(f" ... and {len(weak)-25} more")

    print("\nDone.")
    print(f"- GeoJSON: {OUTPUT_COUNTRIES_GEOJSON}")
    print(f"- Country summaries: {OUTPUT_COUNTRY_SUMMARIES}")
    print("\nNext: wire per-country drilldown in the app using 'ne_country_name' to join with countries.geojson.")

if __name__ == "__main__":
    main()