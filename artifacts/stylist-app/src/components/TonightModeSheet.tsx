import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Moon, ChevronRight } from "lucide-react"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { useStylePreferences } from "../hooks/useStylePreferences"
import { loadItemPreferences } from "../hooks/useItemPreferences"
import { wardrobeItems } from "../lib/mockData"
import { generateOutfits } from "../lib/outfitGenerator"

// ─── Options ──────────────────────────────────────────────────────────────────

type Occasion = "casual" | "dinner" | "going-out" | "work" | "event"
type Weather  = "sunny" | "cloudy" | "rainy" | "cold" | "warm"

const OCCASIONS: { id: Occasion; label: string; sub: string; eventType: string }[] = [
  { id: "casual",    label: "Casual",    sub: "Easy, effortless",       eventType: "casual"  },
  { id: "dinner",    label: "Dinner",    sub: "Polished and relaxed",    eventType: "dinner"  },
  { id: "going-out", label: "Going out", sub: "One statement piece",     eventType: "party"   },
  { id: "work",      label: "Work",      sub: "Clean and professional",  eventType: "work"    },
  { id: "event",     label: "Event",     sub: "Something to remember",   eventType: "wedding" },
]

const WEATHER_OPTIONS: { id: Weather; label: string }[] = [
  { id: "sunny",  label: "Sunny"  },
  { id: "cloudy", label: "Cloudy" },
  { id: "rainy",  label: "Rainy"  },
  { id: "cold",   label: "Cold"   },
  { id: "warm",   label: "Warm"   },
]

// ─── Design tokens (match app system exactly) ─────────────────────────────────

const T = {
  elevated: "#151922",
  card:     "#1A1F2B",
  pink:     "#FF4D8D",
  coral:    "#FF7A5C",
  gold:     "#C8A96A",
  teal:     "#4ECFA8",
  text:     "#F6F3EE",
  sub:      "#A8AFBE",
  muted:    "#6F7788",
  border:   "rgba(255,255,255,0.08)",
}

// ─── Component ────────────────────────────────────────────────────────────────

export type TonightModeSheetProps = {
  onClose: () => void
}

export function TonightModeSheet({ onClose }: TonightModeSheetProps) {
  const navigate = useNavigate()

  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [weather,  setWeather]  = useState<Weather | null>(null)
  const [useGoTo,  setUseGoTo]  = useState(false)

  const { items: incomingItems }       = useIncomingItems()
  const { preferences, recentItemIds } = useStylePreferences()

  const today = new Date().toISOString().slice(0, 10)

  function handleGetOutfit() {
    if (!occasion) return

    const occ     = OCCASIONS.find((o) => o.id === occasion)
    const outfits = generateOutfits(today, wardrobeItems, incomingItems, occ?.eventType, {
      preferences,
      usedItemIds: recentItemIds,
    })

    // Tonight mode: prioritise reliable combinations — exclude experimental
    const reliable = outfits.filter((o) => o.confidence !== "experimental")
    const pool     = reliable.length > 0 ? reliable : outfits

    let best = pool[0]

    // If go-to toggle is on, prefer an outfit that includes at least one go-to item
    if (useGoTo && pool.length > 1) {
      const prefs      = loadItemPreferences()
      const withGoTo   = pool.find((o) =>
        o.items.some((item) => prefs[String(item.id)]?.reach === "go-to")
      )
      if (withGoTo) best = withGoTo
    }

    if (!best) return

    navigate("/timeline/outfit-result", {
      state: { outfit: best, date: today, mode: "tonight" },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative z-10 max-h-[88dvh] overflow-y-auto rounded-t-[32px] px-6 pb-10 pt-3"
        style={{ backgroundColor: T.elevated }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Moon size={15} style={{ color: T.gold }} />
              <span className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: T.gold }}>
                Tonight Mode
              </span>
            </div>
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.3px]" style={{ color: T.text }}>
              I need an outfit tonight
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/8 transition hover:bg-white/12"
            style={{ color: T.muted }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Occasion ── */}
        <div className="mb-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: T.muted }}>
            Occasion <span style={{ color: T.pink }}>*</span>
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {OCCASIONS.map((occ) => {
              const active = occasion === occ.id
              return (
                <button
                  key={occ.id}
                  onClick={() => setOccasion(occ.id)}
                  className="flex flex-col items-start rounded-[18px] border px-4 py-3.5 text-left transition active:scale-[0.97]"
                  style={{
                    borderColor:     active ? "rgba(255,77,141,0.40)"  : T.border,
                    backgroundColor: active ? "rgba(255,77,141,0.07)"  : T.card,
                  }}
                >
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: active ? T.pink : T.text }}
                  >
                    {occ.label}
                  </span>
                  <span className="mt-0.5 text-[11px]" style={{ color: T.muted }}>
                    {occ.sub}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Weather ── */}
        <div className="mb-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: T.muted }}>
            Weather
            <span className="ml-2 normal-case font-normal" style={{ color: "#5A6275" }}>optional</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map((w) => {
              const active = weather === w.id
              return (
                <button
                  key={w.id}
                  onClick={() => setWeather(weather === w.id ? null : w.id)}
                  className="rounded-full border px-4 py-2 text-[13px] font-medium transition active:scale-[0.97]"
                  style={{
                    borderColor:     active ? "rgba(200,169,106,0.40)" : T.border,
                    backgroundColor: active ? "rgba(200,169,106,0.10)" : "rgba(255,255,255,0.04)",
                    color:           active ? T.gold : T.sub,
                  }}
                >
                  {w.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Go-to item toggle ── */}
        <button
          onClick={() => setUseGoTo((v) => !v)}
          className="mb-6 flex w-full items-center justify-between rounded-[18px] border px-4 py-3.5 text-left transition active:scale-[0.97]"
          style={{
            borderColor:     useGoTo ? "rgba(78,207,168,0.30)" : T.border,
            backgroundColor: useGoTo ? "rgba(78,207,168,0.07)" : T.card,
          }}
        >
          <div className="min-w-0 flex-1 pr-4">
            <p className="text-[14px] font-semibold" style={{ color: T.text }}>
              Use a go-to item
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: T.muted }}>
              Anchor the outfit around a piece you reach for often
            </p>
          </div>

          {/* Toggle pill */}
          <div
            className="flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
            style={{
              backgroundColor: useGoTo ? T.teal : "rgba(255,255,255,0.12)",
              padding: "2px",
            }}
          >
            <motion.div
              className="h-5 w-5 rounded-full bg-white shadow"
              animate={{ x: useGoTo ? 20 : 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
            />
          </div>
        </button>

        {/* ── CTA ── */}
        <button
          onClick={handleGetOutfit}
          disabled={!occasion}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] py-4 text-[15px] font-semibold text-white transition active:scale-[0.97] disabled:opacity-40"
          style={{
            background:  `linear-gradient(to right, ${T.pink}, ${T.coral})`,
            boxShadow:   "0 4px 20px rgba(255,77,141,0.28)",
          }}
        >
          Get my outfit
          <ChevronRight size={16} />
        </button>
      </motion.div>
    </div>
  )
}
