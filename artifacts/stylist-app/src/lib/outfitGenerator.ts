import type { WardrobeItem } from "./mockData"
import type { IncomingItem, PlannedOutfitItem, OutfitConfidence, TimelineOutfit } from "./types"
import type { StylePreferences } from "./stylingEngine"
import { rankOutfits, extractColorsFromName, scoreOutfit, scoreShoeForContext, STYLE_FAMILIES } from "./stylingEngine"
import type { ScoredItem, NormCategory, RankedOutfit } from "./stylingEngine"
import { loadPreferences, loadPreferencesWithDirection, loadRecentItemIds, addRecentItems } from "./stylePreferences"
import { loadItemPreferences } from "../hooks/useItemPreferences"
import { loadRemovedIds } from "../hooks/useWardrobeRemoval"

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
  shoeAlternatives: PlannedOutfitItem[]
  shoeIsShared: boolean
  accessories: PlannedOutfitItem[]
  accessoryReasons: Record<string, string>
  accessoryScores: Record<string, number>
}

// ─── Item normalisation ───────────────────────────────────────────────────────

function wardrobeToScored(item: WardrobeItem): ScoredItem {
  const catMap: Record<string, NormCategory> = {
    Tops: "top",
    Bottoms: "bottom",
    Shoes: "shoes",
    Outerwear: "outerwear",
    Bags: "bag",
    Accessories: "accessory",
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
    shoeAlternatives: r.shoeAlternatives.map(scoredToPlannedItem),
    shoeIsShared: r.shoeIsShared,
    accessories: r.accessories.map(scoredToPlannedItem),
    accessoryReasons: r.accessoryReasons,
    accessoryScores: r.accessoryScores,
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

  const removedIds = loadRemovedIds()

  const pool: ScoredItem[] = [
    ...wardrobeItems.map(wardrobeToScored).filter((i) => !removedIds.has(i.id)),
    ...eligibleIncoming.map(incomingToScored).filter((i) => !removedIds.has(i.id)),
  ]

  const preferences     = options?.preferences ?? loadPreferencesWithDirection()
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
  const preferences = loadPreferencesWithDirection()
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

// ─── Incoming item matching ───────────────────────────────────────────────────

export type IncomingItemOutfitMatch = {
  id: string
  items: PlannedOutfitItem[]
  tags: string[]
  score: number
  shoeScore: number
  shoeItem?: PlannedOutfitItem
}

export type ShoeStatus =
  | "no_match"
  | "strong_single"
  | "multiple"
  | "incoming_is_shoe"

export type IncomingItemMatchResult = {
  matches: IncomingItemOutfitMatch[]
  shoeStatus: ShoeStatus
  bestShoes: PlannedOutfitItem[]
}

export function matchIncomingItem(
  incoming: IncomingItem,
  wardrobeItems: WardrobeItem[],
): IncomingItemMatchResult {
  const removedIds  = loadRemovedIds()
  const anchor      = incomingToScored(incoming)
  const wardrobe    = wardrobeItems.map(wardrobeToScored).filter((i) => !removedIds.has(i.id))

  const tops      = wardrobe.filter((i) => i.normCategory === "top")
  const bottoms   = wardrobe.filter((i) => i.normCategory === "bottom")
  const dresses   = wardrobe.filter((i) => i.normCategory === "dress")
  const shoes     = wardrobe.filter((i) => i.normCategory === "shoes")
  const outerwear = wardrobe.filter((i) => i.normCategory === "outerwear")

  const isShoe = anchor.normCategory === "shoes"

  // ── Build candidate combos with anchor item forced in ────────────────────
  const combos: ScoredItem[][] = []

  if (isShoe) {
    // New item IS shoes → pair with wardrobe tops/bottoms/dresses
    for (const top of tops.slice(0, 5)) {
      for (const bottom of bottoms.slice(0, 5)) {
        combos.push([top, bottom, anchor])
        for (const ow of outerwear.slice(0, 2)) {
          combos.push([top, bottom, anchor, ow])
        }
      }
    }
    for (const dress of dresses.slice(0, 4)) {
      combos.push([dress, anchor])
      for (const ow of outerwear.slice(0, 2)) {
        combos.push([dress, anchor, ow])
      }
    }
  } else if (anchor.normCategory === "top") {
    for (const bottom of bottoms.slice(0, 5)) {
      for (const shoe of shoes.slice(0, 4)) {
        combos.push([anchor, bottom, shoe])
        for (const ow of outerwear.slice(0, 2)) {
          combos.push([anchor, bottom, shoe, ow])
        }
      }
    }
  } else if (anchor.normCategory === "bottom") {
    for (const top of tops.slice(0, 5)) {
      for (const shoe of shoes.slice(0, 4)) {
        combos.push([top, anchor, shoe])
        for (const ow of outerwear.slice(0, 2)) {
          combos.push([top, anchor, shoe, ow])
        }
      }
    }
  } else if (anchor.normCategory === "dress") {
    for (const shoe of shoes.slice(0, 4)) {
      combos.push([anchor, shoe])
      for (const ow of outerwear.slice(0, 2)) {
        combos.push([anchor, shoe, ow])
      }
    }
  } else if (anchor.normCategory === "outerwear") {
    for (const top of tops.slice(0, 4)) {
      for (const bottom of bottoms.slice(0, 4)) {
        for (const shoe of shoes.slice(0, 3)) {
          combos.push([top, bottom, shoe, anchor])
        }
      }
    }
    for (const dress of dresses.slice(0, 3)) {
      for (const shoe of shoes.slice(0, 3)) {
        combos.push([dress, shoe, anchor])
      }
    }
  } else {
    // accessory or unknown — show best general wardrobe outfits (anchor shown in UI as add-on)
    for (const top of tops.slice(0, 4)) {
      for (const bottom of bottoms.slice(0, 4)) {
        for (const shoe of shoes.slice(0, 3)) {
          combos.push([top, bottom, shoe])
        }
      }
    }
    for (const dress of dresses.slice(0, 3)) {
      for (const shoe of shoes.slice(0, 3)) {
        combos.push([dress, shoe])
      }
    }
  }

  // ── Score + filter ────────────────────────────────────────────────────────
  type ScoredMatch = {
    items: ScoredItem[]
    tags: string[]
    total: number
    shoeScore: number
  }

  const seen    = new Set<string>()
  const scored: ScoredMatch[] = []

  for (const combo of combos) {
    const key = combo.map((i) => i.id).sort().join("|")
    if (seen.has(key)) continue
    seen.add(key)

    const result = scoreOutfit(combo, {})
    if (!result || result.total < 45) continue

    const shoe = combo.find((i) => i.normCategory === "shoes")
    const shoeScore = shoe
      ? scoreShoeForContext(shoe, combo.filter((i) => i.normCategory !== "shoes"), undefined, undefined)
      : (isShoe ? scoreShoeForContext(anchor, combo.filter((i) => i.normCategory !== "shoes"), undefined, undefined) : 0)

    const tags = Object.entries(STYLE_FAMILIES)
      .filter(([, ftags]) => combo.some((i) => i.styleTags.some((t) => ftags.includes(t))))
      .map(([family]) => family)

    scored.push({ items: combo, tags, total: result.total, shoeScore })
  }

  scored.sort((a, b) => b.total - a.total)

  // ── Deduplicate (same as rankOutfits Pass 1) ──────────────────────────────
  const deduped: ScoredMatch[] = []
  for (const candidate of scored) {
    const isDup = deduped.some((d) => {
      const overlap = candidate.items.filter((i) => d.items.some((di) => di.id === i.id)).length
      return overlap >= candidate.items.length - 1
    })
    if (!isDup) deduped.push(candidate)
    if (deduped.length >= 3) break
  }

  const matches: IncomingItemOutfitMatch[] = deduped.map((d) => {
    const shoeInCombo = d.items.find((i) => i.normCategory === "shoes")
    return {
      id: uid(),
      items: d.items.map(scoredToPlannedItem),
      tags: d.tags,
      score: d.total,
      shoeScore: d.shoeScore,
      shoeItem: shoeInCombo ? scoredToPlannedItem(shoeInCombo) : undefined,
    }
  })

  // ── Determine shoe status ─────────────────────────────────────────────────
  let shoeStatus: ShoeStatus
  let bestShoes: PlannedOutfitItem[] = []

  if (isShoe) {
    shoeStatus = "incoming_is_shoe"
  } else if (shoes.length === 0) {
    shoeStatus = "no_match"
  } else {
    // Score each wardrobe shoe against the new item's style context
    const context = [anchor, ...wardrobe.filter((i) => i.normCategory !== "shoes").slice(0, 2)]
    const scoredShoes = shoes
      .map((s) => ({ shoe: s, score: scoreShoeForContext(s, context.filter((i) => i.normCategory !== "shoes"), undefined, undefined) }))
      .filter(({ score }) => score >= 5)
      .sort((a, b) => b.score - a.score)

    if (scoredShoes.length === 0) {
      shoeStatus = "no_match"
    } else if (scoredShoes.length >= 2) {
      shoeStatus = "multiple"
      bestShoes = scoredShoes.slice(0, 3).map(({ shoe }) => scoredToPlannedItem(shoe))
    } else {
      shoeStatus = "strong_single"
    }
  }

  return { matches, shoeStatus, bestShoes }
}
