import { useEffect, useMemo, useState } from "react"
import type { AffiliateClickEvent } from "../lib/types"

const STORAGE_KEY = "affiliate_click_events"

function readAffiliateClickEvents(): AffiliateClickEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AffiliateClickEvent[]
  } catch (error) {
    console.error("Failed to read affiliate click events", error)
    return []
  }
}

type MerchantInsight = {
  merchant: string
  clicks: number
}

type ProductInsight = {
  productId: string
  clicks: number
}

type GapInsight = {
  matchedWardrobeGapId: string
  clicks: number
}

export function useConversionInsights() {
  const [events, setEvents] = useState<AffiliateClickEvent[]>([])

  useEffect(() => {
    setEvents(readAffiliateClickEvents())
  }, [])

  const totalClicks = events.length

  const clicksByMerchant = useMemo<MerchantInsight[]>(() => {
    const counts = new Map<string, number>()

    for (const event of events) {
      counts.set(event.merchant, (counts.get(event.merchant) || 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([merchant, clicks]) => ({ merchant, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
  }, [events])

  const clicksByProduct = useMemo<ProductInsight[]>(() => {
    const counts = new Map<string, number>()

    for (const event of events) {
      counts.set(event.productId, (counts.get(event.productId) || 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([productId, clicks]) => ({ productId, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
  }, [events])

  const clicksByGap = useMemo<GapInsight[]>(() => {
    const counts = new Map<string, number>()

    for (const event of events) {
      if (!event.matchedWardrobeGapId) continue
      counts.set(
        event.matchedWardrobeGapId,
        (counts.get(event.matchedWardrobeGapId) || 0) + 1,
      )
    }

    return Array.from(counts.entries())
      .map(([matchedWardrobeGapId, clicks]) => ({
        matchedWardrobeGapId,
        clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks)
  }, [events])

  const clicksBySourceScreen = useMemo(() => {
    const counts = new Map<string, number>()

    for (const event of events) {
      counts.set(
        event.sourceScreen,
        (counts.get(event.sourceScreen) || 0) + 1,
      )
    }

    return Array.from(counts.entries())
      .map(([sourceScreen, clicks]) => ({ sourceScreen, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
  }, [events])

  const recentClicks = useMemo(() => {
    return [...events]
      .sort(
        (a, b) =>
          new Date(b.clickedAtIso).getTime() - new Date(a.clickedAtIso).getTime(),
      )
      .slice(0, 10)
  }, [events])

  const topMerchant = clicksByMerchant[0] || null
  const topProduct = clicksByProduct[0] || null
  const topGap = clicksByGap[0] || null

  const refresh = () => {
    setEvents(readAffiliateClickEvents())
  }

  return {
    events,
    totalClicks,
    clicksByMerchant,
    clicksByProduct,
    clicksByGap,
    clicksBySourceScreen,
    recentClicks,
    topMerchant,
    topProduct,
    topGap,
    refresh,
  }
}
