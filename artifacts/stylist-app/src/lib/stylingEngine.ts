import type { PurchaseStatus } from "./types"
import type { ItemPreferences } from "../hooks/useItemPreferences"

// ─── Item type the engine works with ────────────────────────────────────────

export type NormCategory = "top" | "bottom" | "dress" | "shoes" | "outerwear" | "accessory" | "bag"

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

// ─── Effortless Precision personality ────────────────────────────────────────
// Principle: anchor + one accent · silhouette balance · one elevation element
// Priority: clarity > creativity · balance > boldness · simplicity > variety

const OUTFIT_NAMES: Record<string, string[]> = {
  professional: ["Clean Anchor", "Structured Ease", "Quiet Authority", "Precise", "The Work Edit"],
  casual:       ["Balanced", "Clean and Easy", "Grounded", "The Quiet Edit", "Effortless Anchor"],
  elegant:      ["Still", "Quiet Precision", "Clean Elevation", "The Edit", "Composed"],
  bold:         ["One Statement", "Anchored Edge", "Clear Signal", "Controlled", "Defined"],
  sporty:       ["Clean Function", "Deliberate Ease", "Structured Sport", "Composed Move", "Active Anchor"],
  default:      ["The Anchor", "Quiet Balance", "Clean Form", "One Step", "Considered"],
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

// ─── Effortless Precision: reason builders ────────────────────────────────────
// Voice: calm · confident · minimal · no excitement qualifiers

function buildReason(
  family: string,
  colorProfile: string,
  eventType: string | undefined,
  score: number
): string {
  const eventClause = eventType ? ` for ${eventType}` : ""
  const reasonsByFamily: Record<string, string[]> = {
    professional: [
      `Structured anchor, clean silhouette${eventClause}. The ${colorProfile} keeps it precise.`,
      `Clear lines, nothing competing${eventClause}. The ${colorProfile} does the work.`,
      `One direction, well-edited${eventClause} — the ${colorProfile} holds it together.`,
    ],
    elegant: [
      `Understated${eventClause}. The ${colorProfile} adds elevation without effort.`,
      `Quiet precision${eventClause} — the ${colorProfile} is the right choice here.`,
      `One elevation point, everything else restrained${eventClause}. Built on a ${colorProfile}.`,
    ],
    casual: [
      `Balanced${eventClause}. The ${colorProfile} keeps it grounded without trying.`,
      `One relaxed piece, one structured — the ${colorProfile} ties it together${eventClause}.`,
      `Nothing excessive${eventClause}. The ${colorProfile} is doing exactly what it should.`,
    ],
    bold: [
      `One statement, the rest restrained${eventClause}. The ${colorProfile} anchors it.`,
      `A single accent on a clean base${eventClause} — the ${colorProfile} controls the energy.`,
      `Clear signal${eventClause}. The ${colorProfile} keeps this from tipping over.`,
    ],
    sporty: [
      `Deliberate and clean${eventClause}. The ${colorProfile} keeps it cohesive.`,
      `Function without clutter${eventClause} — the ${colorProfile} holds the look together.`,
    ],
  }
  const pool = reasonsByFamily[family] ?? [
    `Well-anchored${eventClause}. The ${colorProfile} gives it clarity.`,
    `Clean and considered${eventClause} — the ${colorProfile} carries the look.`,
  ]
  return pick(pool)
}

// ─── Effortless Precision: tip builders ──────────────────────────────────────
// Each tip references a specific EP principle: anchor · accent · elevation · balance

function buildTips(
  items: ScoredItem[],
  family: string,
  colorProfile: string,
  breakdown: Record<string, number>,
  eventType: string | undefined,
  itemPreferences?: ItemPreferences
): string[] {
  const tips: string[] = []
  const allColors = items.flatMap((i) => i.colors.map((c) => c.toLowerCase()))
  const allTags = items.flatMap((i) => i.styleTags)
  const neutralColors = [...new Set(allColors.filter(isNeutral))]
  const accentColors = [...new Set(allColors.filter((c) => !isNeutral(c)))]
  const shoe = items.find((i) => i.normCategory === "shoes")
  const outerwear = items.find((i) => i.normCategory === "outerwear")
  const hasDenim = accentColors.includes("denim") || accentColors.includes("blue")
  const hasMultipleAccents = accentColors.filter((c) => c !== "denim" && c !== "blue").length > 1

  // ── 1. Anchor + accent (colour structure) tip ─────────────────────────────
  if (accentColors.length === 0) {
    if (neutralColors.length >= 3) {
      tips.push(pick([
        "Three neutrals in one look — each tone plays a supporting role, nothing dominates",
        "A tonal neutral palette is the clearest expression of Effortless Precision",
        "Depth through tone, not colour. The silhouette carries the look",
      ]))
    } else if (neutralColors.length === 2) {
      tips.push(pick([
        `${cap(neutralColors[0])} anchors, ${neutralColors[1]} balances. Two neutrals is the cleanest structure`,
        "Two neutrals keep the eye focused on fit and silhouette — that's where it should land",
        "A two-tone neutral base is timeless. It works every time, without exception",
      ]))
    } else {
      tips.push(pick([
        "One colour, head to toe — the silhouette becomes the statement",
        "Monochromatic dressing removes all decisions except fit. That's the point",
        "Single colour creates a clean, streamlined line. Precision by default",
      ]))
    }
  } else if (hasDenim) {
    tips.push(pick([
      "Denim as the anchor — relaxed, grounded, always works with a neutral",
      "Blue denim next to a neutral is a proven structure. Uncomplicated and right",
      "Denim grounds the base. The neutral on top keeps it balanced",
    ]))
  } else if (hasMultipleAccents) {
    tips.push(pick([
      "Two accents is a crowded palette — let one of them lead, the other follow",
      "Multiple strong colours compete for attention. One anchor, one accent is cleaner",
    ]))
  } else {
    tips.push(pick([
      `The neutral base is the anchor. The ${accentColors[0]} is the only accent — that's the right call`,
      `One ${accentColors[0]} accent on a neutral base. Nothing competes. That's the structure`,
      `Anchor + single accent. The ${colorProfile} is correctly balanced`,
    ]))
  }

  // ── 2. Silhouette balance or family tip ───────────────────────────────────
  const tailoredItems = items.filter((i) => i.styleTags.some((t) => ["tailored", "structured", "fitted"].includes(t)))
  const relaxedItems = items.filter((i) => i.styleTags.some((t) => ["relaxed", "casual", "cozy", "comfortable"].includes(t)))
  const hasSilhouetteBalance = tailoredItems.length > 0 && relaxedItems.length > 0

  if (hasSilhouetteBalance) {
    tips.push(pick([
      "One structured piece, one relaxed — that tension is what makes the silhouette interesting",
      "Fitted meets relaxed. That contrast is intentional and it works",
      "Silhouette balance: the structured piece gives shape, the relaxed piece gives ease",
    ]))
  } else {
    const familyTips: Record<string, string[]> = {
      professional: [
        "Clean, structured shapes do the work without asking for attention",
        "Tailored silhouette signals precision — no extra effort required",
        "Structure is the statement here. Everything else is secondary",
      ],
      elegant: [
        "Elevated pieces that don't try too hard — that's the mark of a precise wardrobe",
        "The elevation is built in. Nothing needs to be added",
        "Quiet formality — polished without performance",
      ],
      casual: [
        "Relaxed fit, clean lines. Comfort and precision aren't mutually exclusive",
        "Easy pieces, well-chosen. Casual doesn't mean unconsidered",
        "The simplicity is doing the heavy lifting here",
      ],
      bold: [
        "One strong element, everything else deliberate. That's controlled expression",
        "Bold and restrained at the same time — that's the harder skill",
        "The accent earns attention because the base doesn't compete",
      ],
      sporty: [
        "Functional pieces kept clean. Active without being casual",
        "Comfort without clutter — practical and precise",
        "Clean active dressing is underrated. This reads better than it should",
      ],
    }
    if (familyTips[family]) tips.push(pick(familyTips[family]))
  }

  // ── 3. Elevation element tip ──────────────────────────────────────────────
  // EP rule: always one subtle elevation point (jacket, shoes, structure)
  if (outerwear) {
    const owTags = outerwear.styleTags
    if (owTags.some((t) => ["tailored", "professional", "structured", "smart casual"].includes(t))) {
      tips.push(pick([
        "The jacket is the elevation point — it frames everything underneath",
        "A structured outer layer is doing quiet, precise work here",
        "The outerwear provides the structure. It's the right elevation choice",
      ]))
    } else {
      tips.push(pick([
        "The outer layer ties the look into one deliberate decision",
        "Layering adds dimension without complicating the palette",
      ]))
    }
  } else if (shoe) {
    const shTags = shoe.styleTags
    if (shTags.some((t) => ["elegant", "dressy", "formal", "smart casual", "polished"].includes(t))) {
      tips.push(pick([
        "The shoe is the elevation point — one precise detail lifts the whole look",
        "Smart footwear carries the elevation here. The rest stays relaxed",
        "Shoes as the single elevation element — clean, deliberate, effective",
      ]))
    } else if (shTags.some((t) => ["sporty", "casual"].includes(t))) {
      if (family === "professional" || family === "elegant") {
        tips.push(pick([
          "Casual shoes soften an otherwise structured look — deliberate contrast",
          "Relaxed footwear keeps this from feeling stiff. Good tension",
        ]))
      } else {
        tips.push(pick([
          "Clean sneakers work as a neutral — they don't compete with anything",
          "White sneakers keep it grounded without adding noise",
        ]))
      }
    }
  }

  // ── 4. Event-specific tip ─────────────────────────────────────────────────
  if (eventType && breakdown.eventMatch >= 20) {
    const eTips: Record<string, string[]> = {
      work:    ["Calibrated for the office — precise without being rigid"],
      dinner:  ["Appropriate for dinner without being overdressed. That's the balance"],
      wedding: ["Guest-appropriate — considered, not competing"],
      party:   ["Stands out because it's controlled, not because it's loud"],
      travel:  ["Practical pieces that still hold together as an actual outfit"],
    }
    if (eTips[eventType]) tips.push(pick(eTips[eventType]))
  }

  // ── 5. Off-season note ────────────────────────────────────────────────────
  if (breakdown.seasonSuitability < 7) {
    tips.push(pick([
      "A couple of pieces skew off-season — the overall structure still holds",
      "Not season-perfect, but the balance is sound",
    ]))
  }

  // ── 6. Rotation tip — "not-lately" items get a positive re-introduction ──────
  // Never negative. Always explains why the piece works in this specific outfit.
  if (itemPreferences) {
    const rotationItems = items.filter((i) => itemPreferences[i.id]?.reach === "not-lately")
    if (rotationItems.length > 0) {
      const ri = rotationItems[0]
      const riColors = ri.colors.filter((c) => !isNeutral(c))
      const colorNote = riColors.length > 0
        ? `the ${riColors[0]} grounds the palette and adds depth`
        : `the neutral tone anchors the palette without competing`
      tips.push(pick([
        `Bringing this back into rotation works here because ${colorNote} — it gives the look more shape.`,
        `This piece earns its place — ${colorNote} and the silhouette fits cleanly into the outfit structure.`,
        `A considered return for this piece. ${colorNote.charAt(0).toUpperCase() + colorNote.slice(1)}, and the proportions sit well with everything else.`,
      ]))
    }
  }

  // Return 2–4 tips, always at least 2
  const result = [...new Set(tips)].slice(0, 4)
  return result.length >= 2
    ? result
    : [...result, "A clean base — add one considered accessory if needed, nothing more"]
}

// ─── Effortless Precision: upgrade builders ───────────────────────────────────
// Goal: push toward clarity, balance, and elevation — never toward complexity

function buildUpgrade(
  items: ScoredItem[],
  family: string,
  score: number
): string | undefined {
  if (score >= 82) return undefined  // high match: already EP-aligned, no note needed

  const shoe = items.find((i) => i.normCategory === "shoes")
  const bottom = items.find((i) => i.normCategory === "bottom")
  const hasOuterwear = items.some((i) => i.normCategory === "outerwear")
  const hasDenim = bottom?.colors.some((c) => ["denim", "blue"].includes(c)) ?? false
  const allTags = items.flatMap((i) => i.styleTags)
  const hasMultipleStatements = allTags.filter((t) =>
    ["bold", "statement", "expressive", "edgy"].includes(t)
  ).length > 2

  // Priority 1: Simplify competing elements — EP rule: one statement max
  if (hasMultipleStatements) {
    return pick([
      "One statement piece is enough — let the strongest one lead and keep the rest neutral",
      "Two statement elements compete. Choose one anchor piece and simplify everything else",
      "Pull back on the louder elements — let one piece carry the look",
    ])
  }

  // Priority 2: Footwear elevation in structured context
  if (shoe?.styleTags.some((t) => ["sporty", "casual"].includes(t))) {
    if (family === "professional" || family === "elegant") {
      return pick([
        "Swap the sneakers for a loafer or slim boot — one shoe change, significant result",
        "A cleaner shoe here would sharpen the silhouette without changing anything else",
        "The footwear is the one thing pulling this back. A structured shoe would complete it",
      ])
    }
  }

  // Priority 3: Add structure to underbuilt professional/elegant looks
  if (!hasOuterwear && score < 74 && (family === "professional" || family === "elegant")) {
    return pick([
      "A blazer or structured jacket would give this a clear elevation point",
      "One structured outer layer turns this into a complete, precise look",
      "Add a jacket — it frames everything underneath and makes the outfit deliberate",
    ])
  }

  // Priority 4: Denim in formal context — guide toward clarity
  if (hasDenim && (family === "professional" || family === "elegant")) {
    return pick([
      "Swap the denim for tailored trousers — same ease, considerably cleaner result",
      "Trousers instead of jeans here. Same silhouette, more precision",
    ])
  }

  // Priority 5: General balance improvement
  if (score < 66) {
    return pick([
      "Match the formality of your pieces more closely — the balance isn't quite there",
      "A tonal shoe would anchor the look. One small change with a clear effect",
      "Simplify: keep your two strongest pieces and let those carry the outfit",
    ])
  }

  return undefined
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Shoe context scoring ─────────────────────────────────────────────────────
// Returns 0-10: how well a shoe fits this outfit's event, colour, style, season

const FORMAL_SHOE_TAGS = new Set([
  "elegant", "formal", "dressy", "smart casual", "polished", "tailored", "classic",
])
const CASUAL_SHOE_TAGS = new Set([
  "casual", "relaxed", "sporty", "athletic", "everyday", "weekend", "minimal",
])
const FORMAL_EVENTS = new Set(["wedding", "dinner", "work"])
const CASUAL_EVENTS = new Set(["casual", "weekend", "travel", "holiday"])

export function scoreShoeForContext(
  shoe: ScoredItem,
  otherItems: ScoredItem[],
  eventType: string | undefined,
  dateStr?: string,
): number {
  const shoeTags = shoe.styleTags.map((t) => t.toLowerCase())
  const isFormal = shoeTags.some((t) => FORMAL_SHOE_TAGS.has(t))
  const isCasual = shoeTags.some((t) => CASUAL_SHOE_TAGS.has(t))

  // ── 1. Event fit (0–4) ───────────────────────────────────────────────────
  let eventScore = 2 // neutral default
  if (eventType) {
    if (FORMAL_EVENTS.has(eventType)) {
      eventScore = isFormal ? 4 : isCasual ? 1 : 2
    } else if (CASUAL_EVENTS.has(eventType)) {
      eventScore = isCasual ? 4 : isFormal ? 2 : 3
    } else if (eventType === "party") {
      // party accepts both; formal is slightly preferred
      eventScore = isFormal ? 3 : isCasual ? 3 : 2
    }
  }

  // ── 2. Colour harmony with outfit (0–3) ──────────────────────────────────
  const outfitColors = otherItems.flatMap((i) => i.colors.map((c) => c.toLowerCase()))
  const shoeColors   = shoe.colors.map((c) => c.toLowerCase())
  const shoeNeutral  = shoeColors.every((c) => NEUTRAL_COLORS.has(c))
  let colourScore = 1
  if (shoeNeutral) {
    colourScore = 3 // neutral shoes always compatible
  } else {
    const outfitAccents = outfitColors.filter((c) => !NEUTRAL_COLORS.has(c))
    const shoeAccents   = shoeColors.filter((c) => !NEUTRAL_COLORS.has(c))
    const accentMatch   = shoeAccents.some((sc) => outfitAccents.includes(sc))
    const tempClash =
      (shoeAccents.some((c) => WARM_COLORS.has(c)) && outfitAccents.some((c) => COOL_COLORS.has(c))) ||
      (shoeAccents.some((c) => COOL_COLORS.has(c)) && outfitAccents.some((c) => WARM_COLORS.has(c)))
    colourScore = accentMatch ? 3 : tempClash ? 0 : 1
  }

  // ── 3. Style family compatibility (0–2) ──────────────────────────────────
  const outfitFamily     = dominantStyleFamily(otherItems)
  const familyTags       = STYLE_FAMILIES[outfitFamily] ?? []
  const styleFamilyMatch = shoeTags.some((t) => familyTags.includes(t))
  const styleScore       = styleFamilyMatch ? 2 : 0

  // ── 4. Season suitability (0–1) ──────────────────────────────────────────
  const season    = getCurrentSeason(dateStr)
  const shoeSeason = shoe.seasonTags.length > 0 ? shoe.seasonTags : ["all-season"]
  const seasonScore = shoeSeason.includes(season) || shoeSeason.includes("all-season") ? 1 : 0

  return eventScore + colourScore + styleScore + seasonScore
}

// ─── Bag & accessory engine ───────────────────────────────────────────────────

const FORMAL_BAG_TAGS = new Set([
  "elegant", "formal", "dressy", "polished", "professional", "tailored", "feminine",
])
const CASUAL_BAG_TAGS = new Set([
  "casual", "relaxed", "minimal", "everyday", "smart casual", "simple",
])

function scoreBag(
  bag: ScoredItem,
  shoe: ScoredItem | undefined,
  eventType: string | undefined,
): number {
  const bagTags = bag.styleTags.map((t) => t.toLowerCase())

  // Event match (0-2)
  let eventScore = 1
  if (eventType) {
    if (FORMAL_EVENTS.has(eventType)) {
      eventScore = bagTags.some((t) => FORMAL_BAG_TAGS.has(t)) ? 2 : 0
    } else if (CASUAL_EVENTS.has(eventType) || eventType === "holiday" || eventType === "travel") {
      eventScore = bagTags.some((t) => CASUAL_BAG_TAGS.has(t)) ? 2 : 1
    } else if (eventType === "party") {
      eventScore = 1 // both bag styles work for parties
    }
  }

  // Color harmony with shoe OR neutral bag (0-2)
  const bagNeutral = bag.colors.every((c) => NEUTRAL_COLORS.has(c.toLowerCase()))
  let colorScore = 0
  if (bagNeutral) {
    colorScore = 2 // neutral bags always work
  } else if (shoe) {
    const shoeColors = shoe.colors.map((c) => c.toLowerCase())
    colorScore = bag.colors.some((c) => shoeColors.includes(c.toLowerCase())) ? 2 : 0
  }

  return eventScore + colorScore
}

function scoreAccessory(
  accessory: ScoredItem,
  outfitFamily: string,
  existingAccCount: number,
  eventType: string | undefined,
): number {
  const accTags = accessory.styleTags.map((t) => t.toLowerCase())
  const familyTags = STYLE_FAMILIES[outfitFamily] ?? []

  // Style family match (+2 if matches, 0 if not)
  const styleMatch = accTags.some((t) => familyTags.includes(t)) ? 2 : 0

  // Context mismatch: sporty/casual accessories in a strictly formal context (-1)
  const isRelaxedAcc = accTags.some((t) => ["sporty", "casual", "relaxed"].includes(t))
  const isHardFormal = eventType && (eventType === "wedding" || eventType === "work")
  const contextPenalty = isRelaxedAcc && isHardFormal ? -1 : 0

  // Clutter: second accessory in professional/elegant context gets reduced value (-1)
  const clutterPenalty =
    existingAccCount >= 1 && (outfitFamily === "professional" || outfitFamily === "elegant")
      ? -1
      : 0

  return styleMatch + contextPenalty + clutterPenalty
}

function buildBagReason(bag: ScoredItem, eventType: string | undefined): string {
  const name = bag.name.toLowerCase()
  if (eventType === "work") return "Structured and work-ready"
  if (eventType === "dinner" || eventType === "wedding") return "Evening-appropriate carry"
  if (eventType === "party") return "Polished evening bag"
  if (name.includes("tote")) return "Practical and well-matched"
  if (name.includes("clutch")) return "Clean evening carry"
  if (name.includes("crossbody")) return "Effortless and balanced"
  return "Completes the look"
}

function buildAccessoryReason(accessory: ScoredItem): string {
  const name = accessory.name.toLowerCase()
  if (name.includes("belt")) return "Defines the silhouette"
  if (name.includes("scarf")) return "Adds texture and warmth"
  if (name.includes("necklace") || name.includes("chain") || name.includes("pendant")) return "One light elevation point"
  if (name.includes("sunglasses") || name.includes("glasses")) return "Clean, relaxed finish"
  if (name.includes("hat") || name.includes("cap") || name.includes("beanie")) return "Casual top detail"
  if (name.includes("watch")) return "Understated polish"
  const tags = accessory.styleTags.map((t) => t.toLowerCase())
  if (tags.some((t) => ["elegant", "polished"].includes(t))) return "Quiet elevation"
  if (tags.some((t) => ["casual", "relaxed"].includes(t))) return "Keeps it easy"
  return "Completes the outfit"
}

// Returns selected bag + accessories and their per-item score contributions
function selectAndScoreAccessories(
  accessoryPool: ScoredItem[],
  outfitItems: ScoredItem[],
  outfitFamily: string,
  eventType: string | undefined,
): {
  selected: ScoredItem[]
  reasons: Record<string, string>
  scores: Record<string, number>
  totalBonus: number
} {
  const bags        = accessoryPool.filter((i) => i.normCategory === "bag")
  const accessories = accessoryPool.filter((i) => i.normCategory === "accessory")
  const shoe        = outfitItems.find((i) => i.normCategory === "shoes")

  const selected: ScoredItem[] = []
  const reasons: Record<string, string> = {}
  const scores: Record<string, number>  = {}

  // ── 1. Pick one bag ──────────────────────────────────────────────────────
  if (bags.length > 0) {
    const scored = bags
      .map((b) => ({ bag: b, score: scoreBag(b, shoe, eventType) }))
      .sort((a, b) => b.score - a.score)

    const best = scored[0]
    if (best.score >= 2) {
      selected.push(best.bag)
      scores[best.bag.id]  = Math.min(best.score, 4) // cap contribution at 4
      reasons[best.bag.id] = buildBagReason(best.bag, eventType)
    }
  }

  // ── 2. Pick 0-2 accessories ──────────────────────────────────────────────
  const scored = accessories
    .map((a) => ({ acc: a, score: scoreAccessory(a, outfitFamily, 0, eventType) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  let accCount = 0
  for (const { acc, score } of scored) {
    if (accCount >= 2) break
    const adjustedScore = scoreAccessory(acc, outfitFamily, accCount, eventType)
    if (adjustedScore <= 0) continue
    selected.push(acc)
    scores[acc.id]  = adjustedScore
    reasons[acc.id] = buildAccessoryReason(acc)
    accCount++
  }

  const totalBonus = Object.values(scores).reduce((s, v) => s + v, 0)
  return { selected, reasons, scores, totalBonus }
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
    itemPreferences?: ItemPreferences
  }
): { total: number; breakdown: Record<string, number>; dominantFamily: string; colorProfile: string } | null {
  if (!isComplete(items)) return null

  const { eventType, preferences = DEFAULT_PREFERENCES, usedItemIds = new Set(), dateStr, itemPreferences } = opts

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

  // ── EP rule: formality clash penalties ──────────────────────────────────────
  // Rule: mismatched formality is the primary anti-pattern for Effortless Precision
  const hasFormal = allTags.some((t) => ["elegant", "formal", "dressy"].includes(t))
  const hasSport  = allTags.some((t) => ["sporty", "athletic"].includes(t))
  const hasCasual = allTags.some((t) => ["relaxed", "casual", "cozy"].includes(t))
  // Formal + sport: hardest clash
  const formalSportClash  = hasFormal && hasSport  ? -10 : 0
  // Elegant + fully casual extremes (no sport involved): moderate clash
  const formalCasualClash = hasFormal && hasCasual && !hasSport ? -4 : 0
  const clashPenalty = formalSportClash + formalCasualClash

  // ── EP rule: multiple statement pieces penalty ────────────────────────────
  // Rule: one standout element only — multiple statements are anti-EP
  const statementTagCount = allTags.filter((t) =>
    ["bold", "statement", "expressive", "edgy"].includes(t)
  ).length
  const multiStatementPenalty = statementTagCount > 2 ? -5 : 0

  // ── EP bonus: elevation element present ──────────────────────────────────
  // Rule: every complete EP outfit should have one subtle elevation point
  const shoe     = items.find((i) => i.normCategory === "shoes")
  const hasOuter = items.some((i) => i.normCategory === "outerwear" &&
    i.styleTags.some((t) => ["tailored", "structured", "professional", "smart casual"].includes(t))
  )
  const hasElevatedShoe = shoe?.styleTags.some((t) =>
    ["smart casual", "polished", "elegant", "dressy", "formal"].includes(t)
  ) ?? false
  const elevationBonus = hasOuter || hasElevatedShoe ? 3 : 0

  // ── Shoe context match — 0-10 pts ─────────────────────────────────────────
  // Dedicated shoe-fit score above and beyond the general colour/style scoring
  const shoeMatch = shoe
    ? scoreShoeForContext(shoe, items.filter((i) => i.normCategory !== "shoes"), eventType, dateStr)
    : 0

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

  // 8. Item-reach preference boost — rewards items the user actively reaches for
  // "go-to" items each contribute +3 (capped per outfit, max +6 total)
  // "not-lately" items are not penalised — they contribute naturally to discovery
  let reachBoost = 0
  if (itemPreferences) {
    for (const item of items) {
      const pref = itemPreferences[item.id]
      if (pref?.reach === "go-to") reachBoost += 3
    }
    reachBoost = Math.min(reachBoost, 6)
  }

  const total = Math.max(
    0,
    Math.min(
      100,
      eventMatch + colourHarmony + styleConsistency
      + clashPenalty + multiStatementPenalty + elevationBonus
      + seasonSuitability + userPreference + freshness
      + reachBoost + shoeMatch
    )
  )

  const family = dominantStyleFamily(items)
  const colorProfile = describeColorProfile(items)

  return {
    total,
    breakdown: { eventMatch, colourHarmony, styleConsistency, seasonSuitability, userPreference, freshness, shoeMatch },
    dominantFamily: family,
    colorProfile,
  }
}

// ─── Combination builder ──────────────────────────────────────────────────────

function* buildCombinations(pool: ScoredItem[]): Generator<ScoredItem[]> {
  const tops      = pool.filter((i) => i.normCategory === "top")
  const bottoms   = pool.filter((i) => i.normCategory === "bottom")
  const dresses   = pool.filter((i) => i.normCategory === "dress")
  const shoes     = pool.filter((i) => i.normCategory === "shoes")
  const outerwear = pool.filter((i) => i.normCategory === "outerwear")


  // top + bottom + shoes (± outerwear)
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        yield [top, bottom, shoe]
        for (const ow of outerwear) {
          yield [top, bottom, shoe, ow]
        }
      }
    }
  }

  // dress + shoes (± outerwear)
  for (const dress of dresses) {
    for (const shoe of shoes) {
      yield [dress, shoe]
      for (const ow of outerwear) {
        yield [dress, shoe, ow]
      }
    }
  }

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
  shoeAlternatives: ScoredItem[]
  shoeIsShared: boolean
  accessories: ScoredItem[]
  accessoryReasons: Record<string, string>
  accessoryScores: Record<string, number>
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

// ─── Shoe-alternatives helper ─────────────────────────────────────────────────

function computeShoeAlternatives(
  selectedShoe: ScoredItem | undefined,
  nonShoeItems: ScoredItem[],
  allShoes: ScoredItem[],
  eventType: string | undefined,
  dateStr: string | undefined,
  limit = 3,
): ScoredItem[] {
  if (!selectedShoe || allShoes.length <= 1) return []
  return allShoes
    .filter((s) => s.id !== selectedShoe.id)
    .map((s) => ({ shoe: s, score: scoreShoeForContext(s, nonShoeItems, eventType, dateStr) }))
    .filter(({ score }) => score >= 4) // only surface acceptable alternatives
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ shoe }) => shoe)
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
    excludedSignatures?: Set<string>
    minScore?: number
    itemPreferences?: ItemPreferences
  }
): RankedOutfit[] {
  // Separate clothing from bags/accessories — only clothing goes into combos
  const clothingPool   = pool.filter((i) => i.normCategory !== "bag" && i.normCategory !== "accessory")
  const accessoryPool  = pool.filter((i) => i.normCategory === "bag" || i.normCategory === "accessory")

  const maxResults = Math.max(1, Math.min(50, opts.maxResults ?? 5))
  const combos = buildCombinations(clothingPool)
  const scored: ScoredCombo[] = []

  for (const combo of combos) {
    const key = combo.map((i) => i.id).sort().join("|")
    if (opts.excludedSignatures?.has(key)) continue

    const result = scoreOutfit(combo, opts)
    if (!result || result.total < (opts.minScore ?? 50)) continue

    const { total, breakdown, dominantFamily, colorProfile } = result
    const confidence: RankedOutfit["confidence"] =
      total >= 82 ? "high" : total >= 65 ? "safe" : "experimental"

    const tags = Object.entries(STYLE_FAMILIES)
      .filter(([, ftags]) => combo.some((i) => i.styleTags.some((t) => ftags.includes(t))))
      .map(([family]) => family)

    scored.push({
      _key: key,
      id: key,
      items: combo,
      score: total,
      confidence,
      tags,
      reason: buildReason(dominantFamily, colorProfile, opts.eventType, total),
      tips: [],
      dominantFamily,
      colorProfile,
      breakdown,
    })
    // Keep only the best next page in memory; enumerate the full wardrobe lazily.
    // Exact signatures (rather than item overlap) preserve valid shoe/layer swaps.
    scored.sort((a, b) => b.score - a.score || a._key.localeCompare(b._key))
    if (scored.length > maxResults) scored.pop()
  }
  const candidates = scored

  // ── Pass 2: shoe-variety selection ────────────────────────────────────────
  // Outfit 1: always best overall. For outfits 2+: prefer a different shoe
  // within SHOE_VARIETY_THRESHOLD score points of the "would-be-best" option.
  const SHOE_VARIETY_THRESHOLD = 8
  const usedShoeIds = new Set<string>()
  const deduplicated: ScoredCombo[] = []

  for (let slot = 0; slot < maxResults && candidates.length > 0; slot++) {
    // Remaining candidates not yet selected
    const remaining = candidates.filter((c) => !deduplicated.includes(c))
    if (remaining.length === 0) break

    const bestOverall = remaining[0]

    if (slot === 0) {
      // First slot: always the absolute best
      deduplicated.push(bestOverall)
      const shoe = bestOverall.items.find((i) => i.normCategory === "shoes")
      if (shoe) usedShoeIds.add(shoe.id)
      continue
    }

    // For slots 2+: try to find the best candidate whose shoe hasn't been used
    const bestWithNewShoe = remaining.find((c) => {
      const shoe = c.items.find((i) => i.normCategory === "shoes")
      return !shoe || !usedShoeIds.has(shoe.id)
    })

    if (
      bestWithNewShoe &&
      bestWithNewShoe.score >= bestOverall.score - SHOE_VARIETY_THRESHOLD
    ) {
      deduplicated.push(bestWithNewShoe)
    } else {
      deduplicated.push(bestOverall)
    }
    const chosenShoe = deduplicated[deduplicated.length - 1].items.find(
      (i) => i.normCategory === "shoes"
    )
    if (chosenShoe) usedShoeIds.add(chosenShoe.id)
  }

  // ── Assign names + insight content ────────────────────────────────────────
  const usedNames  = new Set<string>(opts.usedOutfitNames ?? [])
  const allShoes   = clothingPool.filter((i) => i.normCategory === "shoes")
  const shoeIdsInBatch = deduplicated.map(
    (o) => o.items.find((i) => i.normCategory === "shoes")?.id
  )
  const shoeIsSharedInBatch = (outfitIdx: number): boolean => {
    const myShoeId = shoeIdsInBatch[outfitIdx]
    return myShoeId !== undefined &&
      shoeIdsInBatch.some((id, idx) => idx !== outfitIdx && id === myShoeId)
  }

  const final: RankedOutfit[] = deduplicated.map((outfit, idx) => {
    const name    = generateOutfitName(outfit.dominantFamily, usedNames)
    usedNames.add(name)
    const tips    = buildTips(outfit.items, outfit.dominantFamily, outfit.colorProfile, outfit.breakdown, opts.eventType, opts.itemPreferences)
    const upgrade = buildUpgrade(outfit.items, outfit.dominantFamily, outfit.score)

    const shoe         = outfit.items.find((i) => i.normCategory === "shoes")
    const nonShoeItems = outfit.items.filter((i) => i.normCategory !== "shoes")
    const shoeAlternatives = computeShoeAlternatives(shoe, nonShoeItems, allShoes, opts.eventType, opts.dateStr)

    // ── Bag + accessory selection ─────────────────────────────────────────
    const accResult = selectAndScoreAccessories(
      accessoryPool,
      outfit.items,
      outfit.dominantFamily,
      opts.eventType,
    )
    const finalScore = Math.min(100, outfit.score + accResult.totalBonus)
    const finalConfidence: RankedOutfit["confidence"] =
      finalScore >= 82 ? "high" : finalScore >= 65 ? "safe" : "experimental"

    const breakdown = {
      ...outfit.breakdown,
      bagMatch:    accResult.scores[accResult.selected.find((i) => i.normCategory === "bag")?.id ?? ""] ?? 0,
      accessories: Math.max(0, accResult.totalBonus - (accResult.scores[accResult.selected.find((i) => i.normCategory === "bag")?.id ?? ""] ?? 0)),
    }

    const { _key, dominantFamily: _df, colorProfile: _cp, ...rest } = outfit
    return {
      ...rest,
      score: finalScore,
      confidence: finalConfidence,
      name,
      tips,
      upgrade,
      breakdown,
      shoeAlternatives,
      shoeIsShared: shoeIsSharedInBatch(idx),
      accessories: accResult.selected,
      accessoryReasons: accResult.reasons,
      accessoryScores: accResult.scores,
    }
  })

  return final
}

