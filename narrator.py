
import streamlit as st
import os

def play_narration(name):
    audio_path = f"audio/narration_{name}.mp3"
    if os.path.exists(audio_path):
        st.audio(audio_path)
    else:
        st.warning(f"No narration file found for '{name}'")
