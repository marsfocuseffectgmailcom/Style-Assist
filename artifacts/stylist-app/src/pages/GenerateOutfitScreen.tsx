import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { useStylePreferences } from "../hooks/useStylePreferences"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { wardrobeItems } from "../lib/mockData"
import { generateOutfits } from "../lib/outfitGenerator"
import type { GeneratedOutfit } from "../lib/outfitGenerator"
import type { TimelineOutfit } from "../lib/types"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "long",
    day:     "numeric",
    month:   "short",
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function outfitSignature(outfit: GeneratedOutfit): string {
  return outfit.items
    .map((i) => i.id)
    .sort()
    .join("|")
}

// ─── Confidence config ────────────────────────────────────────────────────────

const confidenceConfig = {
  high: {
    label:  "High match",
    color:  "#5F8F7F",
    bg:     "rgba(95,143,127,0.10)",
    border: "rgba(95,143,127,0.22)",
    ring:   "#5F8F7F",
  },
  safe: {
    label:  "Safe choice",
    color:  "#C8A96A",
    bg:     "rgba(200,169,106,0.10)",
    border: "rgba(200,169,106,0.22)",
    ring:   "#C8A96A",
  },
  experimental: {
    label:  "Bold pick",
    color:  "#7FA9A3",
    bg:     "rgba(127,169,163,0.10)",
    border: "rgba(127,169,163,0.22)",
    ring:   "#7FA9A3",
  },
}

// ─── Breakdown labels ─────────────────────────────────────────────────────────

const breakdownLabels: Record<string, string> = {
  eventMatch:        "Event match",
  colourHarmony:     "Colour harmony",
  styleConsistency:  "Style consistency",
  seasonSuitability: "Season fit",
  userPreference:    "Your taste",
  freshness:         "Freshness",
  shoeMatch:         "Shoe fit",
  bagMatch:          "Bag match",
  accessories:       "Accessories",
}

const breakdownMax: Record<string, number> = {
  eventMatch:        30,
  colourHarmony:     25,
  styleConsistency:  20,
  seasonSuitability: 10,
  userPreference:    10,
  freshness:         5,
  shoeMatch:         10,
  bagMatch:          4,
  accessories:       4,
}

// ─── ScoreMeter ───────────────────────────────────────────────────────────────

function ScoreMeter({ score, color }: { score: number; color: string }) {
  const size = 52
  const sw   = 4
  const r    = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color}
          strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-[13px] font-bold tabular-nums" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

// ─── BreakdownRow ─────────────────────────────────────────────────────────────

function BreakdownRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="w-[116px] shrink-0 text-[11px] text-[#6B8490]">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-white/8" style={{ height: 3 }}>
        <motion.div
          className="h-full rounded-full bg-[#3F6F73]/60"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-[#AABBC0]">
        {value}/{max}
      </span>
    </div>
  )
}

// ─── OutfitCard ───────────────────────────────────────────────────────────────

function OutfitCard({
  outfit,
  selected,
  anySelected,
  onSelect,
  index,
}: {
  outfit:      GeneratedOutfit
  selected:    boolean
  anySelected: boolean
  onSelect:    () => void
  index:       number
}) {
  const [showBreakdown,  setShowBreakdown]  = useState(false)
  const [showShoeAlts,   setShowShoeAlts]   = useState(false)
  const [dismissedIds,   setDismissedIds]   = useState<Set<string>>(new Set())

  const scoreAdjustment = [...dismissedIds].reduce(
    (sum, id) => sum + (outfit.accessoryScores[id] ?? 0), 0
  )
  const displayScore = Math.max(0, Math.min(100, outfit.score - scoreAdjustment))
  const cfg    = confidenceConfig[displayScore >= 82 ? "high" : displayScore >= 65 ? "safe" : "experimental"]
  const shown  = outfit.items.slice(0, 4)
  const dimmed = anySelected && !selected

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: dimmed ? 0.62 : 1, y: selected ? -6 : 0, scale: selected ? 1.015 : dimmed ? 0.98 : 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        layout:   { duration: 0.16, ease: "easeOut" },
        opacity:  { duration: 0.2,  ease: "easeOut", delay: index * 0.05 },
        y:        { duration: 0.2,  ease: "easeOut", delay: index * 0.05 },
        scale:    { duration: 0.16, ease: "easeOut" },
      }}
      style={{
        borderRadius: 24,
        boxShadow: selected ? "0 12px 32px rgba(63,111,115,0.22)" : "none",
      }}
      className={`w-full overflow-hidden border text-left transition-colors ${
        selected
          ? "border-[#3F6F73] bg-[#3F6F73]/6"
          : "border-white/8 bg-[#2A3645]"
      }`}
    >
      {/* ── Tappable header ── */}
      <button onClick={onSelect} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          {/* Collage */}
          <div className="grid h-[78px] w-[78px] shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-[14px] bg-[#243140]">
            {shown.map((item, i) => (
              <img key={i} src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ))}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold leading-tight text-[#F2F4F5]">
                  {outfit.name}
                </h3>
                <span
                  className="mt-1.5 inline-flex h-7 items-center rounded-full px-2.5 text-[12px] font-bold"
                  style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  {cfg.label}
                </span>
              </div>
              <ScoreMeter score={displayScore} color={cfg.ring} />
            </div>

            {outfit.reason && (
              <p className="mt-2 text-[12px] leading-relaxed text-[#6B8490]">{outfit.reason}</p>
            )}
          </div>

          {/* Selected check */}
          <motion.div
            animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3F6F73]"
          >
            <Check size={13} className="text-white" />
          </motion.div>
        </div>

        {/* Tags */}
        {outfit.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {outfit.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] capitalize text-[#AABBC0]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Item list */}
        <div className="mt-3 space-y-1.5">
          {outfit.items.map((item) => {
            const isShoe = item.category === "Shoes"
            const hasAlts = isShoe && outfit.shoeAlternatives.length > 0
            return (
              <div key={item.id}>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-[8px] bg-[#243140]">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="flex-1 truncate text-xs text-[#AABBC0]">{item.name}</span>
                  {item.source === "suggestion" && (
                    <span className="shrink-0 rounded-full bg-[#C8A96A]/15 px-2 py-0.5 text-[9px] font-semibold text-[#C8A96A]">
                      Incoming
                    </span>
                  )}
                  {hasAlts && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowShoeAlts((v) => !v) }}
                      className="ml-1 shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-semibold text-[#7FA9A3]"
                    >
                      {showShoeAlts ? "Close" : "Try others"}
                    </button>
                  )}
                </div>

                {/* Inline shoe alternatives */}
                <AnimatePresence>
                  {isShoe && showShoeAlts && outfit.shoeAlternatives.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mt-2 rounded-[14px] p-3"
                        style={{ backgroundColor: "rgba(127,169,163,0.07)", border: "1px solid rgba(127,169,163,0.14)" }}
                      >
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#5E7580]">
                          Also works with this outfit
                        </p>
                        <div className="space-y-1.5">
                          {outfit.shoeAlternatives.map((alt) => (
                            <div key={alt.id} className="flex items-center gap-2">
                              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-[8px] bg-[#243140]">
                                <img src={alt.image} alt={alt.name} className="h-full w-full object-cover" />
                              </div>
                              <span className="flex-1 truncate text-[11px] text-[#AABBC0]">{alt.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* ── Accessories section ── */}
        {outfit.accessories.filter((a) => !dismissedIds.has(a.id)).length > 0 && (
          <div className="mt-3 border-t border-white/[0.06] pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#5E7580]">
              Styling additions
            </p>
            <div className="space-y-1.5">
              {outfit.accessories
                .filter((a) => !dismissedIds.has(a.id))
                .map((acc) => (
                  <div key={acc.id} className="flex items-center gap-2">
                    <div className="h-6 w-6 shrink-0 overflow-hidden rounded-[7px] bg-[#243140]">
                      <img src={acc.image} alt={acc.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] text-[#AABBC0]">{acc.name}</span>
                      {outfit.accessoryReasons[acc.id] && (
                        <span className="text-[10px] text-[#5E7580]">
                          {outfit.accessoryReasons[acc.id]}
                        </span>
                      )}
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{ backgroundColor: "rgba(127,169,163,0.08)", color: "#7FA9A3" }}
                    >
                      {acc.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDismissedIds((prev) => new Set([...prev, acc.id]))
                      }}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#5E7580] transition hover:bg-white/8 hover:text-[#AABBC0]"
                      aria-label={`Remove ${acc.name}`}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </button>

      {/* ── Expanded insight + confirmation (only when selected) ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/* Stylist notes */}
            {outfit.tips.length > 0 && (
              <div className="border-t border-white/6 px-4 pb-4 pt-3">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#C8A96A]">
                  Stylist notes
                </p>
                <ul className="space-y-2">
                  {outfit.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8A96A]/60" />
                      <span className="text-[13px] leading-relaxed text-[#D0D8D5]">{tip}</span>
                    </li>
                  ))}
                </ul>

                {outfit.upgrade && (
                  <div className="mt-3 flex items-start gap-2.5 rounded-[12px] border border-[#3F6F73]/15 bg-[#3F6F73]/6 px-3 py-2.5">
                    <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-[#3F6F73]" />
                    <p className="text-[12px] leading-relaxed text-[#A8C5C2]">{outfit.upgrade}</p>
                  </div>
                )}
              </div>
            )}

            {/* Score breakdown toggle */}
            {outfit.breakdown && Object.keys(outfit.breakdown).length > 0 && (
              <div className="border-t border-white/6 px-4">
                <button
                  onClick={() => setShowBreakdown((v) => !v)}
                  className="flex w-full items-center justify-between py-3 text-[12px] text-[#5E7580] transition hover:text-[#AABBC0]"
                >
                  <span>Score breakdown</span>
                  {showBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden pb-4"
                    >
                      {Object.entries(breakdownLabels).map(([key, label]) => {
                        const val = outfit.breakdown?.[key]
                        if (val === undefined) return null
                        return <BreakdownRow key={key} label={label} value={val} max={breakdownMax[key]} />
                      })}
                      {outfit.gapSuggestion && (
                        <p className="mt-2 rounded-[10px] bg-[#C8A96A]/8 px-3 py-2 text-[11px] leading-relaxed text-[#C8A96A]">
                          💡 {outfit.gapSuggestion}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── "You're set." confirmation ── */}
            <div
              className="border-t border-[#3F6F73]/15 px-4 py-3"
              style={{ backgroundColor: "rgba(63,111,115,0.04)" }}
            >
              <p className="text-[14px] font-semibold text-[#F5F5F5]">You're set.</p>
              <p className="mt-0.5 text-[12px] leading-[18px] text-[#6B8490]">
                You can still switch to another option anytime.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function GenerateOutfitScreen() {
  const navigate                                      = useNavigate()
  const { date }                                      = useParams<{ date: string }>()
  const { items: incomingItems }                      = useIncomingItems()
  const { preferences, recentItemIds, signalOutfit, trackItemsUsed } = useStylePreferences()
  const { saveOutfit }                                = useTimelineOutfits()

  // ── Seen-outfit tracking refs (mutable, no re-render) ──────────────────────
  const seenSignatures = useRef<Set<string>>(new Set())
  const seenNames      = useRef<Set<string>>(new Set())

  function addToSeen(outfits: GeneratedOutfit[]) {
    outfits.forEach((o) => {
      seenSignatures.current.add(outfitSignature(o))
      seenNames.current.add(o.name)
    })
  }

  // ── Initial batch ──────────────────────────────────────────────────────────
  const initialBatch = useMemo(
    () =>
      generateOutfits(date ?? "", wardrobeItems, incomingItems, undefined, {
        preferences,
        usedItemIds: recentItemIds,
      }).slice(0, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [date] // Only recompute when the date changes — not on preference updates mid-session
  )

  // ── Display state ──────────────────────────────────────────────────────────
  const [currentOutfits,    setCurrentOutfits]    = useState<GeneratedOutfit[]>(initialBatch)
  const [batchKey,          setBatchKey]           = useState(0)
  const [isReshuffling,     setIsReshuffling]      = useState(false)
  const [isReshuffledBatch, setIsReshuffledBatch]  = useState(false)
  const [isEmpty,           setIsEmpty]            = useState(false)

  const [selected, setSelected] = useState<string | null>(
    initialBatch.length > 0 ? initialBatch[0].id : null
  )
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const anySelected = selected !== null

  // Register the initial batch into seen sets once
  useEffect(() => {
    addToSeen(initialBatch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount

  // Reset everything when date changes (navigating to a different day)
  useEffect(() => {
    seenSignatures.current = new Set()
    seenNames.current      = new Set()
    const fresh = initialBatch
    addToSeen(fresh)
    setCurrentOutfits(fresh)
    setSelected(fresh[0]?.id ?? null)
    setIsEmpty(false)
    setIsReshuffledBatch(false)
    setBatchKey((k) => k + 1)
    setSaved(false)
    setSaving(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // ── Reshuffle ──────────────────────────────────────────────────────────────

  function handleReshuffle(signal?: "like" | "dislike") {
    if (isReshuffling || isEmpty) return
    const selectedOutfit = currentOutfits.find((o) => o.id === selected)

    // Apply explicit feedback on the currently selected outfit before regenerating
    if (selectedOutfit && signal) {
      signalOutfit(selectedOutfit.tags, [], signal)
    }

    setIsReshuffling(true)

    setTimeout(() => {
      const candidates = generateOutfits(date ?? "", wardrobeItems, incomingItems, undefined, {
        preferences,
        usedItemIds: recentItemIds,
        usedOutfitNames: seenNames.current,
      })

      // Filter out exact item-combination repeats
      const fresh = candidates
        .filter((o) => !seenSignatures.current.has(outfitSignature(o)))
        .slice(0, 3)

      if (fresh.length === 0) {
        setIsEmpty(true)
        setIsReshuffling(false)
        return
      }

      addToSeen(fresh)
      setCurrentOutfits(fresh)
      setSelected(fresh[0].id)
      setIsReshuffledBatch(true)
      setBatchKey((k) => k + 1)
      setIsReshuffling(false)
    }, 300)
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    const outfit = currentOutfits.find((o) => o.id === selected)
    if (!outfit || !date || saving) return

    setSaving(true)
    if ("vibrate" in navigator) navigator.vibrate(12)

    // Reshuffled picks get a weaker preference signal ("skip") vs initial picks ("like")
    signalOutfit(outfit.tags, [], isReshuffledBatch ? "skip" : "like")
    trackItemsUsed(outfit.items.map((i) => i.id))

    const tl: TimelineOutfit = {
      id:         outfit.id,
      date,
      name:       outfit.name,
      items:      outfit.items,
      confidence: outfit.confidence,
      tags:       outfit.tags,
      score:      outfit.score,
      reason:     outfit.reason,
      createdAt:  new Date().toISOString(),
    }
    saveOutfit(tl)

    setSaved(true)
    setTimeout(() => {
      navigate("/timeline")
    }, 900)
  }

  const topOutfit = currentOutfits[0]

  return (
    <AppShell>
      <header className="mb-5 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate("/timeline")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#AABBC0]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[20px] font-bold leading-[26px] tracking-[-0.02em] text-[#F5F5F5]">
            Choose an outfit
          </h1>
          <p className="text-[12px] leading-[16px] font-medium text-[#6B8490]">
            {formatDate(date ?? "")}
          </p>
        </div>
      </header>

      {currentOutfits.length === 0 && !isReshuffling ? (
        <Card className="py-10 text-center">
          <Sparkles size={28} className="mx-auto mb-3 text-[#6B8490]" />
          <p className="text-sm font-medium text-[#AABBC0]">Not enough wardrobe items yet</p>
          <p className="mt-1 text-xs text-[#6B8490]">
            Add more items to your wardrobe to generate outfit combos
          </p>
        </Card>
      ) : (
        <>
          {/* Top score banner */}
          {topOutfit && topOutfit.score >= 65 && !isReshuffling && (
            <motion.div
              key={batchKey}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-[14px] bg-[#5F8F7F]/8 px-3.5 py-2.5"
            >
              <Sparkles size={14} className="shrink-0 text-[#5F8F7F]" />
              <p className="text-[12px] text-[#5F8F7F]">
                Best outfit scores{" "}
                <span className="font-bold">{topOutfit.score}/100</span> — tap to see full styling notes
              </p>
            </motion.div>
          )}

          <p className="mb-4 text-[13px] text-[#6B8490]">
            {currentOutfits.length} suggestion{currentOutfits.length !== 1 ? "s" : ""} —{" "}
            {isReshuffledBatch ? "reshuffled for you" : "tap one to see why it works"}
          </p>

          {/* ── Card list with keyed AnimatePresence for batch swap animation ── */}
          <AnimatePresence mode="wait" initial={false}>
            {isReshuffling ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3 pb-4"
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-[120px] animate-pulse rounded-[24px] bg-white/4"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`batch-${batchKey}`}
                initial={false}
                className="space-y-3 pb-4 pt-1"
              >
                {currentOutfits.map((outfit, i) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    selected={selected === outfit.id}
                    anySelected={anySelected}
                    onSelect={() => setSelected(outfit.id)}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Shoe-repeat notice ── */}
          {(() => {
            const allSame =
              currentOutfits.length >= 2 &&
              !isReshuffling &&
              currentOutfits.every((o) => o.shoeIsShared ||
                currentOutfits[0].items.find((i) => i.category === "Shoes")?.id ===
                o.items.find((i) => i.category === "Shoes")?.id
              )
            return allSame ? (
              <motion.div
                key="shoe-repeat"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-3 flex items-center gap-2.5 rounded-[14px] px-3.5 py-2.5"
                style={{ backgroundColor: "rgba(127,169,163,0.07)", border: "1px solid rgba(127,169,163,0.12)" }}
              >
                <span className="text-[13px] text-[#7FA9A3]">👟</span>
                <p className="text-[12px] leading-[17px] text-[#7FA9A3]">
                  These shoes work best with your current wardrobe.
                </p>
              </motion.div>
            ) : null
          })()}

          {/* ── Reshuffle controls ── */}
          <div className="mb-4 space-y-2">
            {/* Feedback row — only when an outfit is selected */}
            <AnimatePresence>
              {anySelected && !saved && !isEmpty && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex gap-2"
                >
                  <button
                    onClick={() => handleReshuffle("like")}
                    disabled={isReshuffling}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[14px] border border-white/8 bg-white/4 text-[13px] font-semibold text-[#AABBC0] disabled:opacity-40"
                  >
                    <ThumbsUp size={14} className="text-[#5F8F7F]" />
                    More like this
                  </button>
                  <button
                    onClick={() => handleReshuffle("dislike")}
                    disabled={isReshuffling}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[14px] border border-white/8 bg-white/4 text-[13px] font-semibold text-[#AABBC0] disabled:opacity-40"
                  >
                    <ThumbsDown size={14} className="text-[#AABBC0]" />
                    Less like this
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty fallback or Reshuffle button */}
            <AnimatePresence mode="wait" initial={false}>
              {isEmpty ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[16px] border border-white/6 bg-white/3 px-4 py-4 text-center"
                >
                  <p className="text-[13px] font-semibold text-[#AABBC0]">No better options yet</p>
                  <p className="mt-1 text-[12px] leading-[18px] text-[#5E7580]">
                    Add more wardrobe items to improve suggestions.
                  </p>
                </motion.div>
              ) : (
                <motion.button
                  key="reshuffle"
                  onClick={() => handleReshuffle()}
                  disabled={isReshuffling || saved}
                  animate={isReshuffling ? { opacity: 0.5 } : { opacity: 1 }}
                  className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[14px] border border-white/8 bg-white/4 text-[13px] font-semibold text-[#AABBC0] disabled:opacity-40"
                >
                  <motion.span
                    animate={isReshuffling ? { rotate: 360 } : { rotate: 0 }}
                    transition={isReshuffling ? { repeat: Infinity, duration: 0.7, ease: "linear" } : {}}
                  >
                    <RefreshCw size={14} className="text-[#7FA9A3]" />
                  </motion.span>
                  Reshuffle looks
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ── CTA ── */}
          <div className="sticky bottom-[88px] pb-3">
            <motion.button
              onClick={handleSave}
              disabled={!selected || saving}
              animate={saved ? { scale: 0.96 } : { scale: 1 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#3F6F73] text-base font-bold tracking-[-0.01em] text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] disabled:opacity-45"
            >
              <AnimatePresence mode="wait" initial={false}>
                {saved ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.14 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    Outfit saved
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.14 }}
                  >
                    Wear this
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {anySelected && !saved && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 text-center text-[12px] text-[#5E7580]"
                >
                  Saved for {formatDateShort(date ?? "")}. You can still change it anytime.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </AppShell>
  )
}
