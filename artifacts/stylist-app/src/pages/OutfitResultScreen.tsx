import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Sparkles, Check, RefreshCw, Calendar, X } from "lucide-react"
import { AppShell } from "../components/AppShell"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useStylePreferences } from "../hooks/useStylePreferences"
import { extractColorsFromName } from "../lib/stylingEngine"
import { loadItemPreferences } from "../hooks/useItemPreferences"
import type { GeneratedOutfit } from "../lib/outfitGenerator"
import type { PlannedOutfitItem, TimelineOutfit } from "../lib/types"

// ─── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg:       "#1F2A37",
  elevated: "#2A3645",
  card:     "#243140",
  pink:     "#3F6F73",
  coral:    "#7FA9A3",
  gold:     "#C8A96A",
  teal:     "#5F8F7F",
  text:     "#F2F4F5",
  sub:      "#AABBC0",
  muted:    "#6B8490",
  border:   "rgba(255,255,255,0.08)",
}

// ─── Confidence labels ─────────────────────────────────────────────────────────

const confidenceConfig = {
  high:         { label: "High match",  color: T.teal,  bg: "rgba(95,143,127,0.10)",   border: "rgba(95,143,127,0.22)"   },
  safe:         { label: "Safe choice", color: T.gold,  bg: "rgba(200,169,106,0.10)",  border: "rgba(200,169,106,0.22)"  },
  experimental: { label: "Bold pick",   color: "#7FA9A3", bg: "rgba(127,169,163,0.10)", border: "rgba(127,169,163,0.22)" },
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
      <div className="relative h-[140px] w-full overflow-hidden bg-[#1C2A37]">
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
            style={{ backgroundColor: "rgba(63,111,115,0.10)", color: T.pink, border: "1px solid rgba(63,111,115,0.20)" }}
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

const ROTATION_NOTES_TONIGHT: Record<string, string> = {
  "go-to":      "This is one of your natural anchor pieces.",
  "sometimes":  "This fits well here without taking over the outfit.",
  "not-lately": "This is a good moment to bring this back in — it fits naturally here.",
}

function RotationNote({ item, tonight = false }: { item: PlannedOutfitItem; tonight?: boolean }) {
  const prefs = loadItemPreferences()
  const reach = prefs[String(item.id)]?.reach
  if (!reach) return null
  const notes = tonight ? ROTATION_NOTES_TONIGHT : ROTATION_NOTES
  const note  = notes[reach]
  if (!note) return null

  const isGoTo   = reach === "go-to"
  const isBack   = reach === "not-lately"
  const dotColor = isGoTo ? T.teal : isBack ? T.gold : T.sub

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

// ─── Plan later sheet ──────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function PlanLaterSheet({
  open,
  value,
  onChange,
  onSave,
  onClose,
}: {
  open:     boolean
  value:    string
  onChange: (v: string) => void
  onSave:   () => void
  onClose:  () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.60)" }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-[28px]"
            style={{ backgroundColor: T.elevated, borderTop: `1px solid ${T.border}` }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-2">
              <div>
                <h2 className="text-[17px] font-bold" style={{ color: T.text }}>Plan for later</h2>
                <p className="mt-0.5 text-[12px]" style={{ color: T.muted }}>
                  Choose a date to save this outfit.
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 transition hover:bg-white/12"
                style={{ color: T.sub }}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Date input */}
            <div className="px-5 pb-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: T.muted }}>
                Date
              </label>
              <input
                type="date"
                value={value}
                min={todayISO()}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-[16px] border px-4 py-3.5 text-[14px] font-medium outline-none"
                style={{
                  backgroundColor: T.card,
                  borderColor: "rgba(255,255,255,0.10)",
                  color: T.text,
                  colorScheme: "dark",
                }}
              />
            </div>

            {/* Save button */}
            <div className="px-5 pb-8">
              <button
                onClick={onSave}
                disabled={!value}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#3F6F73] text-base font-bold text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] disabled:opacity-45"
              >
                <Check size={16} />
                Save to this date
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Screen ────────────────────────────────────────────────────────────────────

type LocationState = {
  outfit: GeneratedOutfit
  date:   string
  mode?:  "tonight"
}

export default function OutfitResultScreen() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const state     = location.state as LocationState | null

  const { saveOutfit }                               = useTimelineOutfits()
  const { signalOutfit, trackItemsUsed }             = useStylePreferences()
  const [planSheetOpen, setPlanSheetOpen]            = useState(false)
  const [planDate, setPlanDate]                      = useState(() => todayISO())
  const [saved, setSaved]                            = useState(false)

  // If navigated here without state (direct URL), fall back to timeline
  if (!state?.outfit) {
    navigate("/timeline", { replace: true })
    return null
  }

  const { outfit, date, mode } = state
  const isTonight              = mode === "tonight"
  const cfg                    = confidenceConfig[outfit.confidence]
  const itemsWithPrefs         = outfit.items.filter(
    (item) => !!loadItemPreferences()[String(item.id)]?.reach
  )

  // ── Explanation content ─────────────────────────────────────────────────────

  // "Why this works" — main paragraph from reason + supporting tips
  const mainExplanation = outfit.reason

  // Tonight mode: keep explanation concise — max 1 supporting tip
  const supportingTips  = outfit.tips.slice(0, isTonight ? 1 : 2)

  // "Style tip" — third tip or upgrade (tonight: skip if explanation already covers it)
  const styleTip        = isTonight
    ? (outfit.tips[1] ?? outfit.upgrade)
    : (outfit.tips[2] ?? outfit.upgrade)

  // ── Save handler ────────────────────────────────────────────────────────────

  function handleSave() {
    if (saved) return
    if ("vibrate" in navigator) navigator.vibrate(12)
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
    setSaved(true)
    setTimeout(() => navigate("/timeline"), 900)
  }

  function handleTryAnother() {
    navigate(-1)
  }

  function handlePlanLater() {
    setPlanSheetOpen(true)
  }

  function handlePlanSave() {
    if (!planDate) return
    signalOutfit(outfit.tags, [], "like")
    trackItemsUsed(outfit.items.map((i) => i.id))
    const tl: TimelineOutfit = {
      id:         `${outfit.id}-${planDate}`,
      date:       planDate,
      name:       outfit.name,
      items:      outfit.items,
      confidence: outfit.confidence,
      tags:       outfit.tags,
      score:      outfit.score,
      reason:     outfit.reason,
      createdAt:  new Date().toISOString(),
    }
    saveOutfit(tl)
    setPlanSheetOpen(false)
    navigate("/timeline")
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
            {isTonight ? "Ready for tonight" : "Your outfit is ready"}
          </h1>
          <p className="mt-0.5 text-[12px]" style={{ color: T.muted }}>
            {isTonight
              ? "This will work — no overthinking needed."
              : "Ready from what you own."}
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
                  <span className="text-[13px] leading-[1.65]" style={{ color: "#D0D8D5" }}>
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
            <p className="text-[13px] leading-[1.65]" style={{ color: "#D0D8D5" }}>
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
              <RotationNote key={item.id} item={item} tonight={isTonight} />
            ))}
          </div>
        </section>
      )}

      {/* ── Upgrade note ── */}
      {outfit.upgrade && !styleTip && (
        <div
          className="mb-5 flex items-start gap-3 rounded-[18px] px-4 py-3.5"
          style={{ backgroundColor: "rgba(63,111,115,0.06)", border: "1px solid rgba(63,111,115,0.14)" }}
        >
          <Sparkles size={13} className="mt-0.5 shrink-0" style={{ color: T.pink }} />
          <p className="text-[12px] leading-relaxed" style={{ color: "#A8C5C2" }}>
            {outfit.upgrade}
          </p>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="pb-8 pt-2">
        {/* Primary */}
        <motion.button
          onClick={handleSave}
          disabled={saved}
          animate={saved ? { scale: 0.96 } : { scale: 1 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="mb-3 relative flex h-14 w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#3F6F73] text-base font-bold text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] disabled:opacity-75"
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
                className="flex items-center gap-2"
              >
                <Check size={16} />
                {isTonight ? "Wear this" : "Save to Timeline"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Secondary */}
        <button
          onClick={handleTryAnother}
          className="mb-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-[18px] border text-[15px] font-semibold"
          style={{ borderColor: "rgba(168,176,184,0.28)", backgroundColor: "rgba(255,255,255,0.03)", color: T.sub }}
        >
          <RefreshCw size={15} />
          {isTonight ? "Try another option" : "Try another look"}
        </button>

        {/* Tertiary */}
        <button
          onClick={handlePlanLater}
          className="flex w-full items-center justify-center gap-2 py-3 text-[13px] font-medium"
          style={{ color: T.muted }}
        >
          <Calendar size={14} />
          {isTonight ? "Save for later" : "Plan for later"}
        </button>
      </div>

      {/* ── Plan for later sheet ── */}
      <PlanLaterSheet
        open={planSheetOpen}
        value={planDate}
        onChange={setPlanDate}
        onSave={handlePlanSave}
        onClose={() => setPlanSheetOpen(false)}
      />
    </AppShell>
  )
}
