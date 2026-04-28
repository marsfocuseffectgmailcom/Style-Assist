import type { WardrobeItem } from "./mockData"
import type { IncomingItem, PlannedOutfitItem, OutfitConfidence, TimelineOutfit } from "./types"
import type { StylePreferences } from "./stylingEngine"
import { rankOutfits, extractColorsFromName } from "./stylingEngine"
import type { ScoredItem, NormCategory, RankedOutfit } from "./stylingEngine"
import { loadPreferences, loadRecentItemIds, addRecentItems } from "./stylePreferences"
import { loadItemPreferences } from "../hooks/useItemPreferences"

// ─── Public result type ───────────────────────────────────────────────────────

export type GeneratedOutfit = {
  id: string
  name: string
  items: PlannedOutfitItem[]
  confidence: OutfitConfidence
  tags: string[]
  score: number
  reason: string
  tips: string[]
  upgrade?: string
  breakdown?: Record<string, number>
  gapSuggestion?: string
}

// ─── Item normalisation ───────────────────────────────────────────────────────

function wardrobeToScored(item: WardrobeItem): ScoredItem {
  const catMap: Record<string, NormCategory> = {
    Tops: "top",
    Bottoms: "bottom",
    Shoes: "shoes",
    Outerwear: "outerwear",
  }
  return {
    id: String(item.id),
    name: item.name,
    image: item.image,
    category: item.category,
    normCategory: catMap[item.category] ?? "top",
    styleTags: item.styleTags ?? [],
    colors: item.colors?.length ? item.colors : extractColorsFromName(item.name),
    seasonTags: item.seasonTags ?? ["all-season"],
    wearCount: item.wearCount ?? 0,
    source: "wardrobe",
    purchaseStatus: "arrived",
  }
}

function incomingToScored(item: IncomingItem): ScoredItem {
  const catMap: Record<string, NormCategory> = {
    top: "top",
    bottom: "bottom",
    dress: "dress",
    shoes: "shoes",
    outerwear: "outerwear",
    accessory: "accessory",
  }
  return {
    id: item.id,
    name: item.name,
    image: item.image,
    category: item.category,
    normCategory: catMap[item.category] ?? "top",
    styleTags: item.styleTags ?? [],
    colors: item.color
      ? [item.color, ...extractColorsFromName(item.name)]
      : extractColorsFromName(item.name),
    seasonTags: ["all-season"],
    wearCount: 0,
    source: "suggestion",
    purchaseStatus: "waiting_for_delivery",
  }
}

function scoredToPlannedItem(item: ScoredItem): PlannedOutfitItem {
  return {
    id: item.id,
    name: item.name,
    image: item.image,
    category: item.category,
    source: item.source,
    purchaseStatus: item.purchaseStatus,
  }
}

function rankedToGenerated(r: RankedOutfit): GeneratedOutfit {
  return {
    id: r.id,
    name: r.name,
    items: r.items.map(scoredToPlannedItem),
    confidence: r.confidence,
    tags: r.tags,
    score: r.score,
    reason: r.reason,
    tips: r.tips,
    upgrade: r.upgrade,
    breakdown: r.breakdown,
    gapSuggestion: r.gapSuggestion,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateOutfits(
  date: string,
  wardrobeItems: WardrobeItem[],
  incomingItems: IncomingItem[],
  eventType?: string,
  options?: {
    preferences?: StylePreferences
    usedItemIds?: Set<string>
    usedOutfitNames?: Set<string>
  }
): GeneratedOutfit[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eligibleIncoming = incomingItems.filter((item) => {
    const delivery = new Date(item.deliveryDate)
    delivery.setHours(0, 0, 0, 0)
    const selected = new Date(date)
    selected.setHours(0, 0, 0, 0)
    return delivery <= selected
  })

  const pool: ScoredItem[] = [
    ...wardrobeItems.map(wardrobeToScored),
    ...eligibleIncoming.map(incomingToScored),
  ]

  const preferences     = options?.preferences ?? loadPreferences()
  const usedItemIds     = options?.usedItemIds ?? loadRecentItemIds()
  const itemPreferences = loadItemPreferences()

  const ranked = rankOutfits(pool, {
    eventType,
    preferences,
    usedItemIds,
    usedOutfitNames: options?.usedOutfitNames,
    dateStr: date,
    maxResults: 5,
    itemPreferences,
  })

  return ranked.map(rankedToGenerated)
}

export function generateMonthPlan(
  wardrobeItems: WardrobeItem[],
  incomingItems: IncomingItem[],
  existingDates: Set<string>
): TimelineOutfit[] {
  const preferences = loadPreferences()
  const usedItemIds = loadRecentItemIds()
  const localUsed = new Set(usedItemIds)
  const usedOutfitNames = new Set<string>()
  const outfits: TimelineOutfit[] = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 28; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    if (existingDates.has(dateStr)) continue

    const generated = generateOutfits(dateStr, wardrobeItems, incomingItems, undefined, {
      preferences,
      usedItemIds: localUsed,
      usedOutfitNames,
    })

    if (generated.length === 0) continue

    const best = generated[0]

    // Track item freshness and name uniqueness across the 28-day plan
    for (const item of best.items) {
      localUsed.add(item.id)
    }
    usedOutfitNames.add(best.name)

    outfits.push({
      id: uid(),
      date: dateStr,
      name: best.name,
      items: best.items,
      confidence: best.confidence,
      tags: best.tags,
      score: best.score,
      reason: best.reason,
      createdAt: new Date().toISOString(),
    })
  }

  // Persist freshness for future calls
  addRecentItems(outfits.flatMap((o) => o.items.map((i) => i.id)))

  return outfits
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
