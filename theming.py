
import streamlit as st

def select_theme():
    st.sidebar.selectbox("🎨 Theme", ["Light", "Dark", "Colorblind"])

def get_palette():
    return {"primary": "#377eb8", "secondary": "#4daf4a"}
