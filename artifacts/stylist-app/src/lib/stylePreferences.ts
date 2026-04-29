import type { StylePreferences } from "./stylingEngine"
import { loadPersonalisationStore } from "./usePersonalisation"

export type { StylePreferences }

const PREF_KEY = "style-assist-preferences"
const RECENT_KEY = "style-assist-recent-items"

export function loadPreferences(): StylePreferences {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (!raw) return { styleTags: {}, colors: {} }
    return JSON.parse(raw) as StylePreferences
  } catch {
    return { styleTags: {}, colors: {} }
  }
}

// ─── Direction bias weights ────────────────────────────────────────────────────

const CASUAL_BOOST:   Record<string, number> = { relaxed: 0.8, casual: 0.8, everyday: 0.6, cozy: 0.5, weekend: 0.5 }
const POLISHED_BOOST: Record<string, number> = { professional: 0.8, tailored: 0.8, polished: 0.8, "smart casual": 0.6, clean: 0.5 }

export function loadPreferencesWithDirection(): StylePreferences {
  const base   = loadPreferences()
  const { styleDirection } = loadPersonalisationStore()

  if (styleDirection === "balanced") return base

  const boost = styleDirection === "casual" ? CASUAL_BOOST : POLISHED_BOOST
  const merged: StylePreferences = {
    styleTags: { ...base.styleTags },
    colors:    { ...base.colors },
  }

  for (const [tag, weight] of Object.entries(boost)) {
    merged.styleTags[tag] = (merged.styleTags[tag] ?? 0) + weight
  }

  return merged
}

export function savePreferences(prefs: StylePreferences): void {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs))
}

type OutfitSignal = "like" | "dislike" | "skip"

export function updatePreferences(
  prefs: StylePreferences,
  outfitTags: string[],
  outfitColors: string[],
  signal: OutfitSignal
): StylePreferences {
  const weight = signal === "like" ? 1 : signal === "dislike" ? -1 : -0.25

  const next: StylePreferences = {
    styleTags: { ...prefs.styleTags },
    colors: { ...prefs.colors },
  }

  for (const tag of outfitTags) {
    next.styleTags[tag] = (next.styleTags[tag] ?? 0) + weight
  }
  for (const color of outfitColors) {
    next.colors[color] = (next.colors[color] ?? 0) + weight
  }

  return next
}

export function loadRecentItemIds(): Set<string> {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return new Set((JSON.parse(raw ?? "[]") as string[]).slice(0, 60))
  } catch {
    return new Set()
  }
}

export function addRecentItems(itemIds: string[]): void {
  try {
    const prev = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[]
    const next = [...new Set([...itemIds, ...prev])].slice(0, 60)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}
