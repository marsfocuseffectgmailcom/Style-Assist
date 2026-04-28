import { useState, useCallback } from "react"
import type { TimelineOutfit } from "../lib/types"

const STORAGE_KEY = "style-assist-timeline"

function load(): Record<string, TimelineOutfit> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, TimelineOutfit>
  } catch {
    return {}
  }
}

function save(data: Record<string, TimelineOutfit>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useTimelineOutfits() {
  const [outfits, setOutfits] = useState<Record<string, TimelineOutfit>>(load)

  const mutate = useCallback((updater: (prev: Record<string, TimelineOutfit>) => Record<string, TimelineOutfit>) => {
    setOutfits((prev) => {
      const next = updater(prev)
      save(next)
      return next
    })
  }, [])

  function getOutfitForDate(date: string): TimelineOutfit | undefined {
    return outfits[date]
  }

  function saveOutfit(outfit: TimelineOutfit) {
    mutate((prev) => ({ ...prev, [outfit.date]: outfit }))
  }

  function removeOutfit(date: string) {
    mutate((prev) => {
      const next = { ...prev }
      delete next[date]
      return next
    })
  }

  function moveOutfit(fromDate: string, toDate: string) {
    mutate((prev) => {
      const outfit = prev[fromDate]
      if (!outfit) return prev
      const next = { ...prev }
      delete next[fromDate]
      next[toDate] = { ...outfit, date: toDate }
      return next
    })
  }

  function duplicateOutfit(fromDate: string, toDate: string) {
    mutate((prev) => {
      const outfit = prev[fromDate]
      if (!outfit) return prev
      return {
        ...prev,
        [toDate]: {
          ...outfit,
          id: Math.random().toString(36).slice(2, 10),
          date: toDate,
          createdAt: new Date().toISOString(),
        },
      }
    })
  }

  function bulkFill(newOutfits: TimelineOutfit[], overwrite = false) {
    mutate((prev) => {
      const next = { ...prev }
      for (const outfit of newOutfits) {
        if (!overwrite && next[outfit.date]) continue
        next[outfit.date] = outfit
      }
      return next
    })
  }

  return {
    outfits,
    getOutfitForDate,
    saveOutfit,
    removeOutfit,
    moveOutfit,
    duplicateOutfit,
    bulkFill,
  }
}
