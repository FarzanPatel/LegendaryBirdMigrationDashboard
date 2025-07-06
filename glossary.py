
import streamlit as st

def glossary_popup():
    with st.expander("📘 Glossary"):
        st.markdown("""
        - **Migration**: Seasonal movement of birds.
        - **Forecasting**: Using models to predict future trends.
        - **Habitat**: Natural environment where birds live.
        - **Scenario**: A possible future event or situation.
        """)
