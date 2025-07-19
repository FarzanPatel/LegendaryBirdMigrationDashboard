from fastapi import FastAPI
from fastapi.responses import JSONResponse
import pandas as pd
import os

app = FastAPI()

@app.get("/api/stats")
def stats():
    df = pd.read_json(os.path.join(os.path.dirname(__file__), '../../public/data/bird_migration_clean.json'))
    out = {
        "birds_shown": int(df['Bird_ID'].nunique()),
        "high_risk_segments": int((df['Risk_Score'] >= 3).sum()),
        "distinct_species": int(df['Species'].nunique()),
        "migration_success_rate": f"{(df['Migration_Success']=='Yes').mean():.1%}",
    }
    return JSONResponse(content=out)
