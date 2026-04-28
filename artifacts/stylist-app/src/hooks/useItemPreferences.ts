import { useState, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReachPreference = "go-to" | "sometimes" | "not-lately"
export type FeelPreference  = "confident" | "comfortable" | "polished" | "relaxed" | "figuring-out"

export type ItemPref = {
  reach?: ReachPreference
  feel?:  FeelPreference
}

export type ItemPreferences = Record<string, ItemPref>

// ─── UI labels (no negative wording) ─────────────────────────────────────────

export const REACH_OPTIONS: { value: ReachPreference; label: string; sub: string }[] = [
  { value: "go-to",      label: "Always a go-to",           sub: "Reaches for this often"        },
  { value: "sometimes",  label: "Wear it sometimes",        sub: "Works when the fit is right"   },
  { value: "not-lately", label: "Haven't worn it in a while", sub: "Still in the wardrobe"       },
]

export const FEEL_OPTIONS: { value: FeelPreference; label: string; emoji: string }[] = [
  { value: "confident",    label: "Confident",         emoji: "✦" },
  { value: "comfortable",  label: "Comfortable",       emoji: "◎" },
  { value: "polished",     label: "Polished",          emoji: "◈" },
  { value: "relaxed",      label: "Relaxed",           emoji: "◯" },
  { value: "figuring-out", label: "Still figuring it out", emoji: "◌" },
]

// ─── Reach → accent colour map ────────────────────────────────────────────────

export const REACH_COLOR: Record<ReachPreference, string> = {
  "go-to":      "#4ECFA8",   // teal  — active, confident
  "sometimes":  "#C8A96A",   // gold  — considered
  "not-lately": "#A8AFBE",   // sub   — neutral, no negative connotation
}

// ─── localStorage key ─────────────────────────────────────────────────────────

const STORAGE_KEY = "style-assist-item-prefs"

// ─── Non-hook loader (used by outfitGenerator outside React) ──────────────────

export function loadItemPreferences(): ItemPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ItemPreferences) : {}
  } catch {
    return {}
  }
}

function persist(prefs: ItemPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch { /* quota or private mode — silent */ }
}

// ─── React hook ───────────────────────────────────────────────────────────────

export function useItemPreferences() {
  const [prefs, setPrefsState] = useState<ItemPreferences>(loadItemPreferences)

  const setPref = useCallback((itemId: string | number, update: Partial<ItemPref>) => {
    setPrefsState((prev) => {
      const key  = String(itemId)
      const next = { ...prev, [key]: { ...prev[key], ...update } }
      persist(next)
      return next
    })
  }, [])

  // Toggles feel on/off using a functional state update — avoids stale-closure issues
  const toggleFeel = useCallback((itemId: string | number, value: FeelPreference) => {
    setPrefsState((prev) => {
      const key     = String(itemId)
      const current = prev[key] ?? {}
      const nextFeel = current.feel === value ? undefined : value
      const next: ItemPreferences = { ...prev, [key]: { ...current, feel: nextFeel } }
      persist(next)
      return next
    })
  }, [])

  const getPref = useCallback(
    (itemId: string | number): ItemPref => prefs[String(itemId)] ?? {},
    [prefs]
  )

  return { prefs, setPref, toggleFeel, getPref }
}
