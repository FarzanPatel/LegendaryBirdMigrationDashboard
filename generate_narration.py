from gtts import gTTS

# Your narration script text
narration_text = """
Welcome to the Bird Migration Dashboard, an interactive visualization designed to track and analyze global bird migration patterns.

Our core challenge is this: How can we identify optimal zones for future infrastructure development, improve existing infrastructure, and refine air traffic regulations by analyzing bird migration patterns in relation to environmental factors? These factors include habitat preferences, flight altitudes, wind speeds, visibility conditions, and air pressure.

By understanding these variables and their influence on migration routes, we aim to minimize potential conflicts between bird migrations and human activities such as construction and aviation.

The map presents detailed migration routes, showing the paths birds take between their starting and ending locations. This visual helps us pinpoint critical corridors and zones frequently used by various species.

The accompanying bird list details each species’ migration reasons and the environmental conditions they encounter or prefer, giving insight into how habitat and weather directly affect their journeys.

From this analysis, we gain valuable insights into how specific environmental factors shape migration patterns, allowing planners and policymakers to make informed decisions.

Ultimately, this dashboard serves as a vital tool for researchers, conservationists, urban planners, and aviation authorities to work together in protecting migratory birds while balancing human development and safety.

Thank you for exploring the Bird Migration Dashboard. Together, we can promote coexistence between nature’s incredible migrations and our growing infrastructures.
"""

# Create TTS object and save as mp3
tts = gTTS(text=narration_text, lang='en', slow=False)
tts.save("./public/audio/bird_migration_narration.mp3")

print("MP3 narration file generated successfully!")
