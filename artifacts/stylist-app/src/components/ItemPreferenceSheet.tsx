import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Trash2, EyeOff, Check } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  REACH_OPTIONS, FEEL_OPTIONS, REACH_COLOR,
  useItemPreferences,
} from "../hooks/useItemPreferences"
import type { ReachPreference, FeelPreference } from "../hooks/useItemPreferences"
import { useWardrobePanel } from "../contexts/WardrobePanelContext"
import { useWardrobeRemoval } from "../hooks/useWardrobeRemoval"

// ─── Types ────────────────────────────────────────────────────────────────────

export type SheetItem = {
  id: string | number
  name: string
  category: string
  image: string
  isCapture?: boolean
}

type Props = {
  item: SheetItem | null
  onClose: () => void
  onPermanentDelete?: (id: string | number) => void
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ItemPreferenceSheet({ item, onClose, onPermanentDelete }: Props) {
  const { getPref, setPref, toggleFeel } = useItemPreferences()
  const { softRemove, permanentRemove } = useWardrobeRemoval()
  const { setPanelOpen } = useWardrobePanel()
  const open = item !== null
  const pref = item ? getPref(item.id) : {}
  const scrollRef = useRef<HTMLDivElement>(null)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [removalDone, setRemovalDone] = useState<"soft" | "permanent" | null>(null)

  // Reset confirm state when a different item opens
  useEffect(() => {
    setConfirmDelete(false)
    setRemovalDone(null)
  }, [item?.id])

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

  function handleSoftRemove() {
    if (!item) return
    softRemove({ id: item.id, name: item.name, category: item.category, image: item.image })
    setRemovalDone("soft")
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  function handlePermanentDelete() {
    if (!item) return
    permanentRemove({ id: item.id, name: item.name, category: item.category, image: item.image })
    if (item.isCapture) onPermanentDelete?.(item.id)
    setRemovalDone("permanent")
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <AnimatePresence>
      {open && item && (
        <>
          {/* ── Backdrop ── */}
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
              bottom: 16,
              right: 12,
              width: "82vw",
              maxWidth: 380,
              height: "calc(100dvh - 32px)",
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
              {/* Top row: close left, drag hint right */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={onClose}
                  aria-label="Close panel"
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-[opacity] duration-[160ms] active:opacity-70"
                  style={{
                    background: [
                      "repeating-linear-gradient(45deg,  rgba(255,255,255,0.018) 0, rgba(255,255,255,0.018) 1px, transparent 0, transparent 4px)",
                      "repeating-linear-gradient(-45deg, rgba(255,255,255,0.018) 0, rgba(255,255,255,0.018) 1px, transparent 0, transparent 4px)",
                      "#1F2A37",
                    ].join(", "),
                    boxShadow: [
                      "inset 0 1px 3px rgba(0,0,0,0.45)",
                      "inset 0 -1px 1px rgba(255,255,255,0.05)",
                      "0 1px 3px rgba(0,0,0,0.30)",
                    ].join(", "),
                    color: "#E8DFC8",
                  }}
                >
                  <X size={16} strokeWidth={2.25} />
                </button>
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
              style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}
            >

              {/* ─── Reach preference ──────────────────────────────────── */}
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

              {/* ─── Feel preference ───────────────────────────────────── */}
              <div className="mb-8">
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
                      {pref.reach === "go-to" && "We'll factor this in when building outfits — pieces you reach for often make great anchors."}
                      {pref.reach === "sometimes" && "We'll suggest this when it's the right fit for the occasion, colour palette, or weather."}
                      {pref.reach === "not-lately" && "We'll occasionally bring this back when it works well — and explain exactly why it belongs in the outfit."}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* ─── Removal zone ──────────────────────────────────────── */}
              <div
                className="rounded-[20px] p-4"
                style={{ border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}
              >
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#5E7580]">
                  Wardrobe
                </p>

                <AnimatePresence mode="wait">
                  {removalDone ? (
                    /* ── Confirmation message ── */
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3F6F73]/15">
                        <Check size={15} className="text-[#3F6F73]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#F5F5F5]">
                          {removalDone === "permanent" ? "Item deleted." : "Removed from wardrobe."}
                        </p>
                        {removalDone === "soft" && (
                          <p className="mt-0.5 text-[12px] leading-[16px] text-[#6B8490]">
                            Won't appear in outfit suggestions. You can restore it from Profile.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : confirmDelete ? (
                    /* ── Permanent delete confirmation ── */
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="mb-3 text-[13px] leading-[18px] text-[#A8B0B8]">
                        This will remove the item completely.{" "}
                        <span className="text-[#F5F5F5]">Old saved outfits won't be affected.</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex h-11 flex-1 items-center justify-center rounded-[14px] border border-white/10 text-[13px] font-semibold text-[#A8B0B8]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePermanentDelete}
                          className="flex h-11 flex-1 items-center justify-center rounded-[14px] text-[13px] font-bold text-white"
                          style={{ backgroundColor: "rgba(180,60,60,0.75)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Default removal options ── */
                    <motion.div
                      key="options"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      {/* Remove from wardrobe (soft) */}
                      <button
                        onClick={handleSoftRemove}
                        className="flex h-[52px] w-full items-center gap-3 rounded-[14px] border border-white/8 bg-white/3 px-4 text-left text-[14px] font-semibold text-[#F5F5F5]"
                      >
                        <EyeOff size={16} className="shrink-0 text-[#A8B0B8]" />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate">Remove from wardrobe</span>
                          <span className="block text-[11px] font-normal text-[#5E7580]">
                            Won't appear in outfit suggestions
                          </span>
                        </div>
                      </button>

                      {/* Delete permanently */}
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex h-[52px] w-full items-center gap-3 rounded-[14px] border px-4 text-left text-[14px] font-semibold"
                        style={{
                          borderColor: "rgba(180,60,60,0.20)",
                          backgroundColor: "rgba(180,60,60,0.06)",
                          color: "rgba(230,100,100,0.90)",
                        }}
                      >
                        <Trash2 size={16} className="shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate">Delete permanently</span>
                          <span
                            className="block text-[11px] font-normal"
                            style={{ color: "rgba(200,80,80,0.65)" }}
                          >
                            Requires confirmation
                          </span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
