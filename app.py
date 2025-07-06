# app.py (Legendary Dashboard Final)
import streamlit as st
from narrator import play_narration
from theming import select_theme, get_palette
from translation import select_language, t
from glossary import glossary_popup
from judge_mode import run_judge_walkthrough
from accessibility import alt_text, font_scaling, contrast_mode
from ml_scenarios import run_scenario_interface

# Configure the page
st.set_page_config(page_title="Legendary Bird Migration Dashboard", layout="wide")

# Phase 3: Final Polish Features
select_language()
select_theme()
font_scaling()
contrast_mode()
run_judge_walkthrough()

# Header and Intro
st.title(t("title"))
st.markdown(f"<h4>{t('intro')}</h4>", unsafe_allow_html=True)

# Migration Overview
st.subheader("🌍 Migration Overview")
st.image("assets/migration_map.png")
alt_text("Bird migration routes across North America")
play_narration("overview")

# ML Forecast Section
st.subheader(f"📈 {t('forecast')}")
st.image("assets/forecast_graph.png")
alt_text("ML forecast showing population trends by year")
play_narration("forecast")

# Storytelling Section
st.subheader(f"📚 {t('story')}")
st.image("assets/story_visual.png")
alt_text("Illustration of bird habitats and migration events")
play_narration("story")

# Impact Simulation
st.subheader(f"⚖️ {t('impact')}")
st.image("assets/impact_simulation.png")
alt_text("Sliders to test effects of temperature rise and land use")
play_narration("impact")

# Interactive ML Scenarios
st.subheader("🧪 Interactive ML Scenarios")
run_scenario_interface()

# Download Button
st.download_button(label=t("download"), data="Generated Report (demo)", file_name="report.pdf")

# Glossary Popup
glossary_popup()
