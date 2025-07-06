# ml_scenarios.py
import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def run_scenario_interface():
    scenarios = {
        "Climate Change Impact": climate_change_impact,
        "Land Use Change": land_use_change,
        "Light Pollution Effects": light_pollution_effects,
        "Wind Turbine Risk": wind_turbine_risk,
        "Deforestation Patterns": deforestation_patterns,
        "Urbanization Effects": urbanization_effects,
        "Conservation Strategy Outcomes": conservation_outcomes,
        "Migration Timing Shifts": migration_timing_shifts
    }

    selected = st.selectbox("Select a scenario to explore:", list(scenarios.keys()))
    st.markdown("---")
    scenarios[selected]()  # Run the selected scenario function

# Each scenario has its own interactive simulation
def climate_change_impact():
    temp_increase = st.slider("Projected temperature increase (°C)", 0.0, 5.0, 2.0)
    years = np.arange(2025, 2051)
    base = 1000
    decline = base * np.exp(-0.05 * temp_increase * (years - 2025)/5)
    plot_scenario(years, decline, "Bird Population vs Temperature Rise")

def land_use_change():
    urban_expansion = st.slider("Urban area expansion (%)", 0, 100, 30)
    years = np.arange(2025, 2051)
    impact = 1000 - (urban_expansion * (years - 2025) / 50)
    plot_scenario(years, impact, "Bird Population vs Urban Expansion")

def light_pollution_effects():
    brightness = st.slider("Average light pollution (lumens)", 0, 1000, 300)
    years = np.arange(2025, 2051)
    disruption = 1000 - (brightness * 0.3)
    disruption = np.clip(disruption, 100, 1000)
    plot_scenario(years, np.full_like(years, disruption), "Effect of Light Pollution on Birds")

def wind_turbine_risk():
    turbines = st.slider("Number of wind turbines", 0, 1000, 200)
    fatality_rate = 0.01  # 1% fatality per turbine unit
    years = np.arange(2025, 2051)
    loss = 1000 * (1 - fatality_rate * turbines / 1000)
    plot_scenario(years, np.full_like(years, loss), "Impact of Wind Turbines on Bird Populations")

def deforestation_patterns():
    forest_loss = st.slider("Annual forest loss rate (%)", 0, 10, 2)
    years = np.arange(2025, 2051)
    impact = 1000 * np.exp(-0.02 * forest_loss * (years - 2025))
    plot_scenario(years, impact, "Bird Population Decline from Deforestation")

def urbanization_effects():
    urban_density = st.slider("Urban density increase (%)", 0, 200, 50)
    years = np.arange(2025, 2051)
    reduction = 1000 * (1 - (urban_density / 300))
    reduction = np.clip(reduction, 200, 1000)
    plot_scenario(years, np.full_like(years, reduction), "Urbanization vs Bird Habitat")

def conservation_outcomes():
    funding = st.slider("Conservation funding (millions $)", 0, 500, 100)
    years = np.arange(2025, 2051)
    recovery = 800 + (funding / 5) * np.log1p(years - 2025)
    plot_scenario(years, recovery, "Recovery under Conservation Strategies")

def migration_timing_shifts():
    mismatch = st.slider("Days of migration timing mismatch", 0, 30, 10)
    years = np.arange(2025, 2051)
    effect = 1000 * np.exp(-0.01 * mismatch * (years - 2025))
    plot_scenario(years, effect, "Effects of Timing Mismatch on Survival")

def plot_scenario(x, y, title):
    fig, ax = plt.subplots()
    ax.plot(x, y, color='green', linewidth=2)
    ax.set_title(title)
    ax.set_xlabel("Year")
    ax.set_ylabel("Estimated Bird Population")
    ax.grid(True)
    st.pyplot(fig)
