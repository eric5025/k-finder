// Open-Meteo (https://open-meteo.com) — 무료, API Key 불필요
const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;   // 강수확률 (%)
  conditionType: string;
  description: string;
  isDaytime: boolean;
  iconUri: string;
}

/** WMO weather code → 한국어 설명 + condition key */
function wmoToInfo(code: number, isDay: boolean): { condition: string; description: string } {
  if (code === 0) return { condition: "CLEAR", description: isDay ? "맑음" : "맑은 밤" };
  if (code === 1) return { condition: "MOSTLY_CLEAR", description: "대체로 맑음" };
  if (code === 2) return { condition: "PARTLY_CLOUDY", description: "구름 조금" };
  if (code === 3) return { condition: "OVERCAST", description: "흐림" };
  if (code <= 48) return { condition: "FOG", description: "안개" };
  if (code <= 55) return { condition: "DRIZZLE", description: "이슬비" };
  if (code <= 57) return { condition: "DRIZZLE", description: "강한 이슬비" };
  if (code <= 65) return { condition: code <= 61 ? "LIGHT_RAIN" : code === 63 ? "RAIN" : "HEAVY_RAIN", description: code <= 61 ? "약한 비" : code === 63 ? "비" : "강한 비" };
  if (code <= 67) return { condition: "RAIN", description: "비/진눈깨비" };
  if (code <= 77) return { condition: code <= 71 ? "LIGHT_SNOW" : code <= 73 ? "SNOW" : "HEAVY_SNOW", description: code <= 71 ? "약한 눈" : code <= 73 ? "눈" : "폭설" };
  if (code <= 82) return { condition: code === 80 ? "LIGHT_RAIN" : code === 81 ? "RAIN" : "HEAVY_RAIN", description: "소나기" };
  if (code <= 86) return { condition: "SNOW", description: "눈소나기" };
  if (code === 95) return { condition: "THUNDERSTORM", description: "뇌우" };
  if (code >= 96)  return { condition: "THUNDERSTORM", description: "우박 동반 뇌우" };
  return { condition: "MOSTLY_CLEAR", description: "" };
}

/** condition key → 이모지 */
export function weatherEmoji(conditionType: string, isDaytime = true): string {
  if (conditionType === "CLEAR" && !isDaytime) return "🌙";
  const map: Record<string, string> = {
    CLEAR: "☀️", MOSTLY_CLEAR: "🌤️", PARTLY_CLOUDY: "⛅",
    MOSTLY_CLOUDY: "🌥️", CLOUDY: "☁️", OVERCAST: "☁️",
    WINDY: "💨", FOG: "🌫️", HAZE: "🌫️", DUST: "🌫️",
    DRIZZLE: "🌦️", LIGHT_RAIN: "🌦️", RAIN: "🌧️",
    HEAVY_RAIN: "⛈️", THUNDERSTORM: "⛈️",
    LIGHT_SNOW: "🌨️", SNOW: "❄️", HEAVY_SNOW: "❄️", SLEET: "🌨️",
  };
  return map[conditionType] ?? "🌤️";
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  retries = 2
): Promise<WeatherData | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day",
    daily: "precipitation_probability_max",
    temperature_unit: "celsius",
    timezone: "auto",
    forecast_days: "1",
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}?${params.toString()}`, 8000);
      if (!res.ok) {
        console.warn(`⚠️ Open-Meteo 오류 (${res.status})`);
        return null;
      }

      const json = await res.json();
      const cur = json.current;
      if (!cur) return null;

      const isDaytime = cur.is_day === 1;
      const { condition, description } = wmoToInfo(cur.weather_code ?? 0, isDaytime);
      const precipitation = json.daily?.precipitation_probability_max?.[0] ?? 0;

      console.log(`✅ 날씨: ${cur.temperature_2m}°C, ${description} (WMO ${cur.weather_code}), 강수 ${precipitation}%`);

      return {
        temp: Math.round(cur.temperature_2m ?? 0),
        feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 0),
        humidity: Math.round(cur.relative_humidity_2m ?? 0),
        precipitation,
        conditionType: condition,
        description,
        isDaytime,
        iconUri: "",
      };
    } catch (e: any) {
      const isTimeout = e?.name === "AbortError" || String(e).includes("timed out");
      console.warn(`⚠️ 날씨 fetch 시도 ${attempt}/${retries} 실패: ${isTimeout ? "타임아웃" : e}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  console.error("❌ 날씨 fetch 최종 실패");
  return null;
}
