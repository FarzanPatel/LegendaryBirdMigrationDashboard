import pandas as pd
import numpy as np
import json

# -------------- CONFIG (edit as needed) --------------

RAW_CSV = "../data_raw/Bird Migration Data Final Version.csv"   # Update!
OUT_JSON = "../public/data/region_summaries.json"

MIN_ALT = "Min_Altitude_m"
MAX_ALT = "Max_Altitude_m"

MONTH_MAP = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
}

def months_in_window(start_month_str, end_month_str):
    """Convert month string values to a wrapped month list."""
    if pd.isnull(start_month_str) or pd.isnull(end_month_str):
        return []
    start_month = MONTH_MAP.get(str(start_month_str).strip()[:3])
    end_month = MONTH_MAP.get(str(end_month_str).strip()[:3])
    if not start_month or not end_month:
        return []
    if end_month >= start_month:
        return list(range(start_month, end_month + 1))
    else:
        return list(range(start_month, 13)) + list(range(1, end_month + 1))

df = pd.read_csv(RAW_CSV)

result = []

for region, region_group in df.groupby("StartRegion"):
    migration_density = len(region_group)
    min_alts = region_group[MIN_ALT].dropna()
    max_alts = region_group[MAX_ALT].dropna()

    safe_build = int(np.percentile(min_alts, 10)) if len(min_alts) > 0 else 0
    safe_flight = int(np.percentile(max_alts, 90)) if len(max_alts) > 0 else 0

    # Sum monthly presence by expanding windows
    monthly_density = [0 for _ in range(12)]
    for _, row in region_group.iterrows():
        months = months_in_window(row.get("Migration_Start_Month"), row.get("Migration_End_Month"))
        for m in months:
            monthly_density[m-1] += 1

    if migration_density <= 250:
        risk_zone = "Green"
    elif migration_density <= 750:
        risk_zone = "Warning"
    else:
        risk_zone = "Red"

    min_density = min(monthly_density)
    best_months = [i+1 for i, val in enumerate(monthly_density) if val == min_density]

    result.append({
        "region": region,
        "risk_zone": risk_zone,
        "safe_build_height_m": safe_build,
        "safe_flight_floor_m": safe_flight,
        "migration_density": int(migration_density),
        "best_months": best_months,
        "monthly_density": [int(x) for x in monthly_density]
    })

with open(OUT_JSON, "w") as f:
    json.dump(result, f, indent=2)

print(f"Done! {OUT_JSON} generated with {len(result)} regions.")