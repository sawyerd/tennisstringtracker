import os
import config
from weather import get_weather_message
from tts import text_to_mp3
from sonos import play_on_speaker


def run_announcement():
    print(f"Fetching weather for {config.CITY}...")
    message = get_weather_message(config.CITY)
    print(f"Message: {message}")

    mp3_path = os.path.join(config.TMP_DIR, "weather.mp3")
    print("Generating audio...")
    text_to_mp3(message, mp3_path)

    print(f"Playing on '{config.SPEAKER_NAME}'...")
    play_on_speaker(mp3_path, config.SPEAKER_NAME)
    print("Done.")


if __name__ == "__main__":
    run_announcement()
