import requests
import config

WEATHER_CODES = {
    0: "clear skies",
    1: "mostly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "foggy",
    48: "freezing fog",
    51: "light drizzle",
    53: "drizzle",
    55: "heavy drizzle",
    61: "light rain",
    63: "rain",
    65: "heavy rain",
    71: "light snow",
    73: "snow",
    75: "heavy snow",
    77: "snow grains",
    80: "rain showers",
    81: "heavy rain showers",
    82: "violent rain showers",
    85: "snow showers",
    86: "heavy snow showers",
    95: "thunderstorms",
    96: "thunderstorms with hail",
    99: "severe thunderstorms with hail",
}


def geocode(city: str) -> tuple[float, float, str]:
    resp = requests.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": city, "count": 1, "language": "en", "format": "json"},
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json().get("results")
    if not results:
        raise ValueError(f"City not found: {city}")
    r = results[0]
    return r["latitude"], r["longitude"], r["timezone"]


def get_forecast(lat: float, lon: float, timezone: str) -> dict:
    resp = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,weather_code,wind_speed_10m",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
            "temperature_unit": config.TEMPERATURE_UNIT,
            "wind_speed_unit": config.WIND_SPEED_UNIT,
            "timezone": timezone,
            "forecast_days": 1,
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def build_message(city: str, data: dict) -> str:
    current = data["current"]
    daily = data["daily"]

    temp = round(current["temperature_2m"])
    wind = round(current["wind_speed_10m"])
    code = current["weather_code"]
    condition = WEATHER_CODES.get(code, "variable conditions")

    high = round(daily["temperature_2m_max"][0])
    low = round(daily["temperature_2m_min"][0])
    precip = daily["precipitation_sum"][0]

    unit = "degrees Fahrenheit" if config.TEMPERATURE_UNIT == "fahrenheit" else "degrees Celsius"
    wind_unit = "miles per hour" if config.WIND_SPEED_UNIT == "mph" else "kilometers per hour"

    msg = (
        f"Good morning. Here is your weather update for {city}. "
        f"Expect {condition} today. "
        f"The current temperature is {temp} {unit}, "
        f"with a high of {high} and a low of {low}. "
        f"Wind speed is {wind} {wind_unit}."
    )

    if precip and precip > 0:
        precip_unit = "inches" if config.TEMPERATURE_UNIT == "fahrenheit" else "millimeters"
        msg += f" Expected precipitation: {precip} {precip_unit}."

    return msg


def get_weather_message(city: str) -> str:
    lat, lon, timezone = geocode(city)
    data = get_forecast(lat, lon, timezone)
    return build_message(city, data)
