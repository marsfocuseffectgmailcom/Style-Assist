import type { GeneratedOutfit } from "./outfitGenerator"
import type { PlannedOutfitItem } from "./types"
import type { WardrobeItem } from "./mockData"

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeatherCondition = "hot" | "warm" | "cool" | "cold"

export type WeatherData = {
  tempC:     number
  condition: WeatherCondition
  rain:      boolean
  wind:      boolean
  label:     string
}

export type WeatherAdaptationResult = {
  outfit:      GeneratedOutfit
  adaptations: string[]
  weatherNote: string
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function hashDate(dateStr: string): number {
  let h = 0
  for (const c of dateStr) h = ((h << 5) - h + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

type Season = "summer" | "autumn" | "winter" | "spring"

function getSeason(dateStr: string): Season {
  const month = new Date(dateStr).getMonth() + 1
  if ([12, 1, 2].includes(month)) return "summer"
  if ([3, 4, 5].includes(month)) return "autumn"
  if ([6, 7, 8].includes(month)) return "winter"
  return "spring"
}

// ─── Weather simulation ───────────────────────────────────────────────────────

const TEMP_RANGES: Record<Season, [number, number]> = {
  summer: [24, 38],
  autumn: [14, 23],
  winter: [7,  16],
  spring: [14, 24],
}

const RAIN_PCT:  Record<Season, number> = { summer: 22, autumn: 32, winter: 42, spring: 30 }
const WIND_PCT:  Record<Season, number> = { summer: 14, autumn: 26, winter: 36, spring: 32 }

export function simulateWeather(dateStr: string): WeatherData {
  const h      = hashDate(dateStr)
  const season = getSeason(dateStr)
  const [lo, hi] = TEMP_RANGES[season]
  const span   = hi - lo + 1
  const tempC  = lo + (h % span)

  const condition: WeatherCondition =
    tempC >= 26 ? "hot"  :
    tempC >= 18 ? "warm" :
    tempC >= 10 ? "cool" : "cold"

  const rain = (h % 100)         < RAIN_PCT[season]
  const wind = ((h >>> 8) % 100) < WIND_PCT[season]

  const extras = [rain ? "Rain" : "", wind ? "Breezy" : ""].filter(Boolean).join(", ")
  const condLabel = condition === "hot" ? "Hot" : condition === "warm" ? "Warm" : condition === "cool" ? "Cool" : "Cold"
  const label = `${condLabel}, ${tempC}°C${extras ? " · " + extras : ""}`

  return { tempC, condition, rain, wind, label }
}

// ─── Adaptation helpers ───────────────────────────────────────────────────────

function wardrobeToPlanned(item: WardrobeItem): PlannedOutfitItem {
  return {
    id: String(item.id),
    name: item.name,
    image: item.image,
    category: item.category,
    source: "wardrobe",
    purchaseStatus: "arrived",
  }
}

function isOpenShoe(item: PlannedOutfitItem): boolean {
  const n = item.name.toLowerCase()
  return n.includes("sneaker") || n.includes("sandal") || n.includes("mule") || n.includes("slide") || n.includes("flip")
}

function isDelicateAccessory(item: PlannedOutfitItem): boolean {
  const n = item.name.toLowerCase()
  return n.includes("scarf") || n.includes("silk") || n.includes("chiffon") || n.includes("lace")
}

// ─── Adaptation engine ────────────────────────────────────────────────────────

export function applyWeatherAdaptation(
  outfit: GeneratedOutfit,
  weather: WeatherData,
  wardrobeItems: WardrobeItem[],
): WeatherAdaptationResult {
  let items       = [...outfit.items]
  let accessories = [...(outfit.accessories ?? [])]
  const adaptations: string[] = []
  const flags: string[] = []

  const itemIds    = () => new Set(items.map((i) => i.id))
  const accIds     = () => new Set(accessories.map((i) => i.id))
  const hasOuter   = () => items.some((i) => i.category === "Outerwear")

  // ── Hot: remove outerwear ─────────────────────────────────────────────────
  if (weather.condition === "hot") {
    const removed = items.filter((i) => i.category === "Outerwear")
    if (removed.length > 0) {
      items = items.filter((i) => i.category !== "Outerwear")
      adaptations.push(
        `${removed.map((i) => i.name).join(", ")} removed — too warm for ${weather.tempC}°C`,
      )
      flags.push("heat")
    }
  }

  // ── Cool / Cold: add outerwear if missing ─────────────────────────────────
  if ((weather.condition === "cool" || weather.condition === "cold") && !hasOuter()) {
    const taken = itemIds()
    const candidates = wardrobeItems
      .filter((w) => w.category === "Outerwear" && !taken.has(String(w.id)))
      .sort((a, b) => {
        const an = a.name.toLowerCase()
        const bn = b.name.toLowerCase()
        if (weather.condition === "cold") {
          return (bn.includes("coat") ? 1 : 0) - (an.includes("coat") ? 1 : 0)
        }
        return (bn.includes("blazer") || bn.includes("jacket") ? 1 : 0) -
               (an.includes("blazer") || an.includes("jacket") ? 1 : 0)
      })

    if (candidates.length > 0) {
      const layer = wardrobeToPlanned(candidates[0])
      items = [...items, layer]
      adaptations.push(`${layer.name} added for ${weather.tempC}°C`)
      flags.push(weather.condition === "cold" ? "cold" : "chill")
    }
  }

  // ── Rain: swap open shoes ─────────────────────────────────────────────────
  if (weather.rain) {
    const shoeIdx = items.findIndex((i) => i.category === "Shoes")
    if (shoeIdx >= 0 && isOpenShoe(items[shoeIdx])) {
      const taken = itemIds()
      const closedAlts = wardrobeItems.filter(
        (w) => w.category === "Shoes" && !taken.has(String(w.id)) && !isOpenShoe(wardrobeToPlanned(w)),
      )
      if (closedAlts.length > 0) {
        const rep = wardrobeToPlanned(closedAlts[0])
        adaptations.push(`${items[shoeIdx].name} → ${rep.name} (rain — closed shoes)`)
        items = [...items.slice(0, shoeIdx), rep, ...items.slice(shoeIdx + 1)]
        flags.push("rain")
      }
    }

    // Rain: add outerwear if still missing (and not hot)
    if (!hasOuter() && weather.condition !== "hot") {
      const taken = itemIds()
      const rainOuter = wardrobeItems
        .filter((w) => w.category === "Outerwear" && !taken.has(String(w.id)))
        .sort((a, b) => {
          const aScore = a.name.toLowerCase().includes("coat") ? 2 : a.name.toLowerCase().includes("jacket") ? 1 : 0
          const bScore = b.name.toLowerCase().includes("coat") ? 2 : b.name.toLowerCase().includes("jacket") ? 1 : 0
          return bScore - aScore
        })
      if (rainOuter.length > 0) {
        const layer = wardrobeToPlanned(rainOuter[0])
        items = [...items, layer]
        adaptations.push(`${layer.name} added for rain cover`)
        if (!flags.includes("rain")) flags.push("rain")
      }
    }

    // Rain: remove delicate accessories
    const delicate = accessories.filter(isDelicateAccessory)
    if (delicate.length > 0) {
      accessories = accessories.filter((a) => !isDelicateAccessory(a))
      adaptations.push(
        `${delicate.map((a) => a.name).join(", ")} removed — keep it dry`,
      )
      if (!flags.includes("rain")) flags.push("rain")
    }
  }

  // ── Wind: no item swap, just a note ───────────────────────────────────────
  if (weather.wind && !weather.rain) {
    flags.push("wind")
    adaptations.push("Structured layers recommended — breezy today")
  }

  if (adaptations.length === 0) {
    return { outfit, adaptations: [], weatherNote: "" }
  }

  const condLabel =
    flags[0] === "rain"  ? "rain"           :
    flags[0] === "heat"  ? "heat"           :
    flags[0] === "cold"  ? "cold"           :
    flags[0] === "chill" ? "cooler weather" :
    flags[0] === "wind"  ? "wind"           : "conditions"

  return {
    outfit:      { ...outfit, items, accessories },
    adaptations,
    weatherNote: `Adjusted for ${condLabel}`,
  }
}
