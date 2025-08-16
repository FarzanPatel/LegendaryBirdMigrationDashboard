import pandas as pd
import geojson
from shapely.geometry import MultiPoint, mapping
import json

RAW_CSV = "../data_raw/Bird Migration Data Final Version.csv"   # update as needed
OUT_GEOJSON = "../public/data/regions.geojson"

df = pd.read_csv(RAW_CSV)
region_features = []

for region, group in df.groupby("StartRegion"):
    points = list(zip(group["Start_Longitude"], group["Start_Latitude"]))
    if len(points) < 3:
        # Fallback to small buffer point
        from shapely.geometry import Point
        poly = Point(points[0]).buffer(1)  # degree buffer
    else:
        poly = MultiPoint(points).convex_hull
    region_features.append(geojson.Feature(
        geometry=mapping(poly),
        properties={"NAME": region}
    ))

feature_collection = geojson.FeatureCollection(region_features)
with open(OUT_GEOJSON, "w") as f:
    geojson.dump(feature_collection, f)
print(f"GeoJSON written to {OUT_GEOJSON}")