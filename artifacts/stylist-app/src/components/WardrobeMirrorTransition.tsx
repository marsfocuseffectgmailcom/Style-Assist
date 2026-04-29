import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

// ─── Hanger SVG ──────────────────────────────────────────────────────────────

function WardrobeHanger({ opacity = 1 }: { opacity?: number }) {
  return (
    <svg
      viewBox="0 0 88 66"
      fill="none"
      width={88}
      height={66}
      style={{ opacity }}
    >
      {/* Hook — attaches to rail */}
      <path
        d="M44 7 Q44 1 50 1 Q58 1 58 9 Q58 16 51 19 L44 24"
        stroke="#3D5268"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left shoulder */}
      <path
        d="M5 24 Q24 18 44 24"
        stroke="#3D5268"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right shoulder */}
      <path
        d="M44 24 Q64 18 83 24"
        stroke="#3D5268"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left drop */}
      <line
        x1="5" y1="24" x2="12" y2="42"
        stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round"
      />
      {/* Right drop */}
      <line
        x1="83" y1="24" x2="76" y2="42"
        stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round"
      />
      {/* Bottom bar */}
      <line
        x1="12" y1="42" x2="76" y2="42"
        stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WardrobeMirrorTransition({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"intro" | "open" | "dwell" | "exit">("intro")

  // Keep a stable ref so the effect never re-runs due to function identity changes
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("open"),          200)
    const t2 = setTimeout(() => setPhase("dwell"),         500)
    const t3 = setTimeout(() => setPhase("exit"),         1500)
    const t4 = setTimeout(() => onCompleteRef.current(), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, []) // runs once on mount — timers are deterministic

  const mirrorX = phase === "intro" ? "0%" : "76%"

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        background: "#080E18",
      }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.68, ease: [0.32, 0, 0.15, 1] }}
    >

      {/* ── Wardrobe interior ───────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        {/* Rear wall — very dark panel */}
        <div
          style={{
            position: "absolute",
            inset: "0 5% 0 5%",
            background: "linear-gradient(to bottom, #0C1826 0%, #091220 100%)",
          }}
        />

        {/* Left wall shadow */}
        <div
          style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: "6%",
            background: "linear-gradient(to right, #030810, transparent)",
          }}
        />

        {/* Right wall shadow */}
        <div
          style={{
            position: "absolute",
            right: 0, top: 0, bottom: 0,
            width: "6%",
            background: "linear-gradient(to left, #030810, transparent)",
          }}
        />

        {/* Top ambient light — barely there */}
        <div
          style={{
            position: "absolute",
            top: 0, left: "20%", right: "20%",
            height: "30%",
            background:
              "radial-gradient(ellipse at 50% -10%, rgba(70,110,150,0.045) 0%, transparent 70%)",
          }}
        />

        {/* Clothing rail — horizontal bar */}
        <div
          style={{
            position: "absolute",
            top: "29%",
            left: "14%",
            right: "14%",
            height: 5,
            borderRadius: 3,
            background: "linear-gradient(to bottom, #2E4158 0%, #1C2E42 100%)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.035)",
          }}
        />

        {/* Rail left end cap */}
        <div
          style={{
            position: "absolute",
            top: "calc(29% - 3px)",
            left: "13%",
            width: 11, height: 11,
            borderRadius: "50%",
            background: "#2E4158",
            boxShadow: "0 2px 8px rgba(0,0,0,0.65)",
          }}
        />

        {/* Rail right end cap */}
        <div
          style={{
            position: "absolute",
            top: "calc(29% - 3px)",
            right: "13%",
            width: 11, height: 11,
            borderRadius: "50%",
            background: "#2E4158",
            boxShadow: "0 2px 8px rgba(0,0,0,0.65)",
          }}
        />

        {/* Hanger — hangs from rail, sways once, then rises on exit */}
        <motion.div
          style={{
            position: "absolute",
            top: "calc(29% + 3px)",
            left: "50%",
            x: "-50%",
            transformOrigin: "top center",
          }}
          animate={
            phase === "exit"
              ? { rotate: 0, y: -38, scale: 0.55, opacity: 0 }
              : phase === "dwell"
              ? { rotate: [0, -1.5, 1.1, -0.5, 0.2, 0] }
              : { rotate: 0 }
          }
          transition={
            phase === "exit"
              ? { duration: 0.55, ease: [0.42, 0, 0.58, 1] }
              : phase === "dwell"
              ? { delay: 0.08, duration: 0.85, ease: [0.37, 0, 0.63, 1] }
              : { duration: 0 }
          }
        >
          <WardrobeHanger />
        </motion.div>

        {/* Floor shadow — depth */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: "5%", right: "5%",
            height: "11%",
            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          }}
        />
      </div>

      {/* ── Mirror panel ────────────────────────────────────────────────────── */}
      <motion.div
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: 0,
          width: "100%",
        }}
        animate={{ x: mirrorX }}
        transition={{
          duration: phase === "open" || mirrorX !== "0%" ? 0.3 : 0,
          ease: [0.42, 0, 0.58, 1],
        }}
      >
        {/* Glass surface — dark, barely reflective */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(168deg, #1B2840 0%, #18243C 28%, #142038 60%, #101A30 100%)",
          }}
        />

        {/* Primary reflection — very faint diagonal streak */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, transparent 0%, transparent 39%, rgba(190,210,235,0.03) 44%, rgba(190,210,235,0.048) 49%, rgba(190,210,235,0.03) 54%, transparent 59%, transparent 100%)",
          }}
        />

        {/* Secondary reflection — even fainter, offset */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, transparent 0%, transparent 60%, rgba(190,210,235,0.018) 65%, rgba(190,210,235,0.028) 69%, rgba(190,210,235,0.018) 73%, transparent 78%, transparent 100%)",
          }}
        />

        {/* Right-edge depth shadow — moves with mirror, sells the glass edge */}
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0, right: 0,
            width: 22,
            background:
              "linear-gradient(to left, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
          }}
        />

        {/* Left-edge frame — subtle */}
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0, left: 0,
            width: 2,
            background:
              "linear-gradient(to bottom, rgba(70,90,115,0.35), rgba(50,70,95,0.2), rgba(70,90,115,0.35))",
          }}
        />
      </motion.div>

    </motion.div>
  )
}
