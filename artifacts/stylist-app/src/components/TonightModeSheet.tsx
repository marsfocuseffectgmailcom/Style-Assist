import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Check, Moon } from "lucide-react"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { useStylePreferences } from "../hooks/useStylePreferences"
import { wardrobeItems } from "../lib/mockData"
import { generateOutfits } from "../lib/outfitGenerator"
import type { GeneratedOutfit } from "../lib/outfitGenerator"
import type { TimelineOutfit } from "../lib/types"

// ─── Config ───────────────────────────────────────────────────────────────────

type Vibe = "dinner" | "casual" | "party" | "skip"

const VIBES: { id: Vibe; label: string; icon: string; sub: string; eventType?: string }[] = [
  { id: "dinner",  label: "Dinner",  icon: "🍽",  sub: "Polished, relaxed",  eventType: "dinner"  },
  { id: "casual",  label: "Casual",  icon: "👕",  sub: "Easy, no effort",    eventType: "casual"  },
  { id: "party",   label: "Party",   icon: "🎉",  sub: "One statement piece", eventType: "party"   },
  { id: "skip",    label: "Skip",    icon: "→",   sub: "Just show me looks"                        },
]

const confidenceConfig = {
  high:         { label: "High match", color: "#4ECFA8", bg: "rgba(78,207,168,0.12)",  border: "rgba(78,207,168,0.20)" },
  safe:         { label: "Safe choice", color: "#C8A96A", bg: "rgba(200,169,106,0.12)", border: "rgba(200,169,106,0.20)" },
  experimental: { label: "Bold pick",  color: "#FF7A5C", bg: "rgba(255,122,92,0.12)",  border: "rgba(255,122,92,0.20)" },
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Morning — deciding tonight already?"
  if (h < 17) return "Planning your evening look?"
  return "What are you wearing tonight?"
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── Inner: outfit viewer card ────────────────────────────────────────────────

function OutfitViewer({
  outfits,
  onWearThis,
  onSaveToToday,
  onBack,
  saved,
}: {
  outfits: GeneratedOutfit[]
  onWearThis: () => void
  onSaveToToday: (outfit: GeneratedOutfit) => void
  onBack: () => void
  saved: boolean
}) {
  const [idx, setIdx] = useState(0)
  const outfit = outfits[idx]
  if (!outfit) return null
  const cfg = confidenceConfig[outfit.confidence]
  const shown = outfit.items.slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Nav row */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] text-[#6F7788] transition hover:text-[#A8AFBE]"
        >
          <ChevronLeft size={14} />
          Change vibe
        </button>
        <span className="text-[12px] text-[#5A6275]">
          {idx + 1} of {outfits.length}
        </span>
      </div>

      {/* Outfit collage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={outfit.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
          className="mb-4"
        >
          <div className="relative mb-3 h-[220px] w-full overflow-hidden rounded-[24px] bg-[#1A1F2B]">
            {shown.length === 0 ? (
              <div className="h-full w-full bg-[#1A1F2B]" />
            ) : shown.length === 1 ? (
              <img src={shown[0].image} alt={shown[0].name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full grid-cols-2 gap-0.5">
                {shown.map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ))}
              </div>
            )}

            {/* Confidence badge overlay */}
            <span
              className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm"
              style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              {cfg.label}
            </span>
          </div>

          {/* Name + reason */}
          <h3 className="mb-1 text-[18px] font-semibold leading-tight tracking-[-0.3px]">
            {outfit.name}
          </h3>
          {outfit.reason && (
            <p className="mb-3 text-[13px] leading-relaxed text-[#6F7788]">{outfit.reason}</p>
          )}

          {/* Item chips */}
          <div className="flex flex-wrap gap-1.5">
            {outfit.items.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 pl-0.5 pr-2.5 py-0.5">
                <img src={item.image} alt={item.name} className="h-5 w-5 rounded-full object-cover" />
                <span className="text-[11px] text-[#A8AFBE]">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      {outfits.length > 1 && (
        <div className="mb-5 flex items-center justify-center gap-3">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#A8AFBE] transition disabled:opacity-30 hover:bg-white/10"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1.5">
            {outfits.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 6,
                  backgroundColor: i === idx ? "#FF4D8D" : "rgba(255,255,255,0.18)",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx((i) => Math.min(outfits.length - 1, i + 1))}
            disabled={idx === outfits.length - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#A8AFBE] transition disabled:opacity-30 hover:bg-white/10"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* CTAs */}
      <button
        onClick={onWearThis}
        className="mb-2.5 w-full rounded-[20px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(255,77,141,0.30)] transition active:scale-[0.97]"
      >
        Wear this
      </button>

      <button
        onClick={() => onSaveToToday(outfit)}
        disabled={saved}
        className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/5 py-3.5 text-[14px] font-semibold text-[#F6F3EE] transition active:scale-[0.97] disabled:opacity-60"
      >
        {saved ? (
          <>
            <Check size={15} className="text-[#4ECFA8]" />
            <span className="text-[#4ECFA8]">Saved to today</span>
          </>
        ) : (
          "Save to today"
        )}
      </button>
    </div>
  )
}

// ─── Main sheet ───────────────────────────────────────────────────────────────

type Phase = "vibe" | "outfits"

export type TonightModeSheetProps = {
  onClose: () => void
}

export function TonightModeSheet({ onClose }: TonightModeSheetProps) {
  const [phase, setPhase] = useState<Phase>("vibe")
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null)
  const [saved, setSaved] = useState(false)

  const { items: incomingItems } = useIncomingItems()
  const { preferences, recentItemIds } = useStylePreferences()
  const { saveOutfit } = useTimelineOutfits()

  // Generate outfits for selected vibe — instant, synchronous
  const outfits = useMemo<GeneratedOutfit[]>(() => {
    if (!selectedVibe) return []
    const vibe = VIBES.find((v) => v.id === selectedVibe)
    return generateOutfits(todayStr(), wardrobeItems, incomingItems, vibe?.eventType, {
      preferences,
      usedItemIds: recentItemIds,
    })
  }, [selectedVibe, incomingItems, preferences, recentItemIds])

  function handleVibeSelect(vibe: Vibe) {
    setSelectedVibe(vibe)
    setSaved(false)
    setPhase("outfits")
  }

  function handleSaveToToday(outfit: GeneratedOutfit) {
    const tl: TimelineOutfit = {
      id: outfit.id,
      date: todayStr(),
      name: outfit.name,
      items: outfit.items,
      confidence: outfit.confidence,
      tags: outfit.tags,
      score: outfit.score,
      reason: outfit.reason,
      createdAt: new Date().toISOString(),
    }
    saveOutfit(tl)
    setSaved(true)
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
        className="relative z-10 rounded-t-[32px] bg-[#151922] px-6 pb-10 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />

        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Moon size={16} className="text-[#C8A96A]" />
              <span className="text-[13px] font-semibold uppercase tracking-widest text-[#C8A96A]">
                Tonight Mode
              </span>
            </div>
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.3px]">
              {phase === "vibe" ? "What's the vibe?" : greeting()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-[#6F7788] transition hover:bg-white/12"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {phase === "vibe" ? (
            <motion.div
              key="vibe"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              {VIBES.map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => handleVibeSelect(vibe.id)}
                  className="flex flex-col items-start rounded-[20px] border border-white/8 bg-[#1A1F2B] px-4 py-4 text-left transition active:scale-[0.97] hover:border-[#FF4D8D]/30 hover:bg-[#FF4D8D]/5"
                >
                  <span className="mb-2 text-[22px] leading-none">{vibe.icon}</span>
                  <span className="text-[15px] font-semibold text-[#F6F3EE]">{vibe.label}</span>
                  <span className="mt-0.5 text-[12px] text-[#6F7788]">{vibe.sub}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="outfits"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {outfits.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-[#6F7788]">Not enough wardrobe items to generate a look.</p>
                  <button
                    onClick={() => setPhase("vibe")}
                    className="mt-4 text-[13px] text-[#FF4D8D]"
                  >
                    Try a different vibe
                  </button>
                </div>
              ) : (
                <OutfitViewer
                  outfits={outfits}
                  onWearThis={onClose}
                  onSaveToToday={handleSaveToToday}
                  onBack={() => setPhase("vibe")}
                  saved={saved}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
