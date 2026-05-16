import os
import socket
import threading
import time
import functools
from http.server import HTTPServer, SimpleHTTPRequestHandler
import soco
import config


def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    finally:
        s.close()


def find_speaker(name: str):
    devices = soco.discover(timeout=10)
    if not devices:
        raise RuntimeError("No Sonos speakers found on the network.")
    speaker = next((d for d in devices if d.player_name == name), None)
    if speaker is None:
        names = [d.player_name for d in devices]
        raise RuntimeError(
            f"Speaker '{name}' not found. Available speakers: {names}"
        )
    return speaker


def play_on_speaker(mp3_path: str, speaker_name: str) -> None:
    speaker = find_speaker(speaker_name)

    directory = os.path.dirname(os.path.abspath(mp3_path))
    filename = os.path.basename(mp3_path)
    handler = functools.partial(SimpleHTTPRequestHandler, directory=directory)

    # Suppress HTTP server request logs
    class QuietHandler(handler):
        def log_message(self, format, *args):
            pass

    server = HTTPServer(("", config.HTTP_PORT), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        local_ip = get_local_ip()
        uri = f"http://{local_ip}:{config.HTTP_PORT}/{filename}"
        speaker.play_uri(uri)

        # Wait for playback to finish
        time.sleep(2)  # Give the speaker time to transition to PLAYING
        while True:
            info = speaker.get_current_transport_info()
            state = info.get("current_transport_state", "")
            if state in ("STOPPED", "NO_MEDIA_PRESENT"):
                break
            time.sleep(1)
    finally:
        server.shutdown()
