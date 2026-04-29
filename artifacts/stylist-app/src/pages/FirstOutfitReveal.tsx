import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Sparkles, CalendarDays, Layers, RefreshCw, PackagePlus, Bookmark, Shirt, Package } from "lucide-react"
import { wardrobeItems } from "../lib/mockData"
import type { WardrobeItem } from "../lib/mockData"

// ─── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg:     "#1F2A37",
  card:   "#243140",
  raised: "#2A3645",
  border: "rgba(255,255,255,0.08)",
  teal:   "#3F6F73",
  coral:  "#7FA9A3",
  gold:   "#C8A96A",
  text:   "#F2F4F5",
  sub:    "#AABBC0",
  muted:  "#6B8490",
}

// ─── Navigation state ──────────────────────────────────────────────────────────

type RevealState = {
  photo:    string | null
  name:     string
  category: "Tops" | "Bottoms" | "Shoes" | "Outerwear" | "Dress"
  colour:   string
  style:    string
  occasion: string
}

// ─── Variant model ─────────────────────────────────────────────────────────────

type VarDir = "polished" | "relaxed" | "shoes"

type Variant = {
  id:         string
  name:       string
  microcopy:  string
  partnerIds: number[]
  dir:        VarDir
  score:      number   // 1-10 — higher = stronger combination, shown first
}

type Anchor = {
  name:       string
  occasion:   string
  vibe:       string
  partnerIds: number[]
  variants:   Variant[]
}

// ─── Anchor + variant pools ────────────────────────────────────────────────────
// Ordering: index 0 = best polished, index 2 = best relaxed, index 4 = best shoes.
// Scores drive reshuffle order. Default shows index 0 (polished) + index 2 (relaxed).
//
// wardrobeItems: 1=Brown Blazer  2=Cream Knit    3=Black Coat
//                4=Blue Denim    5=Beige Trousers 6=Black Trousers
//                7=White Sneakers 8=Black Loafers  9=Black Heels
//                10=Black T-Shirt

const ANCHORS: Record<string, Anchor> = {
  Tops: {
    name: "Weekend edit", occasion: "Casual", vibe: "Easy and effortless",
    partnerIds: [4, 7],
    variants: [
      { id:"tp1", name:"Smart version",  microcopy:"A cleaner version",            partnerIds:[5, 8],    dir:"polished", score:9 },
      { id:"tp2", name:"Office ready",   microcopy:"More polished for this",       partnerIds:[6, 8],    dir:"polished", score:8 },
      { id:"tr1", name:"Layered easy",   microcopy:"A more relaxed take",          partnerIds:[3, 4, 7], dir:"relaxed",  score:7 },
      { id:"tr2", name:"Soft version",   microcopy:"A softer alternative",         partnerIds:[5, 7],    dir:"relaxed",  score:6 },
      { id:"ts1", name:"Evening twist",  microcopy:"Different shoes, new mood",    partnerIds:[5, 9],    dir:"shoes",    score:8 },
      { id:"ts2", name:"Elevated edit",  microcopy:"The heel changes everything",  partnerIds:[6, 9],    dir:"shoes",    score:7 },
    ],
  },
  Bottoms: {
    name: "Easy morning", occasion: "Casual", vibe: "Cosy and put-together",
    partnerIds: [2, 7],
    variants: [
      { id:"bp1", name:"Clean lines",   microcopy:"A cleaner version",            partnerIds:[10, 8],    dir:"polished", score:9 },
      { id:"bp2", name:"Polished edit", microcopy:"More polished for this",       partnerIds:[1, 2, 8],  dir:"polished", score:8 },
      { id:"br1", name:"Relaxed take",  microcopy:"A more relaxed take",          partnerIds:[10, 7],    dir:"relaxed",  score:7 },
      { id:"br2", name:"Layered soft",  microcopy:"A softer alternative",         partnerIds:[3, 10, 7], dir:"relaxed",  score:6 },
      { id:"bs1", name:"Heel lift",     microcopy:"Different shoes, new mood",    partnerIds:[10, 9],    dir:"shoes",    score:8 },
      { id:"bs2", name:"Dressed up",    microcopy:"The heel changes everything",  partnerIds:[2, 9],     dir:"shoes",    score:7 },
    ],
  },
  Outerwear: {
    name: "Monochrome day", occasion: "Work", vibe: "Polished and clean",
    partnerIds: [10, 6, 8],
    variants: [
      { id:"op1", name:"Softer inside",  microcopy:"A cleaner version",            partnerIds:[2, 6, 8],  dir:"polished", score:9 },
      { id:"op2", name:"Tonal shift",    microcopy:"More polished for this",       partnerIds:[10, 5, 8], dir:"polished", score:8 },
      { id:"or1", name:"Denim version",  microcopy:"A more relaxed take",          partnerIds:[10, 4, 7], dir:"relaxed",  score:7 },
      { id:"or2", name:"Soft layers",    microcopy:"A softer alternative",         partnerIds:[2, 4, 7],  dir:"relaxed",  score:6 },
      { id:"os1", name:"Heel day",       microcopy:"Different shoes, new mood",    partnerIds:[10, 6, 9], dir:"shoes",    score:8 },
      { id:"os2", name:"Evening ready",  microcopy:"The heel changes everything",  partnerIds:[2, 5, 9],  dir:"shoes",    score:7 },
    ],
  },
  Shoes: {
    name: "Neutral tones", occasion: "Casual", vibe: "Grounded and easy",
    partnerIds: [2, 5],
    variants: [
      { id:"shp1", name:"Sharp pairing", microcopy:"A cleaner version",            partnerIds:[10, 6],    dir:"polished", score:9 },
      { id:"shp2", name:"Blazer edit",   microcopy:"More polished for this",       partnerIds:[1, 10, 6], dir:"polished", score:8 },
      { id:"shr1", name:"Denim pairing", microcopy:"A more relaxed take",          partnerIds:[2, 4],     dir:"relaxed",  score:7 },
      { id:"shr2", name:"Easy layers",   microcopy:"A softer alternative",         partnerIds:[10, 4],    dir:"relaxed",  score:6 },
      { id:"shl1", name:"Coat finish",   microcopy:"A warm layer over",            partnerIds:[3, 2, 5],  dir:"shoes",    score:8 },
      { id:"shl2", name:"Blazer finish", microcopy:"Layered, same foundation",     partnerIds:[1, 2, 5],  dir:"shoes",    score:7 },
    ],
  },
  Dress: {
    name: "Day look", occasion: "Casual", vibe: "Simple and fresh",
    partnerIds: [8],
    variants: [
      { id:"dp1", name:"Blazer day",    microcopy:"A cleaner version",            partnerIds:[1, 8],  dir:"polished", score:9 },
      { id:"dp2", name:"Coat layer",    microcopy:"More polished for this",       partnerIds:[3, 8],  dir:"polished", score:8 },
      { id:"dr1", name:"Sneaker edit",  microcopy:"A more relaxed take",          partnerIds:[7],     dir:"relaxed",  score:7 },
      { id:"dr2", name:"Casual blazer", microcopy:"A softer alternative",         partnerIds:[1, 7],  dir:"relaxed",  score:6 },
      { id:"ds1", name:"Heel moment",   microcopy:"Different shoes, new mood",    partnerIds:[9],     dir:"shoes",    score:8 },
      { id:"ds2", name:"Evening poise", microcopy:"The heel changes everything",  partnerIds:[3, 9],  dir:"shoes",    score:7 },
    ],
  },
}

const THIRD_PILL: Record<string, string> = { Shoes: "Different layer" }

// ─── Purchase suggestion data ──────────────────────────────────────────────────
// Triggered at phase ≥ 2 (after 2 reshuffles). Gap-fillers preferred.
// Items are genuinely missing from the mock wardrobe and unlock real variant combos.

type SuggestType = "gap-filler" | "enhancer" | "occasion"

type SuggestionItem = {
  id:         string
  name:       string
  descriptor: string    // short material/style note
  reason:     string    // why it fits this wardrobe
  type:       SuggestType
  unlocks:    number
  icon:       "shirt" | "package"
}

const SUGGESTIONS: Record<string, SuggestionItem[]> = {
  Tops: [
    { id:"st1", name:"Ankle Boots",        descriptor:"Black leather, block heel",          reason:"Bridges the gap between your sneakers and heels",         type:"gap-filler", unlocks:6, icon:"package" },
    { id:"st2", name:"White Overshirt",    descriptor:"Relaxed fit, cotton-linen blend",    reason:"A versatile layer your tops are currently missing",        type:"enhancer",   unlocks:4, icon:"shirt"   },
  ],
  Bottoms: [
    { id:"sb1", name:"Ankle Boots",        descriptor:"Tan suede or black leather",         reason:"Your trousers have no mid-occasion shoe option",           type:"gap-filler", unlocks:5, icon:"package" },
    { id:"sb2", name:"Fine-knit Turtleneck", descriptor:"Ivory or camel, merino blend",    reason:"A refined base layer for any bottom you own",              type:"enhancer",   unlocks:4, icon:"shirt"   },
  ],
  Outerwear: [
    { id:"so1", name:"Ankle Boots",        descriptor:"Black leather, pointed or block heel", reason:"Expands your coat into more occasions and settings",     type:"gap-filler", unlocks:5, icon:"package" },
    { id:"so2", name:"Slim White T-Shirt", descriptor:"Clean cotton, fitted cut",           reason:"A cleaner base layer under your outerwear",                type:"gap-filler", unlocks:4, icon:"shirt"   },
  ],
  Shoes: [
    { id:"ssh1", name:"Wide-Leg Trousers", descriptor:"Camel or stone, fluid fabric",       reason:"A modern silhouette your shoes deserve",                   type:"gap-filler", unlocks:6, icon:"package" },
    { id:"ssh2", name:"Fine-Knit Polo",    descriptor:"Ivory or navy, relaxed cut",         reason:"A refined top to build looks around your shoes",           type:"enhancer",   unlocks:3, icon:"shirt"   },
  ],
  Dress: [
    { id:"sd1", name:"Long Cardigan",      descriptor:"Oatmeal or charcoal, open-front",    reason:"A soft layer to transition your dress across seasons",     type:"gap-filler", unlocks:5, icon:"shirt"   },
    { id:"sd2", name:"Block Heel Mules",   descriptor:"Tan or ivory leather",               reason:"A less formal heel option for daytime wear",               type:"occasion",   unlocks:4, icon:"package" },
  ],
}

const SUGGEST_TYPE_CFG: Record<SuggestType, { label: string; color: string; bg: string }> = {
  "gap-filler": { label: "Gap filler", color: T.teal,  bg: "rgba(63,111,115,0.12)"  },
  "enhancer":   { label: "Enhancer",   color: T.coral, bg: "rgba(127,169,163,0.12)" },
  "occasion":   { label: "Occasion",   color: T.gold,  bg: "rgba(200,169,106,0.12)" },
}

// Phase thresholds (number of pairs added to history)
const PHASE2_AT = 2   // history.size ≥ 2 → exploring
const PHASE3_AT = 5   // history.size ≥ 5 → deep dive, show persistent card

// ─── Reshuffle engine ──────────────────────────────────────────────────────────

function comboKey(a: Variant, b: Variant) {
  return [a.id, b.id].sort().join("|")
}

function resolvePartners(ids: number[]): WardrobeItem[] {
  return ids.map((id) => wardrobeItems.find((w) => w.id === id)).filter((w): w is WardrobeItem => !!w)
}

/**
 * Pick the next best unseen pair.
 *
 * If dir is set, slot A is biased toward that direction (highest-scored variant
 * matching dir), then slot B is the best remaining unseen partner anywhere in
 * the full pool. This keeps the pool large (10+ unique biased pairs) while
 * still feeling directionally intentional.
 *
 * Returns null only when every possible pair has been seen.
 */
function pickNextPair(
  variants: Variant[],
  dir: VarDir | null,
  history: Set<string>,
): [number, number] | null {
  const byScore = [...variants.map((v, i) => ({ v, i }))].sort((a, b) => b.v.score - a.v.score)

  if (dir) {
    // Biased: try each dir-matching item as slot A, best remaining as slot B
    const dirItems = byScore.filter(({ v }) => v.dir === dir)
    const allItems = byScore

    for (const aItem of dirItems) {
      for (const bItem of allItems) {
        if (aItem.i === bItem.i) continue
        const key = comboKey(aItem.v, bItem.v)
        if (!history.has(key)) return [aItem.i, bItem.i]
      }
    }
  }

  // Unbiased fallback (or dir exhausted): best unseen pair from full pool
  for (let ai = 0; ai < byScore.length; ai++) {
    for (let bi = ai + 1; bi < byScore.length; bi++) {
      const key = comboKey(byScore[ai].v, byScore[bi].v)
      if (!history.has(key)) return [byScore[ai].i, byScore[bi].i]
    }
  }

  return null // all 15 pairs seen
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Moodboard({ newPhoto, partners, height }: { newPhoto: string | null; partners: WardrobeItem[]; height: number }) {
  return (
    <div style={{ display: "flex", height, overflow: "hidden" }}>
      <div style={{ flex: "0 0 56%", position: "relative", overflow: "hidden" }}>
        {newPhoto
          ? <img src={newPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: T.raised }} />
        }
        <div style={{
          position: "absolute", top: 7, left: 7,
          background: "rgba(200,169,106,0.92)", borderRadius: 99,
          padding: "2px 8px", fontSize: 9, fontWeight: 700, color: "#1F2A37", letterSpacing: "0.04em",
        }}>NEW</div>
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: 24,
          background: `linear-gradient(to right, transparent, ${T.card})`,
        }} />
      </div>
      <div style={{ flex: "0 0 44%", display: "flex", flexDirection: "column", gap: 2, paddingLeft: 2 }}>
        {partners.slice(0, 3).map((item) => (
          <div key={item.id} style={{ flex: 1, overflow: "hidden" }}>
            <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
        {partners.length === 0 && <div style={{ flex: 1, background: T.raised }} />}
      </div>
    </div>
  )
}

function MainCard({
  anchor, newPhoto, isSelected, onClick, mounted,
}: {
  anchor: Anchor; newPhoto: string | null; isSelected: boolean; onClick: () => void; mounted: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
      transition={{ delay: 0.55, duration: 0.45, ease: "easeOut" }}
      style={{ padding: "0 18px" }}
    >
      <motion.button
        onClick={onClick}
        animate={{ scale: isSelected ? 1 : 0.98, opacity: isSelected ? 1 : 0.55 }}
        transition={{ duration: 0.22 }}
        style={{
          width: "100%", padding: 0, border: "none", cursor: "pointer", textAlign: "left",
          borderRadius: 22, overflow: "hidden", background: T.card,
          outline: isSelected ? `2px solid ${T.teal}` : "2px solid transparent",
          outlineOffset: 2,
          boxShadow: isSelected ? "0 6px 24px rgba(63,111,115,0.22)" : "none",
        }}
      >
        <Moodboard newPhoto={newPhoto} partners={resolvePartners(anchor.partnerIds)} height={180} />
        <div style={{ padding: "12px 14px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: "-0.2px", marginBottom: 2 }}>
              {anchor.name}
            </p>
            <p style={{ fontSize: 12, color: T.muted }}>{anchor.vibe}</p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: `${T.teal}18`, border: `1px solid ${T.teal}30`,
            borderRadius: 99, padding: "4px 10px",
          }}>
            {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }} />}
            <span style={{ fontSize: 11, fontWeight: 700, color: T.teal }}>
              {isSelected ? "Selected" : anchor.occasion}
            </span>
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}

function VariationCard({
  variant, newPhoto, isSelected, isFaded, onClick,
}: {
  variant: Variant; newPhoto: string | null; isSelected: boolean
  isFaded: boolean; onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      animate={{
        scale:   isSelected ? 1.025 : isFaded ? 0.97 : 1,
        opacity: isFaded ? 0.45 : 1,
      }}
      transition={{ duration: 0.22 }}
      style={{
        flex: 1, minWidth: 0, padding: 0, border: "none", cursor: "pointer", textAlign: "left",
        borderRadius: 18, overflow: "hidden", background: T.card,
        outline: isSelected ? `2px solid ${T.teal}` : "2px solid transparent",
        outlineOffset: 2,
        boxShadow: isSelected ? "0 4px 18px rgba(63,111,115,0.22)" : "none",
      }}
    >
      <Moodboard newPhoto={newPhoto} partners={resolvePartners(variant.partnerIds)} height={130} />
      <div style={{ padding: "10px 11px 12px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-0.15px", marginBottom: 2 }}>
          {variant.name}
        </p>
        <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.35 }}>{variant.microcopy}</p>
      </div>
    </motion.button>
  )
}

function DirPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        padding: "7px 14px", borderRadius: 99, border: "none", cursor: "pointer",
        fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
        background: active ? T.teal : "rgba(255,255,255,0.07)",
        color:      active ? "#fff"  : T.sub,
        transition: "background 0.18s, color 0.18s",
      }}
    >
      {label}
    </motion.button>
  )
}

// ─── Phase 3 insight card ──────────────────────────────────────────────────────

function Phase3Card({ onAddItems }: { onAddItems: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        marginTop: 14,
        padding: "14px 16px",
        borderRadius: 16,
        background: "rgba(200,169,106,0.06)",
        border: "1px solid rgba(200,169,106,0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Sparkles size={14} style={{ color: T.gold, marginTop: 1, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 4 }}>
            You've seen your strongest combinations
          </p>
          <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.45, marginBottom: 10 }}>
            These are the best looks your current wardrobe can make with this piece.
            Keep exploring or add more items to unlock new combinations.
          </p>
          <button
            onClick={onAddItems}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 99, border: "none", cursor: "pointer",
              background: "rgba(200,169,106,0.14)",
              fontSize: 12, fontWeight: 700, color: T.gold,
            }}
          >
            <PackagePlus size={12} />
            Add new items to unlock more looks
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Feedback banner (transient) ───────────────────────────────────────────────

const FEEDBACK_ICONS: Record<string, typeof RefreshCw> = {
  direction: RefreshCw,
  wrap:      Sparkles,
  phase:     Sparkles,
}
const FEEDBACK_COLOURS: Record<string, string> = {
  direction: T.coral,
  wrap:      T.muted,
  phase:     T.gold,
}

function FeedbackBanner({ msg, kind }: { msg: string; kind: string }) {
  const Icon  = FEEDBACK_ICONS[kind] ?? RefreshCw
  const color = FEEDBACK_COLOURS[kind] ?? T.coral
  return (
    <motion.div
      key={msg}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28 }}
      style={{
        position: "fixed", top: 54, left: "50%", transform: "translateX(-50%)",
        zIndex: 500,
        background: T.raised, border: `1px solid ${T.border}`,
        borderRadius: 99, padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 7,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={12} style={{ color }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{msg}</span>
    </motion.div>
  )
}

// ─── Purchase suggestion components ───────────────────────────────────────────

function SuggestionCard({ item }: { item: SuggestionItem }) {
  const [saved, setSaved] = useState(false)
  const cfg  = SUGGEST_TYPE_CFG[item.type]
  const Icon = item.icon === "shirt" ? Shirt : Package

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 18,
      background: T.card, border: `1px solid ${T.border}`,
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      {/* Icon swatch */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: cfg.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} style={{ color: cfg.color }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.15px" }}>
            {item.name}
          </p>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
            background: cfg.bg, color: cfg.color, letterSpacing: "0.03em",
          }}>
            {cfg.label.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: 11, color: T.muted, marginBottom: 5 }}>{item.descriptor}</p>
        <p style={{ fontSize: 12, color: T.sub, lineHeight: 1.4 }}>{item.reason}</p>
        {/* Value line */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 9 }}>
          <Sparkles size={11} style={{ color: T.gold }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: T.gold }}>
            Unlocks {item.unlocks} new outfit combinations
          </span>
        </div>
      </div>

      {/* Save / bookmark */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => setSaved((s) => !s)}
        style={{
          width: 34, height: 34, borderRadius: 99, border: "none", cursor: "pointer",
          flexShrink: 0, marginTop: -2,
          background: saved ? `${T.teal}20` : "rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.18s",
        }}
      >
        <Bookmark
          size={14}
          style={{ color: saved ? T.teal : T.muted }}
          fill={saved ? T.teal : "none"}
        />
      </motion.button>
    </div>
  )
}

function SuggestionSection({ category }: { category: string }) {
  const items = SUGGESTIONS[category] ?? SUGGESTIONS.Tops

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ padding: "28px 18px 0" }}
    >
      {/* Visual separator */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: T.border }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.1em" }}>SMART PICKS</span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
      </div>

      {/* Header */}
      <p style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: "-0.2px", marginBottom: 5 }}>
        You've explored your best looks
      </p>
      <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.5, marginBottom: 16 }}>
        These items fill a gap in your current wardrobe — each one unlocks several more combinations with what you already own.
      </p>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <SuggestionCard key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────────────

export default function FirstOutfitReveal() {
  const navigate = useNavigate()
  const location = useLocation()
  const state    = location.state as RevealState | null

  const [mounted,   setMounted]   = useState(false)
  const [selected,  setSelected]  = useState<"main" | "a" | "b">("main")
  const [varA,      setVarA]      = useState(0)   // index into anchor.variants
  const [varB,      setVarB]      = useState(2)
  const [history,   setHistory]   = useState<Set<string>>(new Set())
  const [phase,     setPhase]     = useState<1 | 2 | 3>(1)
  const [activeDir, setActiveDir] = useState<VarDir | null>(null)
  const [feedback,  setFeedback]  = useState<{ msg: string; kind: string } | null>(null)

  useEffect(() => {
    if (!state) { navigate("/wardrobe", { replace: true }); return }
    const id = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(id)
  }, [state, navigate])

  if (!state) return null

  const anchor   = ANCHORS[state.category] ?? ANCHORS.Tops
  const variants = anchor.variants
  const vA       = variants[varA]
  const vB       = variants[varB]

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  // ── Reshuffle ──────────────────────────────────────────────────────────────

  function reshuffle(dir?: VarDir) {
    const nextDir = dir ?? activeDir ?? null

    // Record current pair in history
    const newHistory = new Set(history)
    newHistory.add(comboKey(vA, vB))

    const newPhase: 1 | 2 | 3 = newHistory.size >= PHASE3_AT ? 3
                               : newHistory.size >= PHASE2_AT ? 2
                               : 1

    // Pick next pair
    let result = pickNextPair(variants, nextDir, newHistory)

    let msg: string
    let kind: string

    if (!result) {
      // All pairs exhausted — wrap with clear history and restart
      newHistory.clear()
      result = pickNextPair(variants, nextDir, newHistory)
      msg  = "These pieces work best together"
      kind = "wrap"
    } else if (newPhase === 3 && phase < 3) {
      msg  = "You've seen your strongest combinations"
      kind = "phase"
    } else if (nextDir && nextDir !== activeDir) {
      msg  = "Trying a different direction"
      kind = "direction"
    } else {
      msg  = "Refreshed"
      kind = "direction"
    }

    // Commit state
    setHistory(newHistory)
    setPhase(newPhase)
    if (dir !== undefined) setActiveDir(dir)

    if (result) {
      setVarA(result[0])
      setVarB(result[1])
    }

    setSelected("main")
    setFeedback({ msg, kind })
    setTimeout(() => setFeedback(null), 2500)
  }

  const someVarSelected = selected === "a" || selected === "b"
  const thirdLabel      = THIRD_PILL[state.category] ?? "Different shoes"

  // Phase label for the "Refine" area
  const phaseLabel =
    phase === 1 ? "Refine" :
    phase === 2 ? "Explore further" :
    "Keep going"

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 110, overflowX: "hidden" }}>

      {/* ── Feedback banner ── */}
      <AnimatePresence>
        {feedback && <FeedbackBanner key={feedback.msg} msg={feedback.msg} kind={feedback.kind} />}
      </AnimatePresence>

      {/* ── Back button ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ position: "absolute", top: 16, left: 16, zIndex: 30 }}
      >
        <button
          onClick={() => navigate("/wardrobe")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(31,42,55,0.76)", border: `1px solid ${T.border}`,
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            cursor: "pointer", color: T.sub,
          }}
        >
          <ArrowLeft size={17} />
        </button>
      </motion.div>

      {/* ── Hero photo ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        style={{ position: "relative", width: "100%", height: "42vh", minHeight: 240, maxHeight: 360, overflow: "hidden" }}
      >
        {state.photo
          ? <img src={state.photo} alt={state.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: T.raised }} />
        }
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, rgba(31,42,55,0.1) 0%, rgba(31,42,55,0.5) 55%, ${T.bg} 100%)`,
        }} />

        {/* "New addition" badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -8 }}
          transition={{ delay: 0.42, duration: 0.32 }}
          style={{
            position: "absolute", top: 18, right: 16,
            background: "rgba(200,169,106,0.14)", border: "1px solid rgba(200,169,106,0.34)",
            borderRadius: 99, padding: "5px 12px",
            display: "flex", alignItems: "center", gap: 5,
            backdropFilter: "blur(8px)",
          }}
        >
          <Sparkles size={11} style={{ color: T.gold }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: T.gold }}>New addition</span>
        </motion.div>

        {/* Item name + tags */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 18px 18px" }}>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
            transition={{ delay: 0.36, duration: 0.4 }}
            style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", color: T.text, marginBottom: 7 }}
          >
            {state.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.5, duration: 0.32 }}
            style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
          >
            {[state.category, cap(state.colour), state.style].map((tag) => (
              <span key={tag} style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.14)",
                color: T.sub, backdropFilter: "blur(6px)",
              }}>{tag}</span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Main outfit card ── */}
      <div style={{ paddingTop: 20, paddingBottom: 6 }}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -10 }}
          transition={{ delay: 0.48, duration: 0.32 }}
          style={{ padding: "0 18px 10px", display: "flex", alignItems: "center", gap: 8 }}
        >
          <Sparkles size={13} style={{ color: T.gold }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Styled for you
          </p>
        </motion.div>

        <MainCard
          anchor={anchor}
          newPhoto={state.photo}
          isSelected={selected === "main"}
          onClick={() => setSelected("main")}
          mounted={mounted}
        />
      </div>

      {/* ── "More ways to wear this" ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
        transition={{ delay: 0.72, duration: 0.38 }}
        style={{ padding: "22px 18px 0" }}
      >
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.15px" }}>
            More ways to wear this
          </p>
          <p style={{ fontSize: 11, color: T.muted }}>tap to select</p>
        </div>

        {/* Two variation cards — animate swap as a unit */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${varA}-${varB}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            style={{ display: "flex", gap: 10 }}
          >
            <VariationCard
              variant={vA}
              newPhoto={state.photo}
              isSelected={selected === "a"}
              isFaded={someVarSelected && selected !== "a"}
              onClick={() => setSelected(selected === "a" ? "main" : "a")}
            />
            <VariationCard
              variant={vB}
              newPhoto={state.photo}
              isSelected={selected === "b"}
              isFaded={someVarSelected && selected !== "b"}
              onClick={() => setSelected(selected === "b" ? "main" : "b")}
            />
          </motion.div>
        </AnimatePresence>

        {/* Phase 3 insight card — persistent once reached */}
        <AnimatePresence>
          {phase === 3 && (
            <Phase3Card key="phase3" onAddItems={() => navigate("/wardrobe/add")} />
          )}
        </AnimatePresence>

        {/* Reshuffle direction pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ delay: 0.95, duration: 0.32 }}
          style={{ paddingTop: 16 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 11, color: T.muted }}>{phaseLabel}</p>
            {/* Phase indicator dots */}
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {([1, 2, 3] as const).map((p) => (
                <div key={p} style={{
                  width: p === phase ? 12 : 6,
                  height: 4, borderRadius: 99,
                  background: p === phase ? T.teal : T.border,
                  transition: "all 0.3s",
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <DirPill label="More polished"  active={activeDir === "polished"} onClick={() => reshuffle("polished")} />
            <DirPill label="More relaxed"   active={activeDir === "relaxed"}  onClick={() => reshuffle("relaxed")}  />
            <DirPill label={thirdLabel}     active={activeDir === "shoes"}    onClick={() => reshuffle("shoes")}    />
            <DirPill label="Refresh"        active={false}                    onClick={() => reshuffle()}            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Purchase suggestions — unlocked after 2 reshuffles ── */}
      <AnimatePresence>
        {phase >= 2 && (
          <SuggestionSection key="suggestions" category={state.category} />
        )}
      </AnimatePresence>

      {/* ── What to do next ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 14 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        style={{ padding: "28px 18px 0" }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
          What to do next
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => { const d = new Date().toISOString().split("T")[0]; navigate(`/timeline/generate/${d}`) }}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px",
              borderRadius: 18, border: "none", cursor: "pointer", textAlign: "left",
              background: `linear-gradient(to right, ${T.teal}, ${T.coral})`,
              boxShadow: "0 4px 20px rgba(63,111,115,0.28)",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CalendarDays size={19} style={{ color: "#fff" }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.1px" }}>Plan for today</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>Build a full outfit for right now</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/wardrobe")}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px",
              borderRadius: 18, background: T.card, border: `1px solid ${T.border}`,
              cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Layers size={19} style={{ color: T.sub }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.1px" }}>Explore wardrobe</p>
              <p style={{ fontSize: 12, color: T.muted }}>See everything you own, now updated</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
