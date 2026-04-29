import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { useStylePreferences } from "../hooks/useStylePreferences"
import { wardrobeItems } from "../lib/mockData"
import { generateOutfits } from "../lib/outfitGenerator"
import type { GeneratedOutfit } from "../lib/outfitGenerator"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

// ─── Confidence config ────────────────────────────────────────────────────────

const confidenceConfig = {
  high: {
    label: "High match",
    color: "#5F8F7F",
    bg: "rgba(95,143,127,0.10)",
    border: "rgba(95,143,127,0.22)",
    ring: "#5F8F7F",
  },
  safe: {
    label: "Safe choice",
    color: "#C8A96A",
    bg: "rgba(200,169,106,0.10)",
    border: "rgba(200,169,106,0.22)",
    ring: "#C8A96A",
  },
  experimental: {
    label: "Bold pick",
    color: "#7FA9A3",
    bg: "rgba(127,169,163,0.10)",
    border: "rgba(127,169,163,0.22)",
    ring: "#7FA9A3",
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
}

const breakdownMax: Record<string, number> = {
  eventMatch: 30,
  colourHarmony: 25,
  styleConsistency: 20,
  seasonSuitability: 10,
  userPreference: 10,
  freshness: 5,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreMeter({ score, color }: { score: number; color: string }) {
  const size = 52
  const sw = 4
  const r = (size - sw) / 2
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

function OutfitCard({
  outfit,
  selected,
  onSelect,
}: {
  outfit: GeneratedOutfit
  selected: boolean
  onSelect: () => void
}) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const cfg = confidenceConfig[outfit.confidence]
  const shown = outfit.items.slice(0, 4)

  return (
    <motion.div
      layout
      className={`w-full overflow-hidden rounded-[24px] border text-left transition-colors ${
        selected ? "border-[#3F6F73]/40 bg-[#3F6F73]/5" : "border-white/8 bg-[#2A3645]"
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
              <ScoreMeter score={outfit.score} color={cfg.ring} />
            </div>

            {/* Reason — always visible */}
            {outfit.reason && (
              <p className="mt-2 text-[12px] leading-relaxed text-[#6B8490]">{outfit.reason}</p>
            )}
          </div>

          {/* Check */}
          {selected && (
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3F6F73]">
              <Check size={13} className="text-white" />
            </span>
          )}
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
          {outfit.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-[8px] bg-[#243140]">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <span className="flex-1 truncate text-xs text-[#AABBC0]">{item.name}</span>
              {item.source === "suggestion" && (
                <span className="ml-auto shrink-0 rounded-full bg-[#C8A96A]/15 px-2 py-0.5 text-[9px] font-semibold text-[#C8A96A]">
                  Incoming
                </span>
              )}
            </div>
          ))}
        </div>
      </button>

      {/* ── Expanded insight panel (only when selected) ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
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
                      <span
                        className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8A96A]/60"
                      />
                      <span className="text-[13px] leading-relaxed text-[#D0D8D5]">{tip}</span>
                    </li>
                  ))}
                </ul>

                {/* Upgrade suggestion */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function GenerateOutfitScreen() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const { items: incomingItems } = useIncomingItems()
  const { preferences, recentItemIds } = useStylePreferences()

  const outfits = useMemo(
    () =>
      generateOutfits(date ?? "", wardrobeItems, incomingItems, undefined, {
        preferences,
        usedItemIds: recentItemIds,
      }),
    [date, incomingItems, preferences]
  )

  const [selected, setSelected] = useState<string | null>(
    outfits.length > 0 ? outfits[0].id : null
  )

  function handleViewResult() {
    const outfit = outfits.find((o) => o.id === selected)
    if (!outfit || !date) return
    navigate("/timeline/outfit-result", { state: { outfit, date } })
  }

  const topOutfit = outfits[0]

  return (
    <AppShell>
      <header className="mb-5 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate("/timeline")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#AABBC0] transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Generate Outfit</h1>
          <p className="text-xs text-[#6B8490]">{formatDate(date ?? "")}</p>
        </div>
      </header>

      {outfits.length === 0 ? (
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
          {topOutfit && topOutfit.score >= 65 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-[14px] bg-[#5F8F7F]/8 px-3.5 py-2.5"
            >
              <Sparkles size={14} className="shrink-0 text-[#5F8F7F]" />
              <p className="text-[12px] text-[#5F8F7F]">
                Best outfit scores{" "}
                <span className="font-bold">{topOutfit.score}/100</span> — tap a card to see
                full styling notes
              </p>
            </motion.div>
          )}

          <p className="mb-4 text-[13px] text-[#6B8490]">
            {outfits.length} suggestion{outfits.length !== 1 ? "s" : ""} ranked by score —
            select one to add to your plan
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
              onClick={handleViewResult}
              disabled={!selected}
              className="flex h-14 w-full items-center justify-center rounded-[18px] bg-[#3F6F73] text-base font-bold tracking-[-0.01em] text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] transition-[transform] duration-[160ms] active:scale-[0.97] disabled:opacity-45"
            >
              View outfit →
            </button>
          </div>
        </>
      )}
    </AppShell>
  )
}
