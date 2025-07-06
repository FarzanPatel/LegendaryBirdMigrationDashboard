
import streamlit as st

def select_language():
    st.sidebar.selectbox("🌐 Language", ["English"])

def t(key):
    dictionary = {
        "title": "Legendary Bird Migration Dashboard",
        "intro": "Explore how bird populations shift with environmental change.",
        "forecast": "Forecasting Bird Populations",
        "story": "ML-Powered Sustainability Stories",
        "impact": "Impact Simulation Panel",
        "download": "Download Report"
    }
    return dictionary.get(key, key)
