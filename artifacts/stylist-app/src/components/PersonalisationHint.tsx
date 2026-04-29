import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

// ─── Design tokens (kept local to avoid cross-file coupling) ───────────────────

const teal  = "#3F6F73"
const muted = "#6B8490"

// ─── Messages ─────────────────────────────────────────────────────────────────

const MESSAGES = {
  "fits-style": "This fits your style",
  "adjusted":   "Adjusted based on your preferences",
}

// ─── Component ────────────────────────────────────────────────────────────────

type HintType = "fits-style" | "adjusted"

export function PersonalisationHint({ type }: { type: HintType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "7px 14px",
        margin: "0 16px 10px",
        borderRadius: 99,
        background: `${teal}0D`,
        border: `1px solid ${teal}22`,
        width: "fit-content",
      }}
    >
      <Sparkles size={10} style={{ color: teal, flexShrink: 0 }} />
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: muted,
        letterSpacing: "0.01em",
      }}>
        {MESSAGES[type]}
      </span>
    </motion.div>
  )
}

// ─── Wardrobe item label pill ─────────────────────────────────────────────────

export function ItemUsagePill({ label }: { label: "frequently-worn" | "new" }) {
  const cfg = label === "frequently-worn"
    ? { text: "Frequently worn", color: "#3F6F73", bg: "#3F6F7318" }
    : { text: "New",             color: "#C8A96A", bg: "#C8A96A18" }

  return (
    <span style={{
      display: "inline-block",
      padding: "1px 6px",
      borderRadius: 99,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.04em",
      color: cfg.color,
      background: cfg.bg,
      flexShrink: 0,
    }}>
      {cfg.text}
    </span>
  )
}
