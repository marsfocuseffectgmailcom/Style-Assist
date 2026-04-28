import { useState, useCallback } from "react"
import {
  loadPreferences,
  savePreferences,
  updatePreferences,
  loadRecentItemIds,
  addRecentItems,
} from "../lib/stylePreferences"
import type { StylePreferences } from "../lib/stylePreferences"

export function useStylePreferences() {
  const [preferences, setPreferences] = useState<StylePreferences>(loadPreferences)

  const signalOutfit = useCallback(
    (
      outfitTags: string[],
      outfitColors: string[],
      signal: "like" | "dislike" | "skip"
    ) => {
      setPreferences((prev) => {
        const next = updatePreferences(prev, outfitTags, outfitColors, signal)
        savePreferences(next)
        return next
      })
    },
    []
  )

  function trackItemsUsed(itemIds: string[]) {
    addRecentItems(itemIds)
  }

  return {
    preferences,
    recentItemIds: loadRecentItemIds(),
    signalOutfit,
    trackItemsUsed,
  }
}
