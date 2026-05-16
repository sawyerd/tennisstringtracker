import os
from gtts import gTTS
import config


def text_to_mp3(text: str, out_path: str) -> None:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    tts = gTTS(text=text, lang="en", slow=False)
    tts.save(out_path)
