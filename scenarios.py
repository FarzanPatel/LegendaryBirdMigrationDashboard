# ml_scenarios.py
import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def run_scenario_interface():
    st.header("🧠 Interactive ML Scenarios")

    with st.expander("1. 🌡️ Climate Change Impact"):
        temp_rise = st.slider("Projected Temperature Rise (°C)", 0.0, 5.0, 1.5, 0.1)
        migration_shift = np.clip(temp_rise * 12, 0, 60)
        st.write(f"Expected migration timing shift: **{migration_shift:.1f} days earlier**")

    with st.expander("2. 🌾 Land Use Change"):
        habitat_loss = st.slider("% Habitat Loss", 0, 100, 30)
        pop_decline = np.clip(habitat_loss * 0.8, 0, 100)
        st.write(f"Estimated population decline: **{pop_decline:.1f}%**")

    with st.expander("3. 💡 Light Pollution Effects"):
        light_index = st.slider("Light Pollution Index (0-100)", 0, 100, 40)
        navigation_error = np.clip(light_index * 0.6, 0, 100)
        st.write(f"Navigation disruption index: **{navigation_error:.1f}%**")

    with st.expander("4. 🌬️ Wind Turbine Risk"):
        turbine_density = st.slider("Turbines per 100 sq.km", 0, 100, 15)
        collision_risk = np.clip(turbine_density * 1.1, 0, 100)
        st.write(f"Estimated collision risk: **{collision_risk:.1f}%**")

    with st.expander("5. 🌲 Deforestation Patterns"):
        forest_loss = st.slider("Forest Cover Loss (%)", 0, 100, 20)
        breeding_disruption = np.clip(forest_loss * 0.9, 0, 100)
        st.write(f"Breeding disruption likelihood: **{breeding_disruption:.1f}%**")

    with st.expander("6. 🏙️ Urbanization Effects"):
        urban_expansion = st.slider("Urban Expansion (%)", 0, 100, 25)
        displacement_index = np.clip(urban_expansion * 0.7, 0, 100)
        st.write(f"Bird displacement index: **{displacement_index:.1f}%**")

    with st.expander("7. 🛡️ Conservation Strategy Outcomes"):
        funding = st.slider("Conservation Funding ($M)", 0, 100, 20)
        protected_growth = np.clip(funding * 1.5, 0, 100)
        st.write(f"Expected protected population increase: **{protected_growth:.1f}%**")

    with st.expander("8. 📅 Migration Timing Shifts"):
        avg_temp_change = st.slider("Average Temp Change (°C)", -2.0, 5.0, 1.2, 0.1)
        timing_change = np.clip(avg_temp_change * 10, -20, 50)
        direction = "earlier" if timing_change > 0 else "later"
        st.write(f"Migration expected **{abs(timing_change):.1f} days {direction}**")
