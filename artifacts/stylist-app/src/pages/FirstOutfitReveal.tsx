import { useEffect, useState, type CSSProperties } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Sparkles, CalendarDays, Layers, RefreshCw } from "lucide-react"
import { wardrobeItems } from "../lib/mockData"
import type { WardrobeItem } from "../lib/mockData"

// ─── Design tokens ────────────────────────────────────────────────────────────

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

// ─── Navigation state ─────────────────────────────────────────────────────────

type RevealState = {
  photo:    string | null
  name:     string
  category: "Tops" | "Bottoms" | "Shoes" | "Outerwear" | "Dress"
  colour:   string
  style:    string
  occasion: string
}

// ─── Variation data model ─────────────────────────────────────────────────────

type VarDir = "polished" | "relaxed" | "shoes"

type Variant = {
  id:         string
  name:       string
  microcopy:  string
  partnerIds: number[]
  dir:        VarDir
}

type Anchor = {
  name:       string
  occasion:   string
  vibe:       string
  partnerIds: number[]
  variants:   Variant[]
}

// ─── Anchor + variant pools per category ─────────────────────────────────────
// All variants share the same anchor occasion — only execution changes.
// wardrobeItems: 1=Brown Blazer, 2=Cream Knit, 3=Black Coat, 4=Blue Denim,
//                5=Beige Trousers, 6=Black Trousers, 7=White Sneakers,
//                8=Black Loafers, 9=Black Heels, 10=Black T-Shirt

const ANCHORS: Record<string, Anchor> = {
  Tops: {
    name: "Weekend edit",   occasion: "Casual", vibe: "Easy and effortless",
    partnerIds: [4, 7],
    variants: [
      { id:"tp1", name:"Smart version",  microcopy:"A cleaner version",            partnerIds:[5, 8],     dir:"polished" },
      { id:"tp2", name:"Office ready",   microcopy:"More polished for this",       partnerIds:[6, 8],     dir:"polished" },
      { id:"tr1", name:"Layered easy",   microcopy:"A more relaxed take",          partnerIds:[3, 4, 7],  dir:"relaxed"  },
      { id:"tr2", name:"Soft version",   microcopy:"A softer alternative",         partnerIds:[5, 7],     dir:"relaxed"  },
      { id:"ts1", name:"Evening twist",  microcopy:"Different shoes, new mood",    partnerIds:[5, 9],     dir:"shoes"    },
      { id:"ts2", name:"Elevated edit",  microcopy:"The heel changes everything",  partnerIds:[6, 9],     dir:"shoes"    },
    ],
  },
  Bottoms: {
    name: "Easy morning",   occasion: "Casual", vibe: "Cosy and put-together",
    partnerIds: [2, 7],
    variants: [
      { id:"bp1", name:"Clean lines",    microcopy:"A cleaner version",            partnerIds:[10, 8],    dir:"polished" },
      { id:"bp2", name:"Polished edit",  microcopy:"More polished for this",       partnerIds:[1, 2, 8],  dir:"polished" },
      { id:"br1", name:"Relaxed take",   microcopy:"A more relaxed take",          partnerIds:[10, 7],    dir:"relaxed"  },
      { id:"br2", name:"Layered soft",   microcopy:"A softer alternative",         partnerIds:[3, 10, 7], dir:"relaxed"  },
      { id:"bs1", name:"Heel lift",      microcopy:"Different shoes, new mood",    partnerIds:[10, 9],    dir:"shoes"    },
      { id:"bs2", name:"Dressed up",     microcopy:"The heel changes everything",  partnerIds:[2, 9],     dir:"shoes"    },
    ],
  },
  Outerwear: {
    name: "Monochrome day", occasion: "Work",   vibe: "Polished and clean",
    partnerIds: [10, 6, 8],
    variants: [
      { id:"op1", name:"Softer inside",  microcopy:"A cleaner version",            partnerIds:[2, 6, 8],  dir:"polished" },
      { id:"op2", name:"Tonal shift",    microcopy:"More polished for this",       partnerIds:[10, 5, 8], dir:"polished" },
      { id:"or1", name:"Denim version",  microcopy:"A more relaxed take",          partnerIds:[10, 4, 7], dir:"relaxed"  },
      { id:"or2", name:"Soft layers",    microcopy:"A softer alternative",         partnerIds:[2, 4, 7],  dir:"relaxed"  },
      { id:"os1", name:"Heel day",       microcopy:"Different shoes, new mood",    partnerIds:[10, 6, 9], dir:"shoes"    },
      { id:"os2", name:"Evening ready",  microcopy:"The heel changes everything",  partnerIds:[2, 5, 9],  dir:"shoes"    },
    ],
  },
  Shoes: {
    name: "Neutral tones",  occasion: "Casual", vibe: "Grounded and easy",
    partnerIds: [2, 5],
    variants: [
      { id:"shp1", name:"Sharp pairing", microcopy:"A cleaner version",            partnerIds:[10, 6],    dir:"polished" },
      { id:"shp2", name:"Blazer edit",   microcopy:"More polished for this",       partnerIds:[1, 10, 6], dir:"polished" },
      { id:"shr1", name:"Denim pairing", microcopy:"A more relaxed take",          partnerIds:[2, 4],     dir:"relaxed"  },
      { id:"shr2", name:"Easy layers",   microcopy:"A softer alternative",         partnerIds:[10, 4],    dir:"relaxed"  },
      { id:"shl1", name:"Coat finish",   microcopy:"A layer over, same shoe",      partnerIds:[3, 2, 5],  dir:"shoes"    },
      { id:"shl2", name:"Blazer finish", microcopy:"Warm layer, same foundation",  partnerIds:[1, 2, 5],  dir:"shoes"    },
    ],
  },
  Dress: {
    name: "Day look",       occasion: "Casual", vibe: "Simple and fresh",
    partnerIds: [8],
    variants: [
      { id:"dp1", name:"Blazer day",     microcopy:"A cleaner version",            partnerIds:[1, 8],     dir:"polished" },
      { id:"dp2", name:"Coat layer",     microcopy:"More polished for this",       partnerIds:[3, 8],     dir:"polished" },
      { id:"dr1", name:"Sneaker edit",   microcopy:"A more relaxed take",          partnerIds:[7],        dir:"relaxed"  },
      { id:"dr2", name:"Casual blazer",  microcopy:"A softer alternative",         partnerIds:[1, 7],     dir:"relaxed"  },
      { id:"ds1", name:"Heel moment",    microcopy:"Different shoes, new mood",    partnerIds:[9],        dir:"shoes"    },
      { id:"ds2", name:"Evening poise",  microcopy:"The heel changes everything",  partnerIds:[3, 9],     dir:"shoes"    },
    ],
  },
}

// third pill label differs for Shoes (new item IS the shoes)
const THIRD_PILL_LABEL: Record<string, string> = {
  Shoes: "Different layer",
}

// ─── Helper: resolve partner WardrobeItems ────────────────────────────────────

function resolvePartners(ids: number[]): WardrobeItem[] {
  return ids.map((id) => wardrobeItems.find((w) => w.id === id)).filter((w): w is WardrobeItem => !!w)
}

function comboKey(a: Variant, b: Variant) {
  return [a.id, b.id].sort().join("|")
}

// ─── Moodboard: new item left + partners right ────────────────────────────────

function Moodboard({ newPhoto, partners, height }: { newPhoto: string | null; partners: WardrobeItem[]; height: number }) {
  return (
    <div style={{ display: "flex", height, overflow: "hidden" }}>
      {/* New item — left 56% */}
      <div style={{ flex: "0 0 56%", position: "relative", overflow: "hidden" }}>
        {newPhoto
          ? <img src={newPhoto} alt="New item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: T.raised }} />
        }
        <div style={{
          position: "absolute", top: 7, left: 7,
          background: "rgba(200,169,106,0.92)", borderRadius: 99,
          padding: "2px 8px", fontSize: 9, fontWeight: 700, color: "#1F2A37", letterSpacing: "0.04em",
        }}>NEW</div>
        {/* Fade edge */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: 24,
          background: `linear-gradient(to right, transparent, ${T.card})`,
        }} />
      </div>
      {/* Partners — right 44%, stacked */}
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

// ─── Main outfit card ─────────────────────────────────────────────────────────

function MainCard({
  anchor, newPhoto, isSelected, onClick, mounted,
}: {
  anchor: Anchor; newPhoto: string | null; isSelected: boolean; onClick: () => void; mounted: boolean
}) {
  const accent = T.teal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
      transition={{ delay: 0.55, duration: 0.45, ease: "easeOut" }}
      style={{ padding: "0 18px" }}
    >
      <motion.button
        onClick={onClick}
        animate={{
          scale:   isSelected ? 1 : 0.98,
          opacity: isSelected ? 1 : 0.58,
        }}
        transition={{ duration: 0.22 }}
        style={{
          width: "100%", padding: 0, border: "none", cursor: "pointer", textAlign: "left",
          borderRadius: 22, overflow: "hidden",
          background: T.card,
          outline: isSelected ? `2px solid ${accent}` : "2px solid transparent",
          outlineOffset: 2,
          boxShadow: isSelected ? `0 6px 24px rgba(63,111,115,0.22)` : "none",
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
            background: `${accent}18`, border: `1px solid ${accent}30`,
            borderRadius: 99, padding: "4px 10px",
          }}>
            {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />}
            <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>
              {isSelected ? "Selected" : anchor.occasion}
            </span>
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}

// ─── Variation card ───────────────────────────────────────────────────────────

function VariationCard({
  variant, newPhoto, isSelected, isFaded, onClick, delay, mounted,
}: {
  variant: Variant; newPhoto: string | null; isSelected: boolean
  isFaded: boolean; onClick: () => void; delay: number; mounted: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 16 }}
      transition={{ delay, duration: 0.38, ease: "easeOut" }}
      style={{ flex: 1, minWidth: 0 }}
    >
      <motion.button
        onClick={onClick}
        animate={{
          scale:   isSelected ? 1.02 : isFaded ? 0.97 : 1,
          opacity: isFaded ? 0.48 : 1,
        }}
        transition={{ duration: 0.22 }}
        style={{
          width: "100%", padding: 0, border: "none", cursor: "pointer", textAlign: "left",
          borderRadius: 18, overflow: "hidden",
          background: T.card,
          outline: isSelected ? `2px solid ${T.teal}` : "2px solid transparent",
          outlineOffset: 2,
          boxShadow: isSelected ? `0 4px 18px rgba(63,111,115,0.22)` : "none",
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
    </motion.div>
  )
}

// ─── Direction pill ───────────────────────────────────────────────────────────

function DirPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", borderRadius: 99, border: "none", cursor: "pointer",
        fontSize: 12, fontWeight: 600,
        background: active ? T.teal : "rgba(255,255,255,0.07)",
        color:      active ? "#fff" : T.sub,
        transition: "background 0.18s, color 0.18s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function FirstOutfitReveal() {
  const navigate = useNavigate()
  const location = useLocation()
  const state    = location.state as RevealState | null

  const [mounted, setMounted]     = useState(false)
  const [selected, setSelected]   = useState<"main" | "a" | "b">("main")
  const [varA, setVarA]           = useState(0)   // index into anchor.variants for slot A
  const [varB, setVarB]           = useState(2)   // index into anchor.variants for slot B
  const [rejected, setRejected]   = useState<Set<string>>(new Set())
  const [activeDir, setActiveDir] = useState<VarDir | null>(null)
  const [feedback, setFeedback]   = useState<string | null>(null)

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

  // ── Reshuffle logic ──────────────────────────────────────────────────────────

  function reshuffle(dir: VarDir) {
    // Mark current pair as rejected
    const key      = comboKey(vA, vB)
    const newRej   = new Set(rejected)
    newRej.add(key)

    // Pool for this direction
    const pool = variants
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => v.dir === dir)

    // Find pairs not in rejected (try up to all combos)
    let chosenA = -1, chosenB = -1
    outer: for (let ai = 0; ai < pool.length; ai++) {
      for (let bi = ai + 1; bi < pool.length; bi++) {
        const k = comboKey(pool[ai].v, pool[bi].v)
        if (!newRej.has(k)) { chosenA = pool[ai].i; chosenB = pool[bi].i; break outer }
      }
    }

    // If every combo is rejected, reset rejected and pick first pair
    if (chosenA === -1 && pool.length >= 2) {
      newRej.clear()
      chosenA = pool[0].i
      chosenB = pool[1].i
    } else if (chosenA === -1 && pool.length === 1) {
      chosenA = pool[0].i
      chosenB = pool[0].i
    }

    setRejected(newRej)
    if (chosenA !== -1) { setVarA(chosenA); setVarB(chosenB) }
    setSelected("main")
    setActiveDir(dir)
    setFeedback("Trying a different direction")
    setTimeout(() => setFeedback(null), 2400)
  }

  const someVarSelected = selected === "a" || selected === "b"
  const thirdLabel = THIRD_PILL_LABEL[state.category] ?? "Different shoes"

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 110, overflowX: "hidden" }}>

      {/* ── Feedback banner ── */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)",
              zIndex: 500,
              background: T.raised, border: `1px solid ${T.border}`,
              borderRadius: 99, padding: "8px 16px",
              display: "flex", alignItems: "center", gap: 7,
              boxShadow: "0 4px 20px rgba(0,0,0,0.28)",
            }}
          >
            <RefreshCw size={12} style={{ color: T.coral }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{feedback}</span>
          </motion.div>
        )}
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
        {/* Name + tags */}
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

      {/* ── Variations section ── */}
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

        {/* Two variation cards side by side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${varA}-${varB}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", gap: 10 }}
          >
            <VariationCard
              variant={vA}
              newPhoto={state.photo}
              isSelected={selected === "a"}
              isFaded={someVarSelected && selected !== "a"}
              onClick={() => setSelected(selected === "a" ? "main" : "a")}
              delay={0.78}
              mounted={mounted}
            />
            <VariationCard
              variant={vB}
              newPhoto={state.photo}
              isSelected={selected === "b"}
              isFaded={someVarSelected && selected !== "b"}
              onClick={() => setSelected(selected === "b" ? "main" : "b")}
              delay={0.86}
              mounted={mounted}
            />
          </motion.div>
        </AnimatePresence>

        {/* Reshuffle pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ delay: 0.95, duration: 0.32 }}
          style={{ paddingTop: 16 }}
        >
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>Refine</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <DirPill label="More polished"  active={activeDir === "polished"} onClick={() => reshuffle("polished")} />
            <DirPill label="More relaxed"   active={activeDir === "relaxed"}  onClick={() => reshuffle("relaxed")}  />
            <DirPill label={thirdLabel}     active={activeDir === "shoes"}    onClick={() => reshuffle("shoes")}    />
          </div>
        </motion.div>
      </motion.div>

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
