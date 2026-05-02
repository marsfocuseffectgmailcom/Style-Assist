import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Check, Zap } from "lucide-react"

const T = {
  bg:     "#1F2A37",
  card:   "#243140",
  raised: "#2A3645",
  border: "rgba(255,255,255,0.08)",
  teal:   "#3F6F73",
  coral:  "#7FA9A3",
  gold:   "#C8A96A",
  text:   "#F2F4F5",
  sub:    "#AABBC0",
  muted:  "#6B8490",
}

const PERKS = [
  "Unlimited daily outfit generates",
  "AI stylist chat — ask anything",
  "Plan Ahead for unlimited events",
  "Priority new feature access",
]

interface Props {
  open:       boolean
  reason?:    string
  onClose:    () => void
  onUpgrade?: () => void
}

export function UpgradeSheet({ open, reason, onClose, onUpgrade }: Props) {
  function handleUpgrade() {
    onUpgrade?.()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "rgba(10,16,24,0.78)", backdropFilter: "blur(6px)" }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{
              position: "relative", background: T.card,
              borderRadius: "28px 28px 0 0",
              padding: "0 0 40px",
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: T.muted }} />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute", top: 16, right: 16,
                width: 32, height: 32, borderRadius: 99,
                background: "rgba(255,255,255,0.06)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={14} style={{ color: T.muted }} />
            </button>

            <div style={{ padding: "20px 24px 0" }}>
              {/* Badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 99,
                background: `linear-gradient(135deg, ${T.gold}22, ${T.teal}22)`,
                border: `1px solid ${T.gold}30`,
                marginBottom: 16,
              }}>
                <Sparkles size={11} style={{ color: T.gold }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: "0.07em" }}>DRAPE PRO</span>
              </div>

              <h2 style={{ fontSize: 26, fontWeight: 900, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
                Your daily limit<br />is up.
              </h2>

              {reason && (
                <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.5, marginBottom: 20 }}>
                  {reason}
                </p>
              )}
              {!reason && (
                <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.5, marginBottom: 20 }}>
                  You've used your 3 free generates today. Go Pro for unlimited access.
                </p>
              )}

              {/* Price */}
              <div style={{
                display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20,
                padding: "14px 16px",
                background: `linear-gradient(135deg, ${T.teal}10, ${T.gold}08)`,
                borderRadius: 18, border: `1px solid ${T.teal}25`,
              }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: T.text, letterSpacing: "-0.04em" }}>$4.99</span>
                <span style={{ fontSize: 14, color: T.muted }}> / month</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <Zap size={12} style={{ color: T.gold }} />
                  <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>Cancel anytime</span>
                </div>
              </div>

              {/* Perks */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {PERKS.map((perk) => (
                  <div key={perk} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 99, flexShrink: 0,
                      background: `${T.teal}18`, border: `1px solid ${T.teal}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Check size={10} style={{ color: T.teal }} />
                    </div>
                    <span style={{ fontSize: 13, color: T.sub }}>{perk}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleUpgrade}
                style={{
                  width: "100%", height: 56, borderRadius: 18,
                  background: `linear-gradient(135deg, ${T.teal}, ${T.coral})`,
                  border: "none", cursor: "pointer",
                  fontSize: 16, fontWeight: 800, color: "#fff",
                  letterSpacing: "-0.01em",
                  boxShadow: `0 8px 28px ${T.teal}40`,
                  marginBottom: 12,
                }}
              >
                Start Drape Pro — $4.99/mo
              </motion.button>

              <button
                onClick={onClose}
                style={{
                  width: "100%", height: 44, background: "transparent", border: "none",
                  cursor: "pointer", fontSize: 13, color: T.muted, fontWeight: 500,
                }}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
