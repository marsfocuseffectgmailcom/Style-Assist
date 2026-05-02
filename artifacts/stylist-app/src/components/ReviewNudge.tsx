import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X } from "lucide-react"

const T = {
  card:   "#243140",
  teal:   "#3F6F73",
  coral:  "#7FA9A3",
  gold:   "#C8A96A",
  text:   "#F2F4F5",
  sub:    "#AABBC0",
  muted:  "#6B8490",
}

const REVIEW_DONE_KEY  = "drape-review-done"
const WEAR_COUNT_KEY   = "drape-wear-count"
const TRIGGER_AFTER    = 3

export function recordWear() {
  const count = parseInt(localStorage.getItem(WEAR_COUNT_KEY) ?? "0", 10) + 1
  localStorage.setItem(WEAR_COUNT_KEY, String(count))
  return count
}

export function shouldShowReview(): boolean {
  if (localStorage.getItem(REVIEW_DONE_KEY) === "true") return false
  const count = parseInt(localStorage.getItem(WEAR_COUNT_KEY) ?? "0", 10)
  return count >= TRIGGER_AFTER
}

interface Props {
  open:    boolean
  onClose: () => void
}

export function ReviewNudge({ open, onClose }: Props) {
  const [hovered, setHovered]   = useState(0)
  const [selected, setSelected] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  function handleStar(n: number) {
    setSelected(n)
  }

  function handleSubmit() {
    localStorage.setItem(REVIEW_DONE_KEY, "true")
    setSubmitted(true)
    setTimeout(onClose, 1800)
  }

  function handleDismiss() {
    localStorage.setItem(REVIEW_DONE_KEY, "true")
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 280, display: "flex", alignItems: "flex-end" }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            style={{ position: "absolute", inset: 0, background: "rgba(10,16,24,0.72)", backdropFilter: "blur(5px)" }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{
              position: "relative", width: "100%",
              background: T.card, borderRadius: "28px 28px 0 0",
              padding: "0 0 48px",
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: T.muted }} />
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              style={{
                position: "absolute", top: 16, right: 16,
                width: 32, height: 32, borderRadius: 99,
                background: "rgba(255,255,255,0.06)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={14} style={{ color: T.muted }} />
            </button>

            <div style={{ padding: "20px 24px 0", textAlign: "center" }}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ paddingBottom: 8 }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 99,
                      background: `${T.teal}20`, border: `1px solid ${T.teal}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 14px",
                    }}>
                      <Star size={22} fill={T.gold} style={{ color: T.gold }} />
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: "-0.03em", marginBottom: 6 }}>
                      Thank you!
                    </p>
                    <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.5 }}>
                      Your feedback means a lot to us.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* App icon */}
                    <div style={{
                      width: 64, height: 64, borderRadius: 18,
                      background: `linear-gradient(135deg, ${T.teal}, ${T.coral})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 16px",
                      boxShadow: `0 8px 24px ${T.teal}40`,
                    }}>
                      <span style={{ fontSize: 28 }}>👔</span>
                    </div>

                    <p style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: "-0.03em", marginBottom: 6 }}>
                      Loving Drape?
                    </p>
                    <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.5, marginBottom: 24 }}>
                      Tell others what you think — it takes 10 seconds and helps us grow.
                    </p>

                    {/* Stars */}
                    <div
                      style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28 }}
                      role="group"
                      aria-label="Star rating"
                    >
                      {[1, 2, 3, 4, 5].map((n) => {
                        const filled = n <= (hovered || selected)
                        return (
                          <motion.button
                            key={n}
                            whileTap={{ scale: 0.82 }}
                            onMouseEnter={() => setHovered(n)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => handleStar(n)}
                            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                          >
                            <Star
                              size={34}
                              fill={filled ? T.gold : "transparent"}
                              style={{ color: filled ? T.gold : T.muted, transition: "all 0.12s" }}
                            />
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Submit */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmit}
                      disabled={selected === 0}
                      style={{
                        width: "100%", height: 54, borderRadius: 16,
                        background: selected > 0
                          ? `linear-gradient(135deg, ${T.teal}, ${T.coral})`
                          : "rgba(255,255,255,0.06)",
                        border: "none", cursor: selected > 0 ? "pointer" : "default",
                        fontSize: 15, fontWeight: 800, color: selected > 0 ? "#fff" : T.muted,
                        transition: "all 0.2s",
                        boxShadow: selected > 0 ? `0 6px 22px ${T.teal}40` : "none",
                        marginBottom: 12,
                      }}
                    >
                      {selected >= 4 ? "Rate on the App Store" : selected > 0 ? "Submit feedback" : "Select a rating"}
                    </motion.button>

                    <button
                      onClick={handleDismiss}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 13, color: T.muted, width: "100%", padding: "8px 0",
                      }}
                    >
                      Not now
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
