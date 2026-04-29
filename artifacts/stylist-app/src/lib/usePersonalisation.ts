import { useState, useCallback, useEffect, useRef } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type StyleDirection = "casual" | "balanced" | "polished"

type OutfitRecord = {
  accepted:   number
  rejected:   number
  reshuffled: number
  lastSeen:   string
}

type WearRecord = {
  count:    number
  lastWorn: string  // ISO date
}

type PersonalisationStore = {
  version:        1
  outfitFeedback: Record<string, OutfitRecord>
  wearLog:        Record<string, WearRecord>
  appOpenHours:   number[]  // last 20 hour values (for timing insight)
  tonightModeCount: number
  styleDirection: StyleDirection
  totalSignals:   number
  lastUpdated:    string
}

const STORAGE_KEY = "style-assist-personalisation"

const DEFAULT_STORE: PersonalisationStore = {
  version:          1,
  outfitFeedback:   {},
  wearLog:          {},
  appOpenHours:     [],
  tonightModeCount: 0,
  styleDirection:   "balanced",
  totalSignals:     0,
  lastUpdated:      new Date().toISOString(),
}

// ─── Persistence ──────────────────────────────────────────────────────────────

export function loadPersonalisationStore(): PersonalisationStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STORE }
    const parsed = JSON.parse(raw) as PersonalisationStore
    if (parsed.version !== 1) return { ...DEFAULT_STORE }
    return parsed
  } catch {
    return { ...DEFAULT_STORE }
  }
}

function saveStore(store: PersonalisationStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, lastUpdated: new Date().toISOString() }))
  } catch {
    // quota / private mode — silent
  }
}

// ─── Non-hook helpers (used outside React) ────────────────────────────────────

export function getItemWearCount(itemId: string | number): number {
  const store = loadPersonalisationStore()
  return store.wearLog[String(itemId)]?.count ?? 0
}

export function getStyleDirection(): StyleDirection {
  return loadPersonalisationStore().styleDirection
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePersonalisation() {
  const [store, setStoreState] = useState<PersonalisationStore>(loadPersonalisationStore)

  // Stable ref so callbacks don't go stale
  const storeRef = useRef(store)
  useEffect(() => { storeRef.current = store }, [store])

  function mutate(updater: (s: PersonalisationStore) => PersonalisationStore) {
    setStoreState((prev) => {
      const next = updater(prev)
      saveStore(next)
      return next
    })
  }

  // ── Record outfit accepted ───────────────────────────────────────────────────
  const recordAccept = useCallback((outfitName: string, itemIds: (string | number)[]) => {
    mutate((s) => {
      const rec = s.outfitFeedback[outfitName] ?? { accepted: 0, rejected: 0, reshuffled: 0, lastSeen: "" }
      const wearLog = { ...s.wearLog }
      const today   = new Date().toISOString().slice(0, 10)

      for (const id of itemIds) {
        const key = String(id)
        wearLog[key] = {
          count:    (wearLog[key]?.count ?? 0) + 1,
          lastWorn: today,
        }
      }

      return {
        ...s,
        wearLog,
        outfitFeedback: {
          ...s.outfitFeedback,
          [outfitName]: { ...rec, accepted: rec.accepted + 1, lastSeen: today },
        },
        totalSignals: s.totalSignals + 1,
      }
    })
  }, [])

  // ── Record outfit rejected (reshuffle) ───────────────────────────────────────
  const recordReshuffle = useCallback((outfitName: string) => {
    mutate((s) => {
      const rec   = s.outfitFeedback[outfitName] ?? { accepted: 0, rejected: 0, reshuffled: 0, lastSeen: "" }
      const today = new Date().toISOString().slice(0, 10)
      return {
        ...s,
        outfitFeedback: {
          ...s.outfitFeedback,
          [outfitName]: { ...rec, reshuffled: rec.reshuffled + 1, lastSeen: today },
        },
        totalSignals: s.totalSignals + 1,
      }
    })
  }, [])

  // ── Record app open timing ───────────────────────────────────────────────────
  const recordAppOpen = useCallback(() => {
    const hour = new Date().getHours()
    mutate((s) => ({
      ...s,
      appOpenHours: [hour, ...s.appOpenHours].slice(0, 20),
    }))
  }, [])

  // ── Record Tonight Mode usage ────────────────────────────────────────────────
  const recordTonightMode = useCallback(() => {
    mutate((s) => ({ ...s, tonightModeCount: s.tonightModeCount + 1 }))
  }, [])

  // ── Update style direction ───────────────────────────────────────────────────
  const setStyleDirection = useCallback((direction: StyleDirection) => {
    mutate((s) => ({ ...s, styleDirection: direction }))
  }, [])

  // ── Reset all personalisation data ───────────────────────────────────────────
  const resetPersonalisation = useCallback(() => {
    setStoreState(() => {
      const fresh: PersonalisationStore = {
        version:          1,
        outfitFeedback:   {},
        wearLog:          {},
        appOpenHours:     [],
        tonightModeCount: 0,
        styleDirection:   "balanced",
        totalSignals:     0,
        lastUpdated:      new Date().toISOString(),
      }
      saveStore(fresh)
      return fresh
    })
  }, [])

  // ── Derived values ───────────────────────────────────────────────────────────

  // True once we have enough data to show personalisation hints
  const hasPersonalisationData = store.totalSignals >= 3

  // Per-item label: "Frequently worn" if worn 3+ times
  const getItemLabel = useCallback((itemId: string | number): "frequently-worn" | null => {
    const count = store.wearLog[String(itemId)]?.count ?? 0
    return count >= 3 ? "frequently-worn" : null
  }, [store.wearLog])

  // Which hint to show on the outfit card
  // "fits-style" for multiples of even signals, "adjusted" for odd
  const outfitHint = useCallback((outfitName: string): "fits-style" | "adjusted" | null => {
    if (!hasPersonalisationData) return null
    const rec = store.outfitFeedback[outfitName]
    if (rec && rec.accepted >= 2) return "fits-style"
    if (store.totalSignals >= 5) return "adjusted"
    if (store.totalSignals >= 3) return "adjusted"
    return null
  }, [store, hasPersonalisationData])

  return {
    store,
    recordAccept,
    recordReshuffle,
    recordAppOpen,
    recordTonightMode,
    setStyleDirection,
    resetPersonalisation,
    hasPersonalisationData,
    getItemLabel,
    outfitHint,
  }
}
