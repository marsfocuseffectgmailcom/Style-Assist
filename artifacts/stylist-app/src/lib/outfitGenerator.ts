import type { WardrobeItem } from "./mockData"
import type { IncomingItem, PlannedOutfitItem, OutfitConfidence, TimelineOutfit } from "./types"

export type GeneratedOutfit = {
  id: string
  name: string
  items: PlannedOutfitItem[]
  confidence: OutfitConfidence
  tags: string[]
}

type NormalisedItem = PlannedOutfitItem & {
  normCategory: "top" | "bottom" | "dress" | "shoes" | "outerwear" | "accessory"
}

function wardrobeToNorm(item: WardrobeItem): NormalisedItem {
  const catMap: Record<string, NormalisedItem["normCategory"]> = {
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
    source: "wardrobe",
    purchaseStatus: "arrived",
    normCategory: catMap[item.category] ?? "top",
  }
}

function incomingToNorm(item: IncomingItem): NormalisedItem {
  return {
    id: item.id,
    name: item.name,
    image: item.image,
    category: item.category,
    source: "suggestion",
    purchaseStatus: "waiting_for_delivery",
    normCategory: item.category,
  }
}

const outfitNames = [
  "Effortless Neutral",
  "Clean & Classic",
  "Weekend Edit",
  "Tonal Moment",
  "Smart Casual",
  "Quiet Luxury",
  "Off-Duty Chic",
]

const tagsByStyle: Record<string, string[]> = {
  wedding: ["elegant", "dressy", "feminine"],
  birthday: ["fun", "bold", "stylish"],
  dinner: ["chic", "smart casual", "polished"],
  work: ["professional", "tailored", "clean"],
  casual: ["relaxed", "everyday", "minimal"],
  party: ["expressive", "evening", "statement"],
  holiday: ["seasonal", "comfortable", "festive"],
  travel: ["practical", "comfortable", "layered"],
  default: ["minimal", "tonal", "classic"],
}

function confidence(
  hasShoes: boolean,
  hasTopOrDress: boolean,
  hasBottomOrDress: boolean,
  eventMatch: boolean
): OutfitConfidence {
  const complete = hasShoes && hasTopOrDress && hasBottomOrDress
  if (complete && eventMatch) return "high"
  if (complete) return "safe"
  return "experimental"
}

export function generateOutfits(
  date: string,
  wardrobeItems: WardrobeItem[],
  incomingItems: IncomingItem[],
  eventType?: string
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

  const all: NormalisedItem[] = [
    ...wardrobeItems.map(wardrobeToNorm),
    ...eligibleIncoming.map(incomingToNorm),
  ]

  const tops = all.filter((i) => i.normCategory === "top")
  const bottoms = all.filter((i) => i.normCategory === "bottom")
  const dresses = all.filter((i) => i.normCategory === "dress")
  const shoes = all.filter((i) => i.normCategory === "shoes")
  const outerwear = all.filter((i) => i.normCategory === "outerwear")

  const styleTags = tagsByStyle[eventType ?? ""] ?? tagsByStyle.default
  const results: GeneratedOutfit[] = []

  function makeItem(n: NormalisedItem): PlannedOutfitItem {
    return {
      id: n.id,
      name: n.name,
      image: n.image,
      category: n.category,
      source: n.source,
      purchaseStatus: n.purchaseStatus,
    }
  }

  let nameIdx = 0

  function addCombo(items: NormalisedItem[], eventMatch: boolean) {
    if (results.length >= 5) return
    const hasShoes = items.some((i) => i.normCategory === "shoes")
    const hasTopOrDress = items.some(
      (i) => i.normCategory === "top" || i.normCategory === "dress"
    )
    const hasBottomOrDress = items.some(
      (i) => i.normCategory === "bottom" || i.normCategory === "dress"
    )
    results.push({
      id: uid(),
      name: outfitNames[nameIdx++ % outfitNames.length],
      items: items.map(makeItem),
      confidence: confidence(hasShoes, hasTopOrDress, hasBottomOrDress, eventMatch),
      tags: styleTags,
    })
  }

  for (let i = 0; i < Math.min(tops.length, 3); i++) {
    for (let j = 0; j < Math.min(bottoms.length, 2); j++) {
      if (results.length >= 3) break
      const combo: NormalisedItem[] = [tops[i], bottoms[j]]
      if (shoes[i % shoes.length]) combo.push(shoes[i % shoes.length])
      if (outerwear[i % outerwear.length]) combo.push(outerwear[i % outerwear.length])
      addCombo(combo, !!eventType)
    }
  }

  for (let i = 0; i < dresses.length && results.length < 5; i++) {
    const combo: NormalisedItem[] = [dresses[i]]
    if (shoes[i % shoes.length]) combo.push(shoes[i % shoes.length])
    if (outerwear[i % outerwear.length]) combo.push(outerwear[i % outerwear.length])
    addCombo(combo, !!eventType)
  }

  if (results.length === 0 && all.length > 0) {
    addCombo(all.slice(0, 3), false)
  }

  return results
}

export function generateMonthPlan(
  wardrobeItems: WardrobeItem[],
  incomingItems: IncomingItem[],
  existingDates: Set<string>
): TimelineOutfit[] {
  const outfits: TimelineOutfit[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 28; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    if (existingDates.has(dateStr)) continue

    const generated = generateOutfits(dateStr, wardrobeItems, incomingItems)
    if (generated.length === 0) continue

    const best = generated[0]
    outfits.push({
      id: uid(),
      date: dateStr,
      name: best.name,
      items: best.items,
      confidence: best.confidence,
      tags: best.tags,
      createdAt: new Date().toISOString(),
    })
  }

  return outfits
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
