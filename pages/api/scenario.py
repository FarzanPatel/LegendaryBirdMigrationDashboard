from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import os

app = FastAPI()

@app.post("/api/scenario")
async def scenario(request: Request):
    df = pd.read_json(os.path.join(os.path.dirname(__file__), '../../public/data/bird_migration_clean.json'))
    # Ensure model is trained on deployment
    features = ['Min_Altitude_m','Wind_Speed_kmph','Visibility_km','Predator_Sightings']
    X = df[features]
    y = (df['Risk_Score'] >= 3).astype(int)
    model = RandomForestClassifier(n_estimators=30, random_state=42)
    model.fit(X, y)
    # Parse scenario input (infra, wind), turn into features for demo
    body = await request.json()
    infra = int(body.get("infra",0))
    wind = body.get("wind","Normal")
    # Simulate parameters; for demo only
    test_point = [[120, df['Wind_Speed_kmph'].mean() + (10 if wind=="High Winds" else 0), 8, 1]]
    risk = model.predict(test_point)[0]
    risk_label = "🟥 High Risk" if risk else "🟩 Low Risk"
    return JSONResponse(content={"risk": int(risk), "risk_label": risk_label})
