import { useCallback, useMemo, useState } from "react"
import { simulateWeather } from "../lib/weatherAdaptation"
import type { WeatherData } from "../lib/weatherAdaptation"

const STORAGE_KEY = "drape_weather_enabled"

function loadEnabled(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === null ? true : v === "true"
  } catch {
    return true
  }
}

export function useWeather(dateStr: string | undefined): {
  weather:        WeatherData | null
  weatherEnabled: boolean
  toggleWeather:  () => void
} {
  const [weatherEnabled, setWeatherEnabled] = useState<boolean>(loadEnabled)

  const weather: WeatherData | null = useMemo(
    () => (dateStr ? simulateWeather(dateStr) : null),
    [dateStr],
  )

  const toggleWeather = useCallback(() => {
    setWeatherEnabled((prev) => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch { /* */ }
      return next
    })
  }, [])

  return { weather, weatherEnabled, toggleWeather }
}
