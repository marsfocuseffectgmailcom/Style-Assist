import { useState, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type RemovedRecord = {
  id: string
  name: string
  category: string
  image: string
  removedAt: string
  permanent: boolean
}

// ─── Storage key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "style-assist-removed-items"

// ─── Non-React loader (used by outfitGenerator outside React) ─────────────────

export function loadRemovedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const records: RemovedRecord[] = JSON.parse(raw)
    return new Set(records.map((r) => r.id))
  } catch {
    return new Set()
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load(): RemovedRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RemovedRecord[]) : []
  } catch {
    return []
  }
}

function persist(records: RemovedRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch { /* quota or private mode */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWardrobeRemoval() {
  const [removed, setRemoved] = useState<RemovedRecord[]>(load)

  const softRemove = useCallback(
    (item: { id: string | number; name: string; category: string; image: string }) => {
      setRemoved((prev) => {
        const id = String(item.id)
        if (prev.some((r) => r.id === id)) return prev
        const next = [
          ...prev,
          { id, name: item.name, category: item.category, image: item.image, removedAt: new Date().toISOString(), permanent: false },
        ]
        persist(next)
        return next
      })
    },
    []
  )

  const permanentRemove = useCallback(
    (item: { id: string | number; name: string; category: string; image: string }) => {
      setRemoved((prev) => {
        const id = String(item.id)
        const filtered = prev.filter((r) => r.id !== id)
        const next = [
          ...filtered,
          { id, name: item.name, category: item.category, image: item.image, removedAt: new Date().toISOString(), permanent: true },
        ]
        persist(next)
        return next
      })
    },
    []
  )

  const restore = useCallback((id: string | number) => {
    setRemoved((prev) => {
      const next = prev.filter((r) => r.id !== String(id))
      persist(next)
      return next
    })
  }, [])

  const isRemoved = useCallback(
    (id: string | number) => removed.some((r) => r.id === String(id)),
    [removed]
  )

  const removedIds = new Set(removed.map((r) => r.id))

  return { removed, removedIds, softRemove, permanentRemove, restore, isRemoved }
}
