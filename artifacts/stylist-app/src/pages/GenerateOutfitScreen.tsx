import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { useStylePreferences } from "../hooks/useStylePreferences"
import { wardrobeItems } from "../lib/mockData"
import { generateOutfits } from "../lib/outfitGenerator"
import type { GeneratedOutfit } from "../lib/outfitGenerator"
import type { TimelineOutfit } from "../lib/types"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

const confidenceConfig = {
  high: {
    label: "High match",
    color: "#4ECFA8",
    bg: "rgba(78,207,168,0.10)",
    border: "rgba(78,207,168,0.20)",
    scoreColor: "#4ECFA8",
  },
  safe: {
    label: "Safe choice",
    color: "#C8A96A",
    bg: "rgba(200,169,106,0.10)",
    border: "rgba(200,169,106,0.20)",
    scoreColor: "#C8A96A",
  },
  experimental: {
    label: "Bold pick",
    color: "#FF7A5C",
    bg: "rgba(255,122,92,0.10)",
    border: "rgba(255,122,92,0.20)",
    scoreColor: "#FF7A5C",
  },
}

const breakdownLabels: Record<string, string> = {
  eventMatch: "Event match",
  colourHarmony: "Colour harmony",
  styleConsistency: "Style consistency",
  seasonSuitability: "Season fit",
  userPreference: "Your taste",
  freshness: "Freshness",
}

const breakdownMax: Record<string, number> = {
  eventMatch: 30,
  colourHarmony: 25,
  styleConsistency: 20,
  seasonSuitability: 10,
  userPreference: 10,
  freshness: 5,
}

function ScoreMeter({ score, color }: { score: number; color: string }) {
  const size = 52
  const strokeWidth = 4
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-[13px] font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

function BreakdownRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="w-[120px] shrink-0 text-[11px] text-[#6F7788]">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-white/8" style={{ height: 4 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full bg-[#FF4D8D]/70"
        />
      </div>
      <span className="w-8 text-right text-[11px] font-medium text-[#A8AFBE]">
        {value}/{max}
      </span>
    </div>
  )
}

function OutfitCard({
  outfit,
  selected,
  onSelect,
}: {
  outfit: GeneratedOutfit
  selected: boolean
  onSelect: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = confidenceConfig[outfit.confidence]
  const shown = outfit.items.slice(0, 4)

  return (
    <motion.div
      layout
      className={`w-full overflow-hidden rounded-[24px] border text-left transition ${
        selected ? "border-[#FF4D8D]/50 bg-[#FF4D8D]/6" : "border-white/10 bg-[#151922]"
      }`}
    >
      <button onClick={onSelect} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          {/* Collage */}
          <div className="grid h-[80px] w-[80px] shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-[16px] bg-[#1A1F2B]">
            {shown.map((item, i) => (
              <img key={i} src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ))}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="flex-1 text-[15px] font-semibold leading-snug text-[#F6F3EE]">
                {outfit.name}
              </h3>
              <ScoreMeter score={outfit.score} color={cfg.scoreColor} />
            </div>

            <span
              className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              {cfg.label}
            </span>

            {outfit.reason && (
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#6F7788]">{outfit.reason}</p>
            )}
          </div>

          {selected && (
            <span className="ml-1 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF4D8D]">
              <Check size={13} className="text-white" />
            </span>
          )}
        </div>

        {/* Tags */}
        {outfit.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {outfit.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] capitalize text-[#A8AFBE]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Items list */}
        <div className="mt-3 space-y-1.5">
          {outfit.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-[8px] bg-[#1A1F2B]">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <span className="flex-1 truncate text-xs text-[#A8AFBE]">{item.name}</span>
              {item.source === "suggestion" && (
                <span className="ml-auto shrink-0 rounded-full bg-[#C8A96A]/15 px-2 py-0.5 text-[9px] font-semibold text-[#C8A96A]">
                  Incoming
                </span>
              )}
            </div>
          ))}
        </div>
      </button>

      {/* Expand breakdown */}
      {selected && Object.keys(outfit).includes("score") && (
        <div className="border-t border-white/6 px-4">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex w-full items-center justify-between py-2.5 text-[12px] text-[#6F7788]"
          >
            <span>Score breakdown</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden pb-4"
              >
                {Object.entries(breakdownLabels).map(([key, label]) => {
                  const val = outfit.breakdown?.[key]
                  if (val === undefined) return null
                  return (
                    <BreakdownRow key={key} label={label} value={val} max={breakdownMax[key]} />
                  )
                })}
                {outfit.gapSuggestion && (
                  <p className="mt-2 rounded-[10px] bg-[#C8A96A]/10 px-3 py-2 text-[11px] text-[#C8A96A]">
                    💡 {outfit.gapSuggestion}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default function GenerateOutfitScreen() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const { saveOutfit } = useTimelineOutfits()
  const { items: incomingItems } = useIncomingItems()
  const { preferences, recentItemIds, signalOutfit, trackItemsUsed } = useStylePreferences()

  const outfits = useMemo(
    () => generateOutfits(date ?? "", wardrobeItems, incomingItems, undefined, { preferences, usedItemIds: recentItemIds }),
    [date, incomingItems, preferences]
  )

  const [selected, setSelected] = useState<string | null>(
    outfits.length > 0 ? outfits[0].id : null
  )

  function handleSave() {
    const outfit = outfits.find((o) => o.id === selected)
    if (!outfit || !date) return

    // Signal like for chosen outfit
    signalOutfit(outfit.tags, [], "like")
    // Signal skip for others (soft negative)
    for (const other of outfits.filter((o) => o.id !== selected)) {
      signalOutfit(other.tags, [], "skip")
    }
    // Track freshness
    trackItemsUsed(outfit.items.map((i) => i.id))

    const tl: TimelineOutfit = {
      id: outfit.id,
      date,
      name: outfit.name,
      items: outfit.items,
      confidence: outfit.confidence,
      tags: outfit.tags,
      score: outfit.score,
      reason: outfit.reason,
      createdAt: new Date().toISOString(),
    }
    saveOutfit(tl)
    navigate("/timeline")
  }

  const topOutfit = outfits.length > 0 ? outfits[0] : null

  return (
    <AppShell>
      <header className="mb-5 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate("/timeline")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#A8AFBE] transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Generate Outfit</h1>
          <p className="text-xs text-[#6F7788]">{formatDate(date ?? "")}</p>
        </div>
      </header>

      {outfits.length === 0 ? (
        <Card className="py-10 text-center">
          <Sparkles size={28} className="mx-auto mb-3 text-[#6F7788]" />
          <p className="text-sm font-medium text-[#A8AFBE]">Not enough wardrobe items yet</p>
          <p className="mt-1 text-xs text-[#6F7788]">
            Add more items to your wardrobe to generate outfit combos
          </p>
        </Card>
      ) : (
        <>
          {/* Best score banner */}
          {topOutfit && topOutfit.score >= 65 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-[14px] bg-[#4ECFA8]/10 px-3.5 py-2.5"
            >
              <Sparkles size={14} className="shrink-0 text-[#4ECFA8]" />
              <p className="text-[12px] text-[#4ECFA8]">
                Best outfit scores{" "}
                <span className="font-bold">{topOutfit.score}/100</span> —{" "}
                {topOutfit.confidence === "high" ? "excellent combination" : "solid combination"}
              </p>
            </motion.div>
          )}

          <p className="mb-4 text-[13px] text-[#6F7788]">
            {outfits.length} outfit suggestion{outfits.length !== 1 ? "s" : ""} ranked by score
            — tap to select, expand for breakdown
          </p>

          <div className="space-y-3 pb-6">
            {outfits.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                selected={selected === outfit.id}
                onSelect={() => setSelected(outfit.id)}
              />
            ))}
          </div>

          <div className="sticky bottom-[80px] pb-3">
            <button
              onClick={handleSave}
              disabled={!selected}
              className="w-full rounded-[20px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(255,77,141,0.28)] transition active:scale-[0.97] disabled:opacity-50"
            >
              Add to Timeline
            </button>
          </div>
        </>
      )}
    </AppShell>
  )
}
