import {
  Sparkles, Package, CalendarDays, ChevronRight, Moon,
  Check, RefreshCw, Compass, Cloud, Sun, CloudRain,
  Bookmark, Shirt, ArrowLeftRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { track } from "../hooks/useAnalytics"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { NotificationBell } from "../components/NotificationCenter"
import { OutfitCard } from "../components/OutfitCard"
import { TonightModeSheet } from "../components/TonightModeSheet"
import { outfitCards, wardrobeItems } from "../lib/mockData"
import type { WardrobeItem } from "../lib/mockData"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { usePlannedEvents } from "../hooks/usePlannedEvents"
import { usePersonalisation } from "../lib/usePersonalisation"
import { PersonalisationHint, ItemUsagePill } from "../components/PersonalisationHint"

// ─── Design tokens ──────────────────────────────────────────────────────────

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

// ─── Daily outfit definitions ────────────────────────────────────────────────
// Deterministic: keyed by day-of-week (0=Sun…6=Sat).

type DailyOutfitDef = {
  name:        string
  vibe:        string
  reason:      string
  itemIds:     number[]
  occasionTag: string
}

const DAILY_OUTFITS: DailyOutfitDef[] = [
  { name: "Relaxed Sunday",    vibe: "Easy off-duty",   occasionTag: "Weekend", itemIds: [2, 4, 7],     reason: "A reliable combination for a day with no agenda — comfortable enough to move, considered enough to look intentional." },
  { name: "Monochrome Monday", vibe: "Sharp & minimal", occasionTag: "Work",    itemIds: [10, 6, 8, 12], reason: "Starting the week in a consistent palette reads as intentional. The tonal look does the thinking for you." },
  { name: "Tuesday edit",      vibe: "Clean & simple",  occasionTag: "Casual",  itemIds: [2, 4, 7],     reason: "A low-effort combination that stays neat throughout the day. Reliable for any mid-week schedule." },
  { name: "Midweek polish",    vibe: "Considered",      occasionTag: "Work",    itemIds: [1, 10, 5, 8], reason: "A blazer shifts the whole register. Beige trousers keep it from feeling too formal — polished without the suit." },
  { name: "Almost Friday",     vibe: "Refined",         occasionTag: "Work",    itemIds: [3, 2, 6, 8],  reason: "The coat does the heavy lifting. Keep everything underneath minimal and the whole look holds." },
  { name: "Friday casual",     vibe: "Smart casual",    occasionTag: "Casual",  itemIds: [2, 4, 8],     reason: "Sharp enough to feel put-together, relaxed enough to switch off at 5. The loafers lift the denim." },
  { name: "Saturday easy",     vibe: "Off duty",        occasionTag: "Weekend", itemIds: [10, 4, 7],    reason: "The classic off-duty formula. High contrast, minimal effort, and entirely reliable." },
]

// ─── Weather mock ────────────────────────────────────────────────────────────

type WeatherData = { Icon: typeof Cloud; temp: string; desc: string; note: string }

function getMockWeather(): WeatherData {
  const m = new Date().getMonth()
  if (m >= 11 || m <= 1)  return { Icon: CloudRain, temp: "9°C",  desc: "Light rain",    note: "the coat earns its place today" }
  if (m <= 4)             return { Icon: Cloud,     temp: "16°C", desc: "Partly cloudy", note: "good layer weather" }
  if (m <= 7)             return { Icon: Sun,       temp: "23°C", desc: "Sunny",         note: "this outfit breathes well" }
  return                         { Icon: Cloud,     temp: "12°C", desc: "Overcast",       note: "a layer is worth it" }
}

// ─── Swap alternatives ───────────────────────────────────────────────────────
// Maps item id → list of alternative item ids in the same category.

const SWAP_ALTS: Record<number, number[]> = {
  1:  [3],      // Brown Blazer ↔ Black Coat
  2:  [10],     // Cream Knit ↔ Black T-Shirt
  3:  [1],      // Black Coat ↔ Brown Blazer
  4:  [5, 6],   // Blue Denim ↔ Beige or Black Trousers
  5:  [6, 4],   // Beige Trousers ↔ Black Trousers or Jeans
  6:  [5, 4],   // Black Trousers ↔ Beige Trousers or Jeans
  7:  [8],      // White Sneakers ↔ Black Loafers
  8:  [7, 9],   // Black Loafers ↔ White Sneakers or Black Heels
  9:  [8],      // Black Heels ↔ Black Loafers
  10: [2],      // Black T-Shirt ↔ Cream Knit
  12: [],       // Black Tote — no alternatives
}

// ─── Home suggestions ────────────────────────────────────────────────────────
// 2 evergreen gap-fillers shown after 2 "See alternatives" taps.

type HomeSuggestion = {
  id:        string
  name:      string
  descriptor:string
  reason:    string
  unlocks:   number
  icon:      "shirt" | "package"
}

const HOME_SUGGESTIONS: HomeSuggestion[] = [
  { id:"hs1", name:"Ankle Boots",        descriptor:"Black leather, block heel",       reason:"The one missing footwear option that works across every occasion", unlocks:6, icon:"package" },
  { id:"hs2", name:"Wide-Leg Trousers",  descriptor:"Stone or camel, fluid fabric",    reason:"A different silhouette that gives your tops new range",            unlocks:5, icon:"shirt"   },
]

// ─── Occasion badge colours ───────────────────────────────────────────────────

const OCCASION_STYLE: Record<string, { color: string; bg: string }> = {
  Work:    { color: T.teal,  bg: `${T.teal}18`  },
  Casual:  { color: T.coral, bg: `${T.coral}18` },
  Weekend: { color: T.gold,  bg: `${T.gold}18`  },
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function resolveItems(ids: number[]): WardrobeItem[] {
  return ids.map((id) => wardrobeItems.find((w) => w.id === id)).filter((w): w is WardrobeItem => !!w)
}

function daysUntil(dateStr: string): number {
  const t = new Date(); t.setHours(0, 0, 0, 0)
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Swap sheet component ─────────────────────────────────────────────────────

function SwapSheet({
  itemIds, onSwap, onClose,
}: {
  itemIds: number[]
  onSwap: (oldId: number, newId: number) => void
  onClose: () => void
}) {
  const [expanding, setExpanding] = useState<number | null>(null)
  const items = resolveItems(itemIds)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(10,16,24,0.72)", backdropFilter: "blur(4px)" }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        style={{ position: "relative", background: T.card, borderRadius: "24px 24px 0 0", padding: "0 0 40px", maxHeight: "78vh", overflowY: "auto" }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: T.muted }} />
        </div>

        <div style={{ padding: "12px 20px 0" }}>
          <p style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: "-0.3px", marginBottom: 4 }}>Swap one piece</p>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Tap an item to see alternatives</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item) => {
              const alts = resolveItems(SWAP_ALTS[item.id] ?? [])
              const isOpen = expanding === item.id

              return (
                <div key={item.id}>
                  {/* Item row */}
                  <button
                    onClick={() => setExpanding(isOpen ? null : item.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 16,
                      background: isOpen ? `${T.teal}14` : T.raised,
                      border: isOpen ? `1px solid ${T.teal}40` : `1px solid ${T.border}`,
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.18s",
                    }}
                  >
                    <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: T.muted }}>{item.category}</p>
                    </div>
                    <ArrowLeftRight size={14} style={{ color: isOpen ? T.teal : T.muted, flexShrink: 0 }} />
                  </button>

                  {/* Alternatives */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden", paddingLeft: 56, paddingTop: 6, paddingBottom: 2 }}
                      >
                        {alts.length === 0 ? (
                          <p style={{ fontSize: 12, color: T.muted, paddingBottom: 6 }}>No alternatives available</p>
                        ) : (
                          <div style={{ display: "flex", gap: 8 }}>
                            {alts.map((alt) => (
                              <button
                                key={alt.id}
                                onClick={() => { onSwap(item.id, alt.id); setExpanding(null); onClose() }}
                                style={{
                                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                                  padding: "8px 10px", borderRadius: 14,
                                  background: T.bg, border: `1px solid ${T.border}`,
                                  cursor: "pointer",
                                }}
                              >
                                <img src={alt.image} alt={alt.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover" }} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: T.sub, maxWidth: 56, textAlign: "center", lineHeight: 1.25 }}>
                                  {alt.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Smart picks suggestion card ──────────────────────────────────────────────

function HomeSuggestionCard({ item }: { item: HomeSuggestion }) {
  const [saved, setSaved] = useState(false)
  const Icon = item.icon === "shirt" ? Shirt : Package

  function handleBookmark() {
    setSaved((s) => {
      if (!s) track("purchase_clicked", { item: item.name, screen: "home" })
      return !s
    })
  }

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 18,
      background: T.card, border: `1px solid ${T.border}`,
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${T.teal}14`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} style={{ color: T.teal }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.15px" }}>{item.name}</p>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, letterSpacing: "0.03em",
            background: `${T.teal}14`, color: T.teal,
          }}>GAP FILLER</span>
        </div>
        <p style={{ fontSize: 11, color: T.muted, marginBottom: 5 }}>{item.descriptor}</p>
        <p style={{ fontSize: 12, color: T.sub, lineHeight: 1.4 }}>{item.reason}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 9 }}>
          <Sparkles size={11} style={{ color: T.gold }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: T.gold }}>
            Unlocks {item.unlocks} new outfit combinations
          </span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={handleBookmark}
        style={{
          width: 34, height: 34, borderRadius: 99, border: "none", cursor: "pointer",
          flexShrink: 0, marginTop: -2,
          background: saved ? `${T.teal}20` : "rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.18s",
        }}
      >
        <Bookmark size={14} style={{ color: saved ? T.teal : T.muted }} fill={saved ? T.teal : "none"} />
      </motion.button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function Home() {
  const navigate  = useNavigate()
  const now       = new Date()
  const hour      = now.getHours()
  const isMorning = hour < 12
  const isEvening = hour >= 17
  const greeting  = isMorning ? "Good morning," : isEvening ? "Good evening," : "Good afternoon,"

  const today = now.toISOString().slice(0, 10)
  const { items: incoming }  = useIncomingItems()
  const { events }           = usePlannedEvents()

  const nextDelivery = [...incoming]
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .find((i) => new Date(i.deliveryDate) >= new Date(today))

  const nextEvent = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .find((e) => new Date(e.date) >= new Date(today))

  // ── Personalisation ─────────────────────────────────────────────────────────
  const {
    recordAccept,
    recordReshuffle,
    recordAppOpen,
    recordTonightMode,
    getItemLabel,
    outfitHint,
  } = usePersonalisation()

  // ── Daily outfit state ──────────────────────────────────────────────────────

  const dailyDef = useMemo(() => DAILY_OUTFITS[now.getDay()], [])
  const weather  = useMemo(() => getMockWeather(), [])

  const [currentIds,     setCurrentIds]     = useState<number[]>(dailyDef.itemIds)
  const [wornToday,      setWornToday]      = useState(false)
  const [wornConfirm,    setWornConfirm]    = useState(false)   // brief flash
  const [showSwap,       setShowSwap]       = useState(false)
  const [altCount,       setAltCount]       = useState(0)
  const [showTonightMode, setShowTonightMode] = useState(false)

  const showSuggestions = altCount >= 2
  const hint = outfitHint(dailyDef.name)

  // ── Analytics + personalisation boot ─────────────────────────────────────────
  const suggShownRef = useRef(false)

  useEffect(() => {
    track("outfit_viewed")
    recordAppOpen()
  }, [recordAppOpen])

  useEffect(() => {
    if (showSuggestions && !suggShownRef.current) {
      track("purchase_suggestion_shown", { screen: "home" })
      suggShownRef.current = true
    }
  }, [showSuggestions])

  const outfitItems     = resolveItems(currentIds)
  const occasion        = OCCASION_STYLE[dailyDef.occasionTag] ?? OCCASION_STYLE.Casual

  function handleWearThis() {
    track("outfit_accepted", { outfit: dailyDef.name })
    recordAccept(dailyDef.name, currentIds)
    setWornToday(true)
    setWornConfirm(true)
    setTimeout(() => setWornConfirm(false), 3000)
  }

  function handleSwap(oldId: number, newId: number) {
    setCurrentIds((ids) => ids.map((id) => (id === oldId ? newId : id)))
  }

  function handleSeeAlternatives() {
    recordReshuffle(dailyDef.name)
    setAltCount((n) => n + 1)
    const d = now.toISOString().split("T")[0]
    navigate(`/timeline/generate/${d}`)
  }

  function handleTonightMode() {
    recordTonightMode()
    setShowTonightMode(true)
  }

  return (
    <>
      <AppShell>

        {/* ── Header ── */}
        <header className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[15px] leading-[22px] text-[#A8B0B8]">{greeting}</p>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.03em] text-[#F5F5F5]">
              Alex
            </h1>
          </div>
          <NotificationBell />
        </header>

        {/* ── Quick-glance mini cards ── */}
        {(nextDelivery || nextEvent) && (
          <div className="mb-5 grid grid-cols-2 gap-3">
            {nextDelivery && (
              <button
                onClick={() => navigate("/incoming-items")}
                className="rounded-[20px] border border-white/6 bg-[#2A3645] p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <Package size={15} className="mb-2 text-[#C8A96A]" />
                <p className="text-[11px] font-medium text-[#9CA3AF]">Next delivery</p>
                <p className="mt-0.5 truncate text-[14px] font-bold text-[#F5F5F5]">{nextDelivery.name}</p>
                <p className="text-[11px] font-medium text-[#C8A96A]">
                  {daysUntil(nextDelivery.deliveryDate) <= 0 ? "Today" : `${daysUntil(nextDelivery.deliveryDate)}d away`}
                </p>
              </button>
            )}
            {nextEvent && (
              <button
                onClick={() => navigate("/plan-ahead")}
                className="rounded-[20px] border border-white/6 bg-[#2A3645] p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <CalendarDays size={15} className="mb-2 text-[#3F6F73]" />
                <p className="text-[11px] font-medium text-[#9CA3AF]">Next event</p>
                <p className="mt-0.5 truncate text-[14px] font-bold text-[#F5F5F5]">{nextEvent.name}</p>
                <p className="text-[11px] font-medium text-[#3F6F73]">
                  {daysUntil(nextEvent.date) === 0 ? "Today" : `${daysUntil(nextEvent.date)}d away`}
                </p>
              </button>
            )}
          </div>
        )}

        {/* ── TODAY'S OUTFIT hero ── */}
        <div style={{
          borderRadius: 24, overflow: "hidden",
          background: T.card, border: `1px solid ${T.border}`,
          marginBottom: 16,
        }}>
          <AnimatePresence mode="wait">
            {wornToday ? (
              /* ── Worn state ── */
              <motion.div
                key="worn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32 }}
                style={{ padding: "20px 18px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `${T.teal}20`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Check size={22} style={{ color: T.teal }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.2px" }}>
                      You're set for today.
                    </p>
                    <p style={{ fontSize: 13, color: T.muted }}>{dailyDef.name} is locked in</p>
                  </div>
                </div>

                {/* Mini outfit strip */}
                <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                  {outfitItems.slice(0, 4).map((item) => (
                    <div key={item.id} style={{ flex: 1, height: 60, borderRadius: 10, overflow: "hidden" }}>
                      <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setWornToday(false)}
                  style={{
                    marginTop: 14, width: "100%", padding: "10px 0",
                    borderRadius: 14, border: `1px solid ${T.border}`,
                    background: "transparent", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, color: T.muted,
                  }}
                >
                  Change outfit
                </button>
              </motion.div>
            ) : (
              /* ── Default outfit card ── */
              <motion.div
                key="outfit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Label row */}
                <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Sparkles size={13} style={{ color: T.gold }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Today's Outfit
                    </p>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 99,
                    background: occasion.bg,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: occasion.color }}>{dailyDef.occasionTag}</span>
                  </div>
                </div>

                {/* Outfit name */}
                <div style={{ padding: "0 16px 12px" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", color: T.text, marginBottom: 1 }}>
                    {dailyDef.name}
                  </h2>
                  <p style={{ fontSize: 13, color: T.muted }}>{dailyDef.vibe}</p>
                </div>

                {/* Photo grid */}
                <div style={{ display: "flex", height: 180, gap: 2, margin: "0 0 0 0" }}>
                  {outfitItems.slice(0, 2).map((item, i) => {
                    const lbl = getItemLabel(item.id)
                    return (
                      <div key={item.id} style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {lbl && (
                          <div style={{ position: "absolute", bottom: 5, left: i === 0 ? 6 : "auto", right: i === 1 ? 6 : "auto" }}>
                            <ItemUsagePill label={lbl} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {outfitItems.length > 2 && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                      {outfitItems.slice(2, 4).map((item) => {
                        const lbl = getItemLabel(item.id)
                        return (
                          <div key={item.id} style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                            <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            {lbl && (
                              <div style={{ position: "absolute", bottom: 4, right: 5 }}>
                                <ItemUsagePill label={lbl} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* AI reason + weather */}
                <div style={{ padding: "14px 16px 0" }}>
                  <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.5, marginBottom: 10 }}>
                    {dailyDef.reason}
                  </p>
                  {/* Weather pill */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 99,
                    background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`,
                    marginBottom: 14,
                  }}>
                    <weather.Icon size={12} style={{ color: T.coral }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.sub }}>
                      {weather.temp} · {weather.desc} — {weather.note}
                    </span>
                  </div>
                </div>

                {/* Personalisation hint — appears only after enough signals */}
                <AnimatePresence>
                  {hint && <PersonalisationHint key={hint} type={hint} />}
                </AnimatePresence>

                {/* Actions */}
                <div style={{ padding: "0 16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Primary: Wear this */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleWearThis}
                    style={{
                      width: "100%", height: 52, borderRadius: 16,
                      background: `linear-gradient(to right, ${T.teal}, ${T.coral})`,
                      border: "none", cursor: "pointer",
                      fontSize: 15, fontWeight: 700, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: "0 4px 18px rgba(63,111,115,0.28)",
                    }}
                  >
                    <Check size={16} />
                    Wear this
                  </motion.button>

                  {/* Secondary row */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowSwap(true)}
                      style={{
                        flex: 1, height: 46, borderRadius: 14,
                        background: T.raised, border: `1px solid ${T.border}`,
                        cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: T.sub,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      }}
                    >
                      <ArrowLeftRight size={14} />
                      Swap one thing
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleSeeAlternatives}
                      style={{
                        flex: 1, height: 46, borderRadius: 14,
                        background: T.raised, border: `1px solid ${T.border}`,
                        cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: T.sub,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      }}
                    >
                      <Compass size={14} />
                      See alternatives
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Evening prompt ── */}
        <AnimatePresence>
          {isEvening && !wornToday && (
            <motion.div
              key="evening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              style={{ marginBottom: 16 }}
            >
              <button
                onClick={handleTonightMode}
                style={{
                  width: "100%", padding: "15px 18px",
                  borderRadius: 20,
                  background: "rgba(200,169,106,0.08)",
                  border: "1px solid rgba(200,169,106,0.24)",
                  cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: "rgba(200,169,106,0.14)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Moon size={18} style={{ color: T.gold }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 1 }}>
                    Need something for tonight?
                  </p>
                  <p style={{ fontSize: 12, color: T.muted }}>Build an evening look from what you own</p>
                </div>
                <ChevronRight size={16} style={{ color: T.muted, marginLeft: "auto", flexShrink: 0 }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Smart picks — unlocked after 2 "See alternatives" taps ── */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              style={{ marginBottom: 20 }}
            >
              {/* Separator */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.1em" }}>SMART PICKS</span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>

              <p style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: "-0.2px", marginBottom: 4 }}>
                You've explored your best looks
              </p>
              <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.5, marginBottom: 14 }}>
                These two items fill genuine gaps and unlock more combinations with what you already own.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {HOME_SUGGESTIONS.map((item) => (
                  <HomeSuggestionCard key={item.id} item={item} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Recent Looks ── */}
        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[15px] font-bold text-[#F5F5F5]">Recent Looks</p>
            <button className="text-[13px] font-semibold text-[#7FA9A3]">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {outfitCards.map((outfit) => (
              <OutfitCard key={outfit.id} title={outfit.title} subtitle={outfit.subtitle} image={outfit.image} compact />
            ))}
          </div>
        </section>

        {/* ── Insight card ── */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-[17px] font-bold leading-[22px]">Daily Styling Insight</h3>
              <p className="mt-2 text-[15px] leading-[22px] text-[#A8B0B8]">
                Try tonal dressing today — layering similar shades creates a cleaner silhouette and makes the whole look feel more intentional.
              </p>
            </div>
            <div className="mt-0.5 text-[#C8A96A]">
              <Sparkles size={18} />
            </div>
          </div>
        </Card>

      </AppShell>

      {/* ── Swap sheet ── */}
      <AnimatePresence>
        {showSwap && (
          <SwapSheet key="swap" itemIds={currentIds} onSwap={handleSwap} onClose={() => setShowSwap(false)} />
        )}
      </AnimatePresence>

      {/* ── Tonight mode sheet ── */}
      <AnimatePresence>
        {showTonightMode && (
          <TonightModeSheet onClose={() => setShowTonightMode(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
