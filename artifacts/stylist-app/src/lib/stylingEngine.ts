import type { PurchaseStatus } from "./types"

// ─── Item type the engine works with ────────────────────────────────────────

export type NormCategory = "top" | "bottom" | "dress" | "shoes" | "outerwear" | "accessory"

export type ScoredItem = {
  id: string
  name: string
  image: string
  category: string
  normCategory: NormCategory
  styleTags: string[]
  colors: string[]
  seasonTags: string[]
  wearCount: number
  source: "wardrobe" | "suggestion"
  purchaseStatus: PurchaseStatus
}

// ─── Style knowledge base ────────────────────────────────────────────────────

const NEUTRAL_COLORS = new Set([
  "black", "white", "cream", "beige", "grey", "gray", "navy", "tan",
  "camel", "ivory", "nude", "neutral", "off-white",
])

const WARM_COLORS = new Set([
  "red", "orange", "yellow", "brown", "tan", "camel", "rust", "terracotta", "warm",
])

const COOL_COLORS = new Set([
  "blue", "navy", "purple", "lilac", "green", "teal", "mint", "cool",
])

export const STYLE_FAMILIES: Record<string, string[]> = {
  professional: ["professional", "tailored", "clean", "modest", "polished", "smart casual"],
  casual:       ["relaxed", "casual", "everyday", "simple", "minimal", "cozy", "weekend"],
  elegant:      ["elegant", "dressy", "formal", "polished", "chic", "feminine"],
  bold:         ["bold", "expressive", "statement", "edgy", "party", "fun", "stylish"],
  sporty:       ["sporty", "athletic", "comfortable", "practical", "layered"],
}

const EVENT_REQUIRED_TAGS: Record<string, string[]> = {
  wedding:  ["elegant", "formal", "dressy", "feminine"],
  birthday: ["stylish", "fun", "bold", "expressive"],
  dinner:   ["smart casual", "polished", "elegant", "chic"],
  work:     ["clean", "modest", "professional", "tailored"],
  casual:   ["relaxed", "simple", "everyday", "minimal"],
  party:    ["bold", "expressive", "stylish", "statement"],
  holiday:  ["seasonal", "themed", "festive", "comfortable"],
  travel:   ["comfortable", "practical", "layered", "relaxed"],
}

const OUTFIT_NAMES: Record<string, string[]> = {
  professional: ["Clean Lines", "Desk Ready", "The Work Edit", "Power Polish", "Quiet Authority"],
  casual:       ["Weekend Edit", "Off-Duty Chic", "Effortless Neutral", "Low Key", "Easy Wear"],
  elegant:      ["Quiet Luxury", "Polished Hour", "Evening Edit", "The Classic", "Refined Look"],
  bold:         ["Statement Hour", "Bold Move", "The Standout", "Making Moves", "Expressive Edit"],
  sporty:       ["Active Edit", "On The Go", "Studio to Street", "Move Easy", "Casual Power"],
  default:      ["Tonal Moment", "Clean Slate", "Daily Edit", "The Balance", "Simple Styling"],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function extractColorsFromName(name: string): string[] {
  const lower = name.toLowerCase()
  const hints: [string, string][] = [
    ["black", "black"], ["white", "white"], ["cream", "cream"], ["ivory", "cream"],
    ["beige", "beige"], ["nude", "beige"], ["grey", "grey"], ["gray", "grey"],
    ["brown", "brown"], ["tan", "tan"], ["camel", "camel"],
    ["navy", "navy"], ["blue", "blue"], ["denim", "denim"],
    ["red", "red"], ["pink", "pink"], ["blush", "pink"],
    ["green", "green"], ["olive", "green"],
    ["yellow", "yellow"], ["orange", "orange"],
    ["purple", "purple"], ["lilac", "lilac"],
    ["rust", "rust"], ["terracotta", "rust"],
  ]
  const found = hints.filter(([hint]) => lower.includes(hint)).map(([_, color]) => color)
  return found.length > 0 ? [...new Set(found)] : ["neutral"]
}

function getCurrentSeason(dateStr?: string): string {
  const month = (dateStr ? new Date(dateStr) : new Date()).getMonth() + 1
  // Australian seasons
  if ([12, 1, 2].includes(month)) return "summer"
  if ([3, 4, 5].includes(month)) return "autumn"
  if ([6, 7, 8].includes(month)) return "winter"
  return "spring"
}

function isNeutral(c: string): boolean {
  return NEUTRAL_COLORS.has(c.toLowerCase())
}

function dominantStyleFamily(items: ScoredItem[]): string {
  const allTags = items.flatMap((i) => i.styleTags)
  const scores = Object.entries(STYLE_FAMILIES).map(([family, tags]) => ({
    family,
    count: items.filter((i) => i.styleTags.some((t) => tags.includes(t))).length,
    tagCount: tags.filter((t) => allTags.includes(t)).length,
  }))
  scores.sort((a, b) => b.count - a.count || b.tagCount - a.tagCount)
  return scores[0]?.family ?? "default"
}

function describeColorProfile(items: ScoredItem[]): string {
  const allColors = [...new Set(items.flatMap((i) => i.colors))]
  const neutrals = allColors.filter(isNeutral)
  const accents = allColors.filter((c) => !isNeutral(c))

  if (accents.length === 0) return "tonal neutral palette"
  if (accents.includes("denim") || accents.includes("blue")) {
    const others = neutrals.filter((c) => c !== "blue" && c !== "navy")
    return others.length > 0 ? `denim with ${others[0]} base` : "classic denim look"
  }
  if (accents.length === 1 && neutrals.length >= 1)
    return `neutral base with ${accents[0]} accent`
  if (accents.length >= 2) return `${accents[0]} and ${accents[1]} palette`
  return "clean neutral base"
}

function generateOutfitName(
  family: string,
  usedNames: Set<string>
): string {
  // Deduplicate pool so we never run out of unique names before usedNames fills
  const pool = [...new Set([...(OUTFIT_NAMES[family] ?? []), ...OUTFIT_NAMES.default])]
  for (const name of pool) {
    if (!usedNames.has(name)) return name
  }
  // Absolute fallback: numbered suffix
  const base = pool[0] ?? "Outfit"
  let i = 2
  while (usedNames.has(`${base} ${i}`)) i++
  return `${base} ${i}`
}

function pick(pool: string[], seed?: number): string {
  if (pool.length === 0) return ""
  const idx = seed !== undefined ? seed % pool.length : Math.floor(Math.random() * pool.length)
  return pool[idx]
}

function buildReason(
  family: string,
  colorProfile: string,
  eventType: string | undefined,
  score: number
): string {
  const eventClause = eventType ? ` for ${eventType}` : ""
  const reasonsByFamily: Record<string, string[]> = {
    professional: [
      `Structured and clean${eventClause} — works with the ${colorProfile}.`,
      `Sharp pieces with a ${colorProfile} — looks intentional and put together.`,
      `Polished combination${eventClause} built on a ${colorProfile}.`,
    ],
    elegant: [
      `Refined and elevated${eventClause} — the ${colorProfile} adds quiet sophistication.`,
      `Clean elegance${eventClause} — the ${colorProfile} keeps it understated.`,
      `Dressed-up combination${eventClause} grounded in a ${colorProfile}.`,
    ],
    casual: [
      `Easy to wear${eventClause} and effortless — the ${colorProfile} keeps it relaxed.`,
      `Laid-back and well-balanced${eventClause} with a ${colorProfile}.`,
      `Low-key${eventClause} but considered — built on a ${colorProfile}.`,
    ],
    bold: [
      `Confident combination${eventClause} — the ${colorProfile} gives it personality.`,
      `Expressive${eventClause} — the ${colorProfile} sets the tone.`,
      `Makes a statement${eventClause} with a ${colorProfile} as the base.`,
    ],
    sporty: [
      `Practical and comfortable${eventClause} — ${colorProfile} keeps it cohesive.`,
      `Easy, active feel${eventClause} with a ${colorProfile}.`,
    ],
  }
  const pool = reasonsByFamily[family] ?? [
    `Well-balanced combination${eventClause} with a ${colorProfile}.`,
    `Versatile${eventClause} — the ${colorProfile} does the work.`,
  ]
  return pick(pool)
}

function buildTips(
  items: ScoredItem[],
  family: string,
  colorProfile: string,
  breakdown: Record<string, number>,
  eventType: string | undefined
): string[] {
  const tips: string[] = []
  const allColors = items.flatMap((i) => i.colors.map((c) => c.toLowerCase()))
  const allTags = items.flatMap((i) => i.styleTags)
  const neutralColors = [...new Set(allColors.filter(isNeutral))]
  const accentColors = [...new Set(allColors.filter((c) => !isNeutral(c)))]
  const shoe = items.find((i) => i.normCategory === "shoes")
  const outerwear = items.find((i) => i.normCategory === "outerwear")
  const hasDenim = accentColors.includes("denim") || accentColors.includes("blue")

  // ── 1. Colour tip ──────────────────────────────────────────────────────────
  if (accentColors.length === 0) {
    if (neutralColors.length >= 3) {
      tips.push(pick([
        "Three neutral tones layered together adds depth without any clutter",
        "A mix of neutrals reads as put-together without trying too hard",
        "Tonal dressing in different shades of neutral is quietly sophisticated",
      ]))
    } else if (neutralColors.length === 2) {
      tips.push(pick([
        `${cap(neutralColors[0])} and ${neutralColors[1]} is one of the cleanest pairings there is`,
        "Two-tone neutral is timeless — works for almost any occasion",
        "Keeping it to two neutrals keeps the eye focused on the silhouette",
      ]))
    } else {
      tips.push(pick([
        "Head-to-toe single colour is bold and intentional — commit to it",
        "Monochromatic dressing creates a strong, streamlined effect",
        "One colour from top to toe signals real confidence",
      ]))
    }
  } else if (hasDenim) {
    tips.push(pick([
      "Denim grounds the look with a relaxed, lived-in feel",
      "Blue denim next to neutrals is an effortless combination — always works",
      "Denim adds just enough texture to keep the outfit interesting",
    ]))
  } else {
    tips.push(pick([
      `The ${accentColors[0]} accent gives the neutral base a lift without overwhelming it`,
      `One colour accent is enough — the ${accentColors[0]} earns its place here`,
      `The ${colorProfile} is doing a lot of the work — it looks considered`,
    ]))
  }

  // ── 2. Style / family tip ─────────────────────────────────────────────────
  const familyTips: Record<string, string[]> = {
    professional: [
      "Tailored pieces keep the silhouette sharp — minimal effort, strong result",
      "Structured shapes signal confidence without needing to say a word",
      "Clean lines are doing the heavy lifting here — that's the point",
    ],
    elegant: [
      "Refined pieces translate well from day into evening without changing",
      "The elevated base makes this feel dressed without looking overdone",
      "A polished combination like this is harder to get wrong than it looks",
    ],
    casual: [
      "Relaxed fit keeps this comfortable without losing its shape",
      "Low-key doesn't mean low-effort — this reads as well considered",
      "Easy pieces that look good without any overthinking",
    ],
    bold: [
      "This combination has a clear personality — wear it with conviction",
      "Statement dressing works best when the rest stays simple",
      "There's intention here — that's what makes bold styling work",
    ],
    sporty: [
      "Practical pieces that still look put-together — best of both",
      "Comfort and style aren't mutually exclusive — this proves it",
      "A clean active look works better than most people expect",
    ],
  }
  if (familyTips[family]) {
    tips.push(pick(familyTips[family]))
  }

  // ── 3. Footwear tip ───────────────────────────────────────────────────────
  if (shoe) {
    const shTags = shoe.styleTags
    if (shTags.some((t) => ["sporty", "casual"].includes(t))) {
      if (family === "professional" || family === "elegant") {
        tips.push(pick([
          "Casual shoes soften the polish just enough — avoids looking stiff",
          "Relaxed footwear keeps this from feeling too formal — good balance",
        ]))
      } else {
        tips.push(pick([
          "Clean sneakers work as a neutral — they don't compete with the outfit",
          "White sneakers keep it fresh without adding visual noise",
        ]))
      }
    } else if (shTags.some((t) => ["elegant", "dressy", "formal"].includes(t))) {
      tips.push(pick([
        "Dress shoes tie the whole look together with a clean, finished feel",
        "A sleek shoe anchors the outfit and takes it up a level",
      ]))
    } else if (shTags.some((t) => ["smart casual", "polished"].includes(t))) {
      tips.push(pick([
        "Loafers hit the sweet spot between dressed and relaxed",
        "Smart shoes elevate the look without making it stiff or formal",
      ]))
    }
  }

  // ── 4. Outerwear or layer tip ─────────────────────────────────────────────
  if (outerwear) {
    const owTags = outerwear.styleTags
    if (owTags.some((t) => ["tailored", "professional", "smart casual"].includes(t))) {
      tips.push(pick([
        "A structured outer layer sharpens everything underneath",
        "The jacket gives the outfit a frame — makes it look purposeful",
      ]))
    } else {
      tips.push(pick([
        "Layering adds dimension without complicating the palette",
        "A good outer layer ties everything underneath into one look",
      ]))
    }
  }

  // ── 5. Event-specific tip ─────────────────────────────────────────────────
  if (eventType && breakdown.eventMatch >= 20) {
    const eTips: Record<string, string[]> = {
      work: ["Office-appropriate but not boring — that's the sweet spot"],
      dinner: ["Smart enough for dinner without feeling overdressed"],
      wedding: ["Guest-appropriate — polished without stealing focus"],
      party: ["Stands out without being too much — ideal for a party"],
      travel: ["Travel-friendly pieces that still look like an actual outfit"],
    }
    if (eTips[eventType]) tips.push(pick(eTips[eventType]))
  }

  // ── 6. Off-season note ───────────────────────────────────────────────────
  if (breakdown.seasonSuitability < 7) {
    tips.push(pick([
      "A couple of pieces skew off-season, but the overall combination still holds",
      "Not every piece is season-perfect here, but it still comes together",
    ]))
  }

  // Return 2–4 tips, always at least 2
  const result = [...new Set(tips)].slice(0, 4)
  return result.length >= 2 ? result : [...result, "Works as a base — accessories can take it in any direction"]
}

function buildUpgrade(
  items: ScoredItem[],
  family: string,
  score: number
): string | undefined {
  // Only suggest an upgrade when there's meaningful room to improve
  if (score >= 80) return undefined

  const shoe = items.find((i) => i.normCategory === "shoes")
  const bottom = items.find((i) => i.normCategory === "bottom")
  const hasOuterwear = items.some((i) => i.normCategory === "outerwear")
  const hasDenim =
    bottom?.colors.some((c) => ["denim", "blue"].includes(c)) ?? false

  if (shoe?.styleTags.some((t) => ["sporty", "casual"].includes(t))) {
    if (family === "professional" || family === "elegant") {
      return pick([
        "Swap the sneakers for a loafer or ankle boot — it'd take this up a notch",
        "Try a sleeker shoe here to sharpen the look",
      ])
    }
  }

  if (!hasOuterwear && score < 74 && (family === "professional" || family === "elegant")) {
    return pick([
      "Add a blazer or structured jacket — it gives the look more presence",
      "Throw on a jacket to make this feel more intentional",
    ])
  }

  if (hasDenim && (family === "professional" || family === "elegant")) {
    return pick([
      "Swap the jeans for tailored trousers and this becomes significantly more polished",
      "Try trousers instead of denim here — same ease, cleaner result",
    ])
  }

  if (score < 66) {
    return pick([
      "A tonal shoe choice would tie the look together more neatly",
      "Try pairing your most structured pieces for a cleaner result",
    ])
  }

  return undefined
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Completeness check ───────────────────────────────────────────────────────

export function isComplete(items: ScoredItem[]): boolean {
  const cats = new Set(items.map((i) => i.normCategory))
  if (!cats.has("shoes")) return false
  if (cats.has("dress")) return true
  return cats.has("top") && cats.has("bottom")
}

export function getMissingPiece(items: ScoredItem[]): string | undefined {
  const cats = new Set(items.map((i) => i.normCategory))
  if (!cats.has("shoes")) return "neutral shoes"
  if (!cats.has("top") && !cats.has("dress")) return "a versatile top"
  if (!cats.has("bottom") && !cats.has("dress")) return "trousers or a skirt"
  return undefined
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export type StylePreferences = {
  styleTags: Record<string, number>
  colors: Record<string, number>
}

export const DEFAULT_PREFERENCES: StylePreferences = { styleTags: {}, colors: {} }

export function scoreOutfit(
  items: ScoredItem[],
  opts: {
    eventType?: string
    preferences?: StylePreferences
    usedItemIds?: Set<string>
    dateStr?: string
  }
): { total: number; breakdown: Record<string, number>; dominantFamily: string; colorProfile: string } | null {
  if (!isComplete(items)) return null

  const { eventType, preferences = DEFAULT_PREFERENCES, usedItemIds = new Set(), dateStr } = opts

  // 2. Event match — 30 pts
  let eventMatch = 15
  if (eventType) {
    const required = EVENT_REQUIRED_TAGS[eventType] ?? []
    const allTags = items.flatMap((i) => i.styleTags.map((t) => t.toLowerCase()))
    const matched = required.filter((t) =>
      allTags.some((tag) => tag.includes(t.toLowerCase()))
    ).length
    eventMatch = required.length > 0 ? Math.round((matched / required.length) * 30) : 15
  }

  // 3. Colour harmony — 25 pts
  const allColors = items.flatMap((i) => i.colors.map((c) => c.toLowerCase()))
  const neutralColors = allColors.filter(isNeutral)
  const neutralCount = neutralColors.length
  const accentColors = allColors.filter((c) => !isNeutral(c))
  const hasDenim = accentColors.some((c) => c === "denim" || c === "blue")
  const warmCount = accentColors.filter((c) => WARM_COLORS.has(c)).length
  const coolCount = accentColors.filter((c) => COOL_COLORS.has(c)).length
  const uniqueNeutrals = new Set(neutralColors)

  let colourHarmony: number
  if (accentColors.length === 0) {
    // All neutral — reward palette variety over monochromatic
    colourHarmony = uniqueNeutrals.size >= 3 ? 23 : uniqueNeutrals.size === 2 ? 20 : 16
  } else if (hasDenim && neutralCount >= 1 && accentColors.length <= 2) {
    colourHarmony = 20
  } else if (accentColors.length === 1 && neutralCount >= 1) {
    colourHarmony = 25
  } else if (warmCount > 0 && coolCount > 0) {
    colourHarmony = 8
  } else if (accentColors.length === 2) {
    colourHarmony = 16
  } else if (accentColors.length > 2) {
    colourHarmony = 8
  } else {
    colourHarmony = 14
  }

  // 4. Style consistency — 20 pts
  // Use tag-overlap ratio: how much does each item's style vocab overlap with the rest?
  const allTags = items.flatMap((i) => i.styleTags)
  const tagOverlapRatios = items.map((item) => {
    const otherTags = new Set(
      items.filter((o) => o.id !== item.id).flatMap((o) => o.styleTags)
    )
    return item.styleTags.length > 0
      ? item.styleTags.filter((t) => otherTags.has(t)).length / item.styleTags.length
      : 0
  })
  const avgOverlap = tagOverlapRatios.reduce((a, b) => a + b, 0) / items.length
  const styleConsistency = Math.round(avgOverlap * 20)

  // Penalty: formal + sport clash
  const hasFormal = allTags.some((t) => ["elegant", "formal", "dressy"].includes(t))
  const hasSport = allTags.some((t) => ["sporty", "athletic"].includes(t))
  const clashPenalty = hasFormal && hasSport ? -8 : 0

  // 5. Season suitability — 10 pts
  const season = getCurrentSeason(dateStr)
  const seasonMatches = items.filter((i) => {
    const tags = i.seasonTags.length > 0 ? i.seasonTags : ["all-season"]
    return tags.includes(season) || tags.includes("all-season")
  }).length
  const seasonSuitability = Math.round((seasonMatches / items.length) * 10)

  // 6. User preference — 10 pts
  let prefScore = 5
  for (const tag of allTags) {
    prefScore += (preferences.styleTags[tag] ?? 0) * 0.5
  }
  for (const color of allColors) {
    prefScore += (preferences.colors[color] ?? 0) * 0.5
  }
  const userPreference = Math.max(0, Math.min(10, Math.round(prefScore)))

  // 7. Freshness — 5 pts
  // When no session tracking exists, use wearCount to reward unworn items
  let freshness: number
  if (usedItemIds.size === 0) {
    const avgWear = items.reduce((s, i) => s + (i.wearCount ?? 0), 0) / items.length
    freshness = Math.max(0, Math.round(5 - Math.min(5, avgWear)))
  } else {
    const freshItems = items.filter((i) => !usedItemIds.has(i.id)).length
    freshness = Math.round((freshItems / items.length) * 5)
  }

  const total = Math.max(
    0,
    Math.min(100, eventMatch + colourHarmony + styleConsistency + clashPenalty + seasonSuitability + userPreference + freshness)
  )

  const family = dominantStyleFamily(items)
  const colorProfile = describeColorProfile(items)

  return {
    total,
    breakdown: { eventMatch, colourHarmony, styleConsistency, seasonSuitability, userPreference, freshness },
    dominantFamily: family,
    colorProfile,
  }
}

// ─── Combination builder ──────────────────────────────────────────────────────

function buildCombinations(pool: ScoredItem[]): ScoredItem[][] {
  const tops      = pool.filter((i) => i.normCategory === "top")
  const bottoms   = pool.filter((i) => i.normCategory === "bottom")
  const dresses   = pool.filter((i) => i.normCategory === "dress")
  const shoes     = pool.filter((i) => i.normCategory === "shoes")
  const outerwear = pool.filter((i) => i.normCategory === "outerwear")

  const combos: ScoredItem[][] = []

  // top + bottom + shoes (± outerwear)
  for (const top of tops.slice(0, 5)) {
    for (const bottom of bottoms.slice(0, 5)) {
      for (const shoe of shoes.slice(0, 4)) {
        combos.push([top, bottom, shoe])
        for (const ow of outerwear.slice(0, 2)) {
          combos.push([top, bottom, shoe, ow])
        }
      }
    }
  }

  // dress + shoes (± outerwear)
  for (const dress of dresses.slice(0, 4)) {
    for (const shoe of shoes.slice(0, 4)) {
      combos.push([dress, shoe])
      for (const ow of outerwear.slice(0, 2)) {
        combos.push([dress, shoe, ow])
      }
    }
  }

  return combos
}

// ─── Main ranking function ────────────────────────────────────────────────────

export type RankedOutfit = {
  id: string
  name: string
  items: ScoredItem[]
  score: number
  confidence: "high" | "safe" | "experimental"
  tags: string[]
  reason: string
  tips: string[]
  upgrade?: string
  gapSuggestion?: string
  breakdown: Record<string, number>
}

type ScoredCombo = {
  _key: string
  id: string
  items: ScoredItem[]
  score: number
  confidence: RankedOutfit["confidence"]
  tags: string[]
  reason: string
  tips: string[]
  upgrade?: string
  dominantFamily: string
  colorProfile: string
  breakdown: Record<string, number>
  gapSuggestion?: string
}

export function rankOutfits(
  pool: ScoredItem[],
  opts: {
    eventType?: string
    preferences?: StylePreferences
    usedItemIds?: Set<string>
    usedOutfitNames?: Set<string>
    dateStr?: string
    maxResults?: number
  }
): RankedOutfit[] {
  const combos = buildCombinations(pool)
  const seen = new Set<string>()
  const scored: ScoredCombo[] = []

  for (const combo of combos) {
    const key = combo.map((i) => i.id).sort().join("|")
    if (seen.has(key)) continue
    seen.add(key)

    const result = scoreOutfit(combo, opts)
    if (!result || result.total < 50) continue

    const { total, breakdown, dominantFamily, colorProfile } = result
    const confidence: RankedOutfit["confidence"] =
      total >= 82 ? "high" : total >= 65 ? "safe" : "experimental"

    const tags = Object.entries(STYLE_FAMILIES)
      .filter(([, ftags]) => combo.some((i) => i.styleTags.some((t) => ftags.includes(t))))
      .map(([family]) => family)

    scored.push({
      _key: key,
      id: Math.random().toString(36).slice(2, 10),
      items: combo,
      score: total,
      confidence,
      tags,
      reason: buildReason(dominantFamily, colorProfile, opts.eventType, total),
      tips: [],           // built after deduplication for surviving outfits only
      dominantFamily,
      colorProfile,
      breakdown,
    })
  }

  scored.sort((a, b) => b.score - a.score)

  // Deduplicate by item overlap — avoid nearly identical outfits
  const deduplicated: ScoredCombo[] = []
  for (const outfit of scored) {
    const isDuplicate = deduplicated.some((f) => {
      const overlap = outfit.items.filter((i) => f.items.some((fi) => fi.id === i.id)).length
      return overlap >= outfit.items.length - 1
    })
    if (!isDuplicate) {
      deduplicated.push(outfit)
      if (deduplicated.length >= (opts.maxResults ?? 5)) break
    }
  }

  // Assign names + build insight content only for surviving outfits
  const usedNames = new Set<string>(opts.usedOutfitNames ?? [])
  const final: RankedOutfit[] = deduplicated.map((outfit) => {
    const name = generateOutfitName(outfit.dominantFamily, usedNames)
    usedNames.add(name)
    const tips = buildTips(outfit.items, outfit.dominantFamily, outfit.colorProfile, outfit.breakdown, opts.eventType)
    const upgrade = buildUpgrade(outfit.items, outfit.dominantFamily, outfit.score)
    const { _key, dominantFamily: _df, colorProfile: _cp, ...rest } = outfit
    return { ...rest, name, tips, upgrade }
  })

  // Gap suggestion when wardrobe is thin
  if (final.length === 0) {
    const missing = getMissingPiece(pool)
    if (missing) {
      const gapSuggestion = `Add ${missing} to unlock better outfit combinations.`
      if (pool.length > 0) {
        final.push({
          id: Math.random().toString(36).slice(2, 10),
          name: "Best Available",
          items: pool.slice(0, 3),
          score: 40,
          confidence: "experimental",
          tags: ["minimal"],
          reason: "Limited wardrobe — add more pieces for better suggestions.",
          tips: ["Add more pieces to get full styling insights"],
          gapSuggestion,
          breakdown: {},
        })
      }
    }
  }

  return final
}
