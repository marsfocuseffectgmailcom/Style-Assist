import { motion, AnimatePresence } from "framer-motion"
import { X, Camera } from "lucide-react"
import {
  REACH_OPTIONS, FEEL_OPTIONS, REACH_COLOR,
  useItemPreferences,
} from "../hooks/useItemPreferences"

import type { ReachPreference, FeelPreference } from "../hooks/useItemPreferences"

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

// ─── Sheet ────────────────────────────────────────────────────────────────────

export function ItemPreferenceSheet({ item, onClose }: Props) {
  const { getPref, setPref, toggleFeel } = useItemPreferences()
  const open = item !== null
  const pref = item ? getPref(item.id) : {}

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
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.9 }}
            className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 overflow-hidden rounded-t-[28px]"
            style={{ backgroundColor: "#2A3645", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none" }}
          >
            {/* ── Fixed header — always visible regardless of scroll ── */}
            <div className="px-5 pt-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Drag handle */}
              <div className="mb-4 flex justify-center">
                <div className="h-[3px] w-10 rounded-full bg-white/20" />
              </div>

              {/* Item summary + close button */}
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
                  <p className="truncate text-[15px] font-semibold text-[#F2F4F5]">{item.name}</p>
                  <p className="text-[12px] text-[#6B8490]">{item.category}</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/6 text-[#AABBC0] transition hover:bg-white/12"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ── Scrollable preference options ── */}
            <div className="max-h-[65vh] overflow-y-auto px-5 pb-10 pt-5">

              {/* ─── Section 1: Reach preference ───────────────────────────── */}
              <div className="mb-6">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#5E7580]">
                  How often do you reach for this?
                </p>

                <div className="mt-3 space-y-2">
                  {REACH_OPTIONS.map((opt) => {
                    const active = pref.reach === opt.value
                    const accent = REACH_COLOR[opt.value]
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleReach(opt.value)}
                        aria-pressed={active}
                        className="flex w-full items-center gap-3.5 rounded-[18px] border px-4 py-3.5 text-left transition active:scale-[0.98]"
                        style={{
                          borderColor: active ? `${accent}50` : "rgba(255,255,255,0.07)",
                          backgroundColor: active ? `${accent}10` : "rgba(255,255,255,0.03)",
                        }}
                      >
                        {/* Selection indicator */}
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
                          style={{
                            borderColor: active ? accent : "rgba(255,255,255,0.20)",
                            backgroundColor: active ? accent : "transparent",
                          }}
                        >
                          {active && (
                            <div className="h-2 w-2 rounded-full bg-[#1F2A37]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[14px] font-semibold transition"
                            style={{ color: active ? accent : "#F2F4F5" }}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[12px] text-[#6B8490]">{opt.sub}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ─── Section 2: Feel preference (optional) ─────────────────── */}
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#5E7580]">
                  How does this feel on you?
                </p>
                <p className="mb-3 text-[12px] text-[#4D6A78]">Optional — helps us style it for you</p>

                <div className="flex flex-wrap gap-2">
                  {FEEL_OPTIONS.map((opt) => {
                    const active = pref.feel === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleFeel(opt.value)}
                        aria-pressed={active}
                        className="flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition active:scale-[0.96]"
                        style={{
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
                    className="mt-5 rounded-[16px] px-4 py-3"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-[12px] leading-relaxed text-[#6B8490]">
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
