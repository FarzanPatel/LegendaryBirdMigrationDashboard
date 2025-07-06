
import streamlit as st

def alt_text(description):
    st.caption(f"🔎 {description}")

def font_scaling():
    st.sidebar.slider("🔠 Font Size", 80, 140, 100)

def contrast_mode():
    st.sidebar.checkbox("♿ High Contrast Mode")
