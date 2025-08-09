import pandas as pd
import json

# Load CSV
csv_file = "Bird Migration Data Final Version.csv"  # Replace with path to your file
df = pd.read_csv(csv_file)

# Zone classification function
def classify_zone(alt):
    if alt > 750:
        return "Red"
    elif alt > 400:
        return "Warning"
    else:
        return "Green"

# Apply zone classification based on Max_Altitude_m
df["Zone"] = df["Max_Altitude_m"].apply(classify_zone)

# Create JSON-friendly structure
bird_data = []
for _, row in df.iterrows():
    bird_data.append({
        "Bird_ID": row["Bird_ID"],
        "Species": row["Species"],
        "Habitat": row["Habitat"],
        "Weather_Condition": row["Weather_Condition"],
        "Migration_Reason": row["Migration_Reason"],
        "Start": {
            "Latitude": row["Start_Latitude"],
            "Longitude": row["Start_Longitude"],
            "Country": row["StartCountryName"],
            "Region": row["StartRegion"]
        },
        "End": {
            "Latitude": row["End_Latitude"],
            "Longitude": row["End_Longitude"],
            "Country": row["EndCountryName"],
            "Region": row["EndRegion"]
        },
        "Flight_Distance_km": row["Flight_Distance_km"],
        "Flight_Duration_hours": row["Flight_Duration_hours"],
        "Average_Speed_kmph": row["Average_Speed_kmph"],
        "Max_Altitude_m": row["Max_Altitude_m"],
        "Min_Altitude_m": row["Min_Altitude_m"],
        "Temperature_C": row["Temperature_C"],
        "Wind_Speed_kmph": row["Wind_Speed_kmph"],
        "Humidity_%": row["Humidity_%"],
        "Pressure_hPa": row["Pressure_hPa"],
        "Visibility_km": row["Visibility_km"],
        "Migration_Start_Month": row["Migration_Start_Month"],
        "Migration_End_Month": row["Migration_End_Month"],
        "Zone": row["Zone"]  # Safe altitude classification
    })

# Save JSON
output_path = "public/data/bird_migration.json"
with open(output_path, "w") as f:
    json.dump(bird_data, f, indent=2)

print(f"bird_migration.json saved to {output_path}")