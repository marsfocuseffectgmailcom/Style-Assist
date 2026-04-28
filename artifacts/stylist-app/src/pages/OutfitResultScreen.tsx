import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, Check, RefreshCw, Calendar } from "lucide-react"
import { AppShell } from "../components/AppShell"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useStylePreferences } from "../hooks/useStylePreferences"
import { extractColorsFromName } from "../lib/stylingEngine"
import { loadItemPreferences } from "../hooks/useItemPreferences"
import type { GeneratedOutfit } from "../lib/outfitGenerator"
import type { PlannedOutfitItem, TimelineOutfit } from "../lib/types"

// ─── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg:       "#0F1115",
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

// ─── Confidence labels ─────────────────────────────────────────────────────────

const confidenceConfig = {
  high:         { label: "High match",  color: T.teal,  bg: "rgba(78,207,168,0.10)",   border: "rgba(78,207,168,0.22)"   },
  safe:         { label: "Safe choice", color: T.gold,  bg: "rgba(200,169,106,0.10)",  border: "rgba(200,169,106,0.22)"  },
  experimental: { label: "Bold pick",   color: "#FF7A5C", bg: "rgba(255,122,92,0.10)", border: "rgba(255,122,92,0.22)" },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRoleLabel(item: PlannedOutfitItem, index: number): string {
  const cat = item.category.toLowerCase()
  if (cat === "outerwear")                  return "Weather layer"
  if (cat === "shoes")                      return "Finishing detail"
  if (cat === "dress")                      return "Anchor piece"
  if (index === 0)                          return "Anchor piece"
  if (cat === "bottoms" || cat === "bottom") return "Balance piece"
  return "Anchor piece"
}

function getColourLabel(item: PlannedOutfitItem): string {
  const colors = extractColorsFromName(item.name)
  const c = colors[0]
  return c && c !== "neutral" ? c.charAt(0).toUpperCase() + c.slice(1) : ""
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long",
  })
}

// ─── Item card ─────────────────────────────────────────────────────────────────

function ItemCard({ item, index }: { item: PlannedOutfitItem; index: number }) {
  const role   = getRoleLabel(item, index)
  const colour = getColourLabel(item)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex w-[148px] shrink-0 flex-col overflow-hidden rounded-[22px] border"
      style={{ borderColor: T.border, backgroundColor: T.card }}
    >
      {/* Photo */}
      <div className="relative h-[140px] w-full overflow-hidden bg-[#11151C]">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sparkles size={24} style={{ color: T.muted }} />
          </div>
        )}

        {/* Incoming badge */}
        {item.source === "suggestion" && (
          <div
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ backgroundColor: "rgba(200,169,106,0.20)", color: T.gold }}
          >
            Incoming
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: T.muted }}>
            {item.category}
          </p>
          <p className="text-[12px] font-medium leading-snug" style={{ color: T.text }}>
            {item.name.length > 28 ? item.name.slice(0, 27) + "…" : item.name}
          </p>
          {colour && (
            <p className="mt-0.5 text-[11px] capitalize" style={{ color: T.sub }}>{colour}</p>
          )}
        </div>

        {/* Role label */}
        <div className="mt-2">
          <span
            className="inline-block rounded-full px-2 py-[3px] text-[10px] font-semibold"
            style={{ backgroundColor: "rgba(255,77,141,0.10)", color: T.pink, border: "1px solid rgba(255,77,141,0.20)" }}
          >
            {role}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Rotation note ─────────────────────────────────────────────────────────────

const ROTATION_NOTES: Record<string, string> = {
  "go-to":      "This is one of your natural anchor pieces.",
  "sometimes":  "This fits well here because it supports the outfit without taking over.",
  "not-lately": "This is a good moment to bring this back into rotation.",
}

function RotationNote({ item }: { item: PlannedOutfitItem }) {
  const prefs = loadItemPreferences()
  const reach = prefs[String(item.id)]?.reach
  if (!reach) return null
  const note = ROTATION_NOTES[reach]
  if (!note) return null

  const isGoTo    = reach === "go-to"
  const isBack    = reach === "not-lately"
  const dotColor  = isGoTo ? T.teal : isBack ? T.gold : T.sub

  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <div className="min-w-0">
        <span className="text-[12px] font-medium" style={{ color: T.sub }}>
          {item.name}
        </span>
        <span className="text-[12px]" style={{ color: T.muted }}> — {note}</span>
      </div>
    </div>
  )
}

// ─── Screen ────────────────────────────────────────────────────────────────────

type LocationState = {
  outfit: GeneratedOutfit
  date:   string
}

export default function OutfitResultScreen() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const state     = location.state as LocationState | null

  const { saveOutfit }                               = useTimelineOutfits()
  const { signalOutfit, trackItemsUsed }             = useStylePreferences()

  // If navigated here without state (direct URL), fall back to timeline
  if (!state?.outfit) {
    navigate("/timeline", { replace: true })
    return null
  }

  const { outfit, date } = state
  const cfg              = confidenceConfig[outfit.confidence]
  const itemsWithPrefs   = outfit.items.filter(
    (item) => !!loadItemPreferences()[String(item.id)]?.reach
  )

  // ── Explanation content ─────────────────────────────────────────────────────

  // "Why this works" — main paragraph from reason + supporting tips
  const mainExplanation = outfit.reason

  // Supporting tips (first 2)
  const supportingTips  = outfit.tips.slice(0, 2)

  // "Style tip" — third tip or upgrade
  const styleTip        = outfit.tips[2] ?? outfit.upgrade

  // ── Save handler ────────────────────────────────────────────────────────────

  function handleSave() {
    signalOutfit(outfit.tags, [], "like")
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
    navigate("/timeline")
  }

  function handleTryAnother() {
    navigate(-1)
  }

  function handlePlanLater() {
    navigate("/plan-ahead")
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      {/* ── Header ── */}
      <header className="mb-5 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/10"
          style={{ color: T.sub }}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          {date && (
            <p className="mb-0.5 text-[11px]" style={{ color: T.muted }}>{formatDate(date)}</p>
          )}
          <h1 className="text-[22px] font-bold leading-tight tracking-[-0.4px]" style={{ color: T.text }}>
            Your outfit is ready
          </h1>
          <p className="mt-0.5 text-[12px]" style={{ color: T.muted }}>
            Built from your wardrobe, styled for the moment.
          </p>
        </div>
      </header>

      {/* ── Confidence + outfit name ── */}
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          {cfg.label}
        </span>
        <span className="text-[13px] font-semibold" style={{ color: T.text }}>{outfit.name}</span>
        <span className="ml-auto text-[13px] font-bold tabular-nums" style={{ color: cfg.color }}>
          {outfit.score}
          <span className="text-[11px] font-normal" style={{ color: T.muted }}>/100</span>
        </span>
      </div>

      {/* ── Item cards (horizontal scroll) ── */}
      <div className="-mx-4 mb-5 flex gap-3 overflow-x-auto px-4 pb-1">
        {outfit.items.map((item, i) => (
          <ItemCard key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* ── Why this works ── */}
      <section
        className="mb-4 overflow-hidden rounded-[22px] border"
        style={{ borderColor: T.border, backgroundColor: T.elevated }}
      >
        <div className="border-b px-4 pt-4 pb-3" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-2">
            <Sparkles size={13} style={{ color: T.pink }} />
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: T.pink }}>
              Why this works
            </p>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          {/* Main reason */}
          {mainExplanation && (
            <p className="text-[13px] leading-[1.7]" style={{ color: T.sub }}>
              {mainExplanation}
            </p>
          )}

          {/* Supporting tips */}
          {supportingTips.length > 0 && (
            <ul className="space-y-2 pt-1">
              {supportingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `${T.pink}80` }}
                  />
                  <span className="text-[13px] leading-[1.65]" style={{ color: "#D4C9B8" }}>
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Style tip ── */}
      {styleTip && (
        <section
          className="mb-4 overflow-hidden rounded-[22px] border"
          style={{ borderColor: "rgba(200,169,106,0.20)", backgroundColor: "rgba(200,169,106,0.05)" }}
        >
          <div className="border-b px-4 pt-4 pb-3" style={{ borderColor: "rgba(200,169,106,0.15)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: T.gold }}>
              Style tip
            </p>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[13px] leading-[1.65]" style={{ color: "#D4C9B8" }}>
              {styleTip}
            </p>
          </div>
        </section>
      )}

      {/* ── Rotation intelligence ── */}
      {itemsWithPrefs.length > 0 && (
        <section
          className="mb-5 overflow-hidden rounded-[22px] border"
          style={{ borderColor: T.border, backgroundColor: T.elevated }}
        >
          <div className="border-b px-4 pt-4 pb-3" style={{ borderColor: T.border }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: T.sub }}>
              Your wardrobe
            </p>
          </div>
          <div className="space-y-3 px-4 py-4">
            {outfit.items.map((item) => (
              <RotationNote key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* ── Upgrade note ── */}
      {outfit.upgrade && !styleTip && (
        <div
          className="mb-5 flex items-start gap-3 rounded-[18px] px-4 py-3.5"
          style={{ backgroundColor: "rgba(255,77,141,0.06)", border: "1px solid rgba(255,77,141,0.14)" }}
        >
          <Sparkles size={13} className="mt-0.5 shrink-0" style={{ color: T.pink }} />
          <p className="text-[12px] leading-relaxed" style={{ color: "#F6A8C4" }}>
            {outfit.upgrade}
          </p>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="pb-8 pt-2">
        {/* Primary — Save outfit */}
        <button
          onClick={handleSave}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[20px] py-4 text-[15px] font-semibold text-white transition active:scale-[0.97]"
          style={{
            background: `linear-gradient(to right, ${T.pink}, ${T.coral})`,
            boxShadow: "0 4px 20px rgba(255,77,141,0.28)",
          }}
        >
          <Check size={16} />
          Save outfit
        </button>

        {/* Secondary — Try another look */}
        <button
          onClick={handleTryAnother}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[20px] border py-4 text-[14px] font-semibold transition active:scale-[0.97]"
          style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.04)", color: T.sub }}
        >
          <RefreshCw size={15} />
          Try another look
        </button>

        {/* Tertiary — Plan for later */}
        <button
          onClick={handlePlanLater}
          className="flex w-full items-center justify-center gap-2 py-3 text-[13px] font-medium transition active:opacity-70"
          style={{ color: T.muted }}
        >
          <Calendar size={14} />
          Plan for later
        </button>
      </div>
    </AppShell>
  )
}
