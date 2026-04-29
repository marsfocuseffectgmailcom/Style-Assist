import { motion, AnimatePresence } from "framer-motion"
import { X, Camera } from "lucide-react"
import { useEffect, useRef } from "react"
import {
  REACH_OPTIONS, FEEL_OPTIONS, REACH_COLOR,
  useItemPreferences,
} from "../hooks/useItemPreferences"
import type { ReachPreference, FeelPreference } from "../hooks/useItemPreferences"
import { useWardrobePanel } from "../contexts/WardrobePanelContext"

// ─── Types ────────────────────────────────────────────────────────────────────

export type SheetItem = {
  id: string | number
  name: string
  category: string
  image: string
}

type Props = {
  item: SheetItem | null
  onClose: () => void
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ItemPreferenceSheet({ item, onClose }: Props) {
  const { getPref, setPref, toggleFeel } = useItemPreferences()
  const { setPanelOpen } = useWardrobePanel()
  const open = item !== null
  const pref = item ? getPref(item.id) : {}
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sync panel-open state into context so BottomNav can react
  useEffect(() => {
    setPanelOpen(open)
  }, [open, setPanelOpen])

  // Prevent background scroll while panel is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  function handleReach(value: ReachPreference) {
    if (!item) return
    setPref(item.id, { reach: value })
  }

  function handleFeel(value: FeelPreference) {
    if (!item) return
    toggleFeel(item.id, value)
  }

  return (
    <AnimatePresence>
      {open && item && (
        <>
          {/* ── Backdrop: blur + dim ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(10,16,24,0.55)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
            aria-hidden
          />

          {/* ── Side panel ── */}
          <motion.div
            key="panel"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.35 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80 || info.velocity.x > 400) onClose()
            }}
            initial={{ x: "100%", scale: 0.98 }}
            animate={{ x: 0, scale: 1 }}
            exit={{ x: "100%", scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed z-50 flex flex-col overflow-hidden"
            style={{
              top: 16,
              right: 12,
              width: "82vw",
              maxWidth: 380,
              height: "calc(100vh - 32px)",
              borderRadius: 28,
              backgroundColor: "#2A3645",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
              touchAction: "pan-y",
            }}
          >
            {/* ── Fixed header ── */}
            <div
              className="shrink-0 px-5 pb-4 pt-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Top row: close button left, drag hint right */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/6 text-[#A8B0B8] transition-[background-color] duration-[160ms] hover:bg-white/12 active:bg-white/16"
                  aria-label="Close panel"
                >
                  <X size={16} />
                </button>
                {/* Subtle drag-hint bar */}
                <div className="h-[3px] w-8 rounded-full bg-white/15" />
              </div>

              {/* Item thumbnail + name */}
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[16px] bg-[#243140]">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Camera size={18} className="text-[#2E4055]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold leading-[20px] text-[#F5F5F5]">
                    {item.name}
                  </p>
                  <p className="text-[12px] leading-[16px] text-[#6B8490]">{item.category}</p>
                </div>
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 pt-5"
              style={{ paddingBottom: "calc(32px + env(safe-area-inset-bottom))" }}
            >
              {/* ─── Section 1: Reach preference ─────────────────────────── */}
              <div className="mb-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#5E7580]">
                  How often do you reach for this?
                </p>

                <div className="space-y-2">
                  {REACH_OPTIONS.map((opt) => {
                    const active = pref.reach === opt.value
                    const accent = REACH_COLOR[opt.value]
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleReach(opt.value)}
                        aria-pressed={active}
                        className="flex w-full items-center gap-3.5 rounded-[18px] border px-4 text-left transition-[background-color,border-color] duration-[160ms] active:scale-[0.98]"
                        style={{
                          minHeight: 56,
                          borderColor: active ? `${accent}50` : "rgba(255,255,255,0.07)",
                          backgroundColor: active ? `${accent}10` : "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-[border-color,background-color] duration-[160ms]"
                          style={{
                            borderColor: active ? accent : "rgba(255,255,255,0.20)",
                            backgroundColor: active ? accent : "transparent",
                          }}
                        >
                          {active && <div className="h-2 w-2 rounded-full bg-[#1F2A37]" />}
                        </div>

                        <div className="min-w-0 flex-1 py-3">
                          <p
                            className="text-[14px] font-semibold leading-[18px] transition-colors duration-[160ms]"
                            style={{ color: active ? accent : "#F2F4F5" }}
                          >
                            {opt.label}
                          </p>
                          <p className="mt-0.5 text-[12px] leading-[16px] text-[#6B8490]">{opt.sub}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ─── Section 2: Feel preference ───────────────────────────── */}
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#5E7580]">
                  How does this feel on you?
                </p>
                <p className="mb-3 text-[12px] leading-[16px] text-[#4D6A78]">
                  Optional — helps us style it for you
                </p>

                <div className="flex flex-wrap gap-2">
                  {FEEL_OPTIONS.map((opt) => {
                    const active = pref.feel === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleFeel(opt.value)}
                        aria-pressed={active}
                        className="flex items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-[background-color,border-color,color] duration-[160ms] active:scale-[0.96]"
                        style={{
                          minHeight: 44,
                          borderColor: active ? "rgba(63,111,115,0.45)" : "rgba(255,255,255,0.08)",
                          backgroundColor: active ? "rgba(63,111,115,0.10)" : "rgba(255,255,255,0.04)",
                          color: active ? "#3F6F73" : "#AABBC0",
                        }}
                      >
                        <span className="text-[11px] opacity-70">{opt.emoji}</span>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>

                {/* Confirmation note */}
                {pref.reach && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-5 rounded-[16px] px-4 py-4"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p className="text-[12px] leading-[18px] text-[#6B8490]">
                      {pref.reach === "go-to" &&
                        "We'll factor this in when building outfits — pieces you reach for often make great anchors."}
                      {pref.reach === "sometimes" &&
                        "We'll suggest this when it's the right fit for the occasion, colour palette, or weather."}
                      {pref.reach === "not-lately" &&
                        "We'll occasionally bring this back when it works well — and explain exactly why it belongs in the outfit."}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
