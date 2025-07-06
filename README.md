# Legendary Bird Migration Dashboard

A Streamlit-powered interactive dashboard that visualizes bird migration patterns, simulates climate impacts, and tells AI-generated sustainability stories using real data.

## 🌟 Features

- 📈 ML Forecasts for bird populations
- 🎙️ AI Narration for each scenario (replaceable MP3s)
- ⚖️ Interactive Impact Simulation Panel
- 📚 Storytelling with infographics and visuals
- 🌐 Multilingual-ready and Accessibility-enhanced
- 🧑‍⚖️ Judge Mode for guided walkthrough
- 📘 Glossary, themes, and downloadable reports

## 🔧 Setup Instructions

1. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2. Launch the app:
    ```bash
    streamlit run app.py
    ```

3. Replace the placeholder narration files in the `audio/` folder with your own `.mp3` files:
    - `narration_overview.mp3`
    - `narration_forecast.mp3`
    - `narration_story.mp3`
    - `narration_impact.mp3`
    - `narration_innovation.mp3`
    - `narration_inclusivity.mp3`
    - `narration_engagement.mp3`
    - `narration_design.mp3`

## 📁 Folder Structure

```
├── app.py
├── audio/
│   └── narration_*.mp3
├── assets/
│   └── *.png
├── narrator.py
├── glossary.py
├── theming.py
├── translation.py
├── judge_mode.py
├── accessibility.py
├── requirements.txt
└── README.md
```