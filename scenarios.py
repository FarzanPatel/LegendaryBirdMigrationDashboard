import streamlit as st

def climate_change_scenario():
    st.markdown("### Climate Change Impact")
    temp_increase = st.slider("Temperature Increase (°C)", 0.0, 5.0, 1.0)
    st.write(f"Projected migration shift: {temp_increase * 150:.0f} km northward")

def deforestation_scenario():
    st.markdown("### Deforestation Impact")
    forest_loss = st.slider("Forest Area Lost (%)", 0, 100, 20)
    st.write(f"Estimated habitat loss: {forest_loss * 1000} sq km")

def urbanization_scenario():
    st.markdown("### Urbanization Pressure")
    urban_growth = st.slider("Urban Growth Rate (%)", 0, 10, 3)
    st.write(f"Migration route disruption risk: {urban_growth * 10}%")

def pollution_scenario():
    st.markdown("### Pollution Exposure")
    pollution_index = st.slider("Pollution Index (0–100)", 0, 100, 40)
    st.write(f"Affected nesting success: {100 - pollution_index}%")

def wind_turbines_scenario():
    st.markdown("### Wind Turbines Expansion")
    turbines_built = st.slider("New Turbines", 0, 5000, 1000)
    st.write(f"Collision risk index: {turbines_built / 50:.1f}")

def drought_scenario():
    st.markdown("### Drought Frequency")
    drought_events = st.slider("Drought Events per Decade", 0, 20, 5)
    st.write(f"Reduced wetland availability: {drought_events * 2}%")

def sea_level_rise_scenario():
    st.markdown("### Sea Level Rise")
    sea_level_cm = st.slider("Rise in cm", 0, 100, 20)
    st.write(f"Coastal nesting site loss: {sea_level_cm}%")

def wildfire_scenario():
    st.markdown("### Wildfire Spread")
    fire_risk_index = st.slider("Fire Risk Index (0–100)", 0, 100, 30)
    st.write(f"Forest degradation: {fire_risk_index}%")