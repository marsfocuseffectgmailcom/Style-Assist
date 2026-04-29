import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Sparkles, CalendarDays, Layers } from "lucide-react"
import { wardrobeItems } from "../lib/mockData"
import type { WardrobeItem } from "../lib/mockData"

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg:      "#1F2A37",
  card:    "#243140",
  raised:  "#2A3645",
  border:  "rgba(255,255,255,0.08)",
  teal:    "#3F6F73",
  coral:   "#7FA9A3",
  gold:    "#C8A96A",
  text:    "#F2F4F5",
  sub:     "#AABBC0",
  muted:   "#6B8490",
}

// ─── Navigation state shape ───────────────────────────────────────────────────

type RevealState = {
  photo:    string | null
  name:     string
  category: "Tops" | "Bottoms" | "Shoes" | "Outerwear" | "Dress"
  colour:   string
  style:    string
  occasion: string
}

// ─── Outfit pairing config ────────────────────────────────────────────────────

type OutfitConfig = {
  name:       string
  vibe:       string
  occasion:   string
  partnerIds: number[]
}

const OUTFIT_CONFIGS: Record<string, OutfitConfig[]> = {
  Tops: [
    { name: "Weekend edit",   vibe: "Easy & effortless",    occasion: "Casual",  partnerIds: [4, 7] },
    { name: "Office ready",   vibe: "Sharp & considered",   occasion: "Work",    partnerIds: [6, 8] },
    { name: "Evening look",   vibe: "Relaxed elegance",     occasion: "Evening", partnerIds: [5, 9] },
  ],
  Bottoms: [
    { name: "Easy morning",   vibe: "Cosy & put-together",  occasion: "Casual",  partnerIds: [2, 7] },
    { name: "Clean lines",    vibe: "Sharp & minimal",      occasion: "Work",    partnerIds: [10, 8] },
    { name: "Soft layers",    vibe: "Relaxed polish",       occasion: "Weekend", partnerIds: [1, 2, 8] },
  ],
  Outerwear: [
    { name: "Monochrome day", vibe: "Polished & clean",     occasion: "Work",    partnerIds: [10, 6, 8] },
    { name: "Tonal layers",   vibe: "Warm & considered",    occasion: "Casual",  partnerIds: [2, 5, 7] },
    { name: "Evening edge",   vibe: "Confident & minimal",  occasion: "Evening", partnerIds: [10, 6, 9] },
  ],
  Shoes: [
    { name: "Neutral tones",  vibe: "Grounded & easy",      occasion: "Casual",  partnerIds: [2, 5] },
    { name: "All-day clean",  vibe: "Minimal & sharp",      occasion: "Work",    partnerIds: [10, 6] },
    { name: "Relaxed fit",    vibe: "Casual & comfortable", occasion: "Weekend", partnerIds: [2, 4] },
  ],
  Dress: [
    { name: "Day look",       vibe: "Simple & fresh",       occasion: "Casual",  partnerIds: [8] },
    { name: "Evening poise",  vibe: "Elegant & assured",    occasion: "Evening", partnerIds: [9] },
    { name: "Layered chic",   vibe: "Elevated & warm",      occasion: "Weekend", partnerIds: [1, 8] },
  ],
}

const OCCASION_COLOURS: Record<string, string> = {
  Casual:  T.coral,
  Work:    T.teal,
  Evening: T.gold,
  Weekend: T.coral,
}

// ─── OutfitCard (horizontal scroll item) ─────────────────────────────────────

function OutfitCard({
  config,
  partners,
  newPhoto,
  delay,
}: {
  config:   OutfitConfig
  partners: WardrobeItem[]
  newPhoto: string | null
  delay:    number
}) {
  const accentColor = OCCASION_COLOURS[config.occasion] ?? T.coral

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.42, ease: "easeOut" }}
      style={{
        minWidth: "76vw",
        maxWidth: 320,
        borderRadius: 22,
        overflow: "hidden",
        border: `1px solid ${T.border}`,
        background: T.card,
        flexShrink: 0,
      }}
    >
      {/* Photo moodboard */}
      <div style={{ display: "flex", height: 170, overflow: "hidden" }}>
        {/* New item — left 55% */}
        <div style={{ flex: "0 0 55%", position: "relative", overflow: "hidden" }}>
          {newPhoto ? (
            <img
              src={newPhoto}
              alt="New item"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: T.raised }} />
          )}
          {/* "New" badge */}
          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(200,169,106,0.9)",
            borderRadius: 99, padding: "2px 8px",
            fontSize: 9, fontWeight: 700, color: "#1F2A37", letterSpacing: "0.04em",
          }}>
            NEW
          </div>
          {/* Vertical divider fade */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 28,
            background: `linear-gradient(to right, transparent, ${T.card})`,
          }} />
        </div>

        {/* Partner items — right 45%, stacked */}
        <div style={{ flex: "0 0 45%", display: "flex", flexDirection: "column", gap: 2, padding: "0 0 0 2px" }}>
          {partners.slice(0, 3).map((item, i) => (
            <div
              key={item.id}
              style={{
                flex: 1,
                overflow: "hidden",
                borderRadius: i === 0 ? "0 0 0 0" : "0",
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
          {partners.length === 0 && (
            <div style={{ flex: 1, background: T.raised }} />
          )}
        </div>
      </div>

      {/* Info band */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.2px" }}>
            {config.name}
          </p>
          <span style={{
            fontSize: 10, fontWeight: 700, color: accentColor,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            borderRadius: 99, padding: "2px 8px",
          }}>
            {config.occasion}
          </span>
        </div>
        <p style={{ fontSize: 12, color: T.muted }}>{config.vibe}</p>
      </div>
    </motion.div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function FirstOutfitReveal() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const state     = location.state as RevealState | null
  const scrollRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!state) {
      navigate("/wardrobe", { replace: true })
      return
    }
    const id = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(id)
  }, [state, navigate])

  if (!state) return null

  const configs  = OUTFIT_CONFIGS[state.category] ?? OUTFIT_CONFIGS.Tops
  const outfits  = configs.map((c) => ({
    config:   c,
    partners: c.partnerIds
      .map((id) => wardrobeItems.find((w) => w.id === id))
      .filter((w): w is WardrobeItem => !!w),
  }))

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 100 }}>

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
            background: "rgba(31,42,55,0.72)",
            border: `1px solid ${T.border}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            cursor: "pointer", color: T.sub,
          }}
        >
          <ArrowLeft size={17} />
        </button>
      </motion.div>

      {/* ── Hero item card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 28 }}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.12 }}
        style={{ position: "relative", width: "100%", height: "52vh", minHeight: 280, maxHeight: 400, overflow: "hidden" }}
      >
        {/* Photo */}
        {state.photo ? (
          <img
            src={state.photo}
            alt={state.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: T.raised }} />
        )}

        {/* Bottom gradient */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "70%",
          background: `linear-gradient(to bottom, transparent, ${T.bg})`,
        }} />

        {/* "New addition" badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -8 }}
          transition={{ delay: 0.45, duration: 0.35 }}
          style={{
            position: "absolute", top: 18, right: 16,
            background: "rgba(200,169,106,0.15)",
            border: "1px solid rgba(200,169,106,0.35)",
            borderRadius: 99, padding: "5px 12px",
            display: "flex", alignItems: "center", gap: 5,
            backdropFilter: "blur(8px)",
          }}
        >
          <Sparkles size={11} style={{ color: T.gold }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: "0.02em" }}>New addition</span>
        </motion.div>

        {/* Item name + tags over gradient */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 18px 20px" }}>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
            transition={{ delay: 0.38, duration: 0.42 }}
            style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", color: T.text, marginBottom: 8 }}
          >
            {state.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.52, duration: 0.35 }}
            style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
          >
            {[state.category, cap(state.colour), state.style].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: T.sub,
                  backdropFilter: "blur(6px)",
                }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Outfit count headline ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
        transition={{ delay: 0.58, duration: 0.38 }}
        style={{ padding: "22px 18px 6px", display: "flex", alignItems: "center", gap: 8 }}
      >
        <Sparkles size={15} style={{ color: T.gold }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: "-0.2px" }}>
          {outfits.length} outfits ready to wear
        </p>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ delay: 0.65, duration: 0.3 }}
        style={{ fontSize: 13, color: T.muted, padding: "0 18px 18px" }}
      >
        Styled with pieces already in your wardrobe
      </motion.p>

      {/* ── Outfit cards (horizontal scroll) ── */}
      <div
        ref={scrollRef}
        style={{
          display: "flex", gap: 12, overflowX: "auto", overflowY: "visible",
          padding: "4px 18px 8px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none", scrollbarWidth: "none",
        }}
      >
        {outfits.map(({ config, partners }, i) => (
          <div key={config.name} style={{ scrollSnapAlign: "start" }}>
            <OutfitCard
              config={config}
              partners={partners}
              newPhoto={state.photo}
              delay={0.7 + i * 0.1}
            />
          </div>
        ))}
      </div>

      {/* Swipe hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 0.45 : 0 }}
        transition={{ delay: 1.05, duration: 0.4 }}
        style={{ fontSize: 11, color: T.muted, textAlign: "center", padding: "8px 0 0", letterSpacing: "0.02em" }}
      >
        swipe to see more →
      </motion.p>

      {/* ── What to do next ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 14 }}
        transition={{ delay: 0.92, duration: 0.42 }}
        style={{ padding: "28px 18px 0" }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
          What to do next
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Plan for today */}
          <button
            onClick={() => {
              const today = new Date().toISOString().split("T")[0]
              navigate(`/timeline/generate/${today}`)
            }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 16px",
              borderRadius: 18,
              background: `linear-gradient(to right, ${T.teal}, ${T.coral})`,
              boxShadow: "0 4px 20px rgba(63,111,115,0.3)",
              border: "none", cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <CalendarDays size={19} style={{ color: "#fff" }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.1px" }}>Plan for today</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>Build a full outfit for right now</p>
            </div>
          </button>

          {/* Explore wardrobe */}
          <button
            onClick={() => navigate("/wardrobe")}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 16px",
              borderRadius: 18,
              background: T.card,
              border: `1px solid ${T.border}`,
              cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
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
