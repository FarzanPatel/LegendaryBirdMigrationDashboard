import streamlit as st
from narrator import play_narration
from theming import select_theme, get_palette
from translation import select_language, t
from glossary import glossary_popup
from judge_mode import run_judge_walkthrough
from accessibility import alt_text, font_scaling, contrast_mode

def main():
    st.set_page_config(page_title="Legendary Bird Migration Dashboard", layout="wide")
    
    select_language()
    select_theme()
    font_scaling()
    contrast_mode()
    run_judge_walkthrough()
    
    st.title(t("title"))
    st.markdown(f"<h4>{t('intro')}</h4>", unsafe_allow_html=True)
    
    st.subheader("🌍 Migration Overview")
    st.image("assets/migration_map.png")
    alt_text("Bird migration routes across North America")
    play_narration("overview")
    
    st.subheader(f"📈 {t('forecast')}")
    st.image("assets/forecast_graph.png")
    alt_text("ML forecast showing population trends by year")
    play_narration("forecast")
    
    st.subheader(f"📚 {t('story')}")
    st.image("assets/story_visual.png")
    alt_text("Illustration of bird habitats and migration events")
    play_narration("story")
    
    st.subheader(f"⚖️ {t('impact')}")
    st.image("assets/impact_simulation.png")
    alt_text("Sliders to test effects of temperature rise and land use")
    play_narration("impact")
    
    st.subheader("📊 Scenario Explorer")
    st.image("assets/scenario_infographic.png")
    alt_text("Infographic showing 8 scenarios impacting bird migration")
    
    st.subheader("🧠 Judging Criteria Narratives")
    for section in ["innovation", "inclusivity", "engagement", "design"]:
        st.markdown(f"### {section.capitalize()}")
        play_narration(section)
    
    st.download_button(label=t("download"), data="Generated Report (demo)", file_name="report.pdf")
    
    glossary_popup()

if __name__ == "__main__":
    main()
