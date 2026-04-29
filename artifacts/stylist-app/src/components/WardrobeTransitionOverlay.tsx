import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────

export type WardrobeVariant = "partial" | "partial-reverse" | "micro"

interface Props {
  variant: WardrobeVariant
  isEvening: boolean
  onDone: () => void
}

// ─── Shared wardrobe interior ────────────────────────────────────────────────

function WardrobeInterior({ isEvening }: { isEvening: boolean }) {
  const ambientColor = isEvening
    ? "rgba(95,65,110,0.04)"    // warm purple at night
    : "rgba(70,110,150,0.045)"  // cool blue during day

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Rear wall */}
      <div
        style={{
          position: "absolute",
          inset: "0 5% 0 5%",
          background: isEvening
            ? "linear-gradient(to bottom, #0C1422 0%, #090E18 100%)"
            : "linear-gradient(to bottom, #0C1826 0%, #091220 100%)",
        }}
      />

      {/* Left wall shadow */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"6%",
        background:"linear-gradient(to right,#030810,transparent)" }} />

      {/* Right wall shadow */}
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"6%",
        background:"linear-gradient(to left,#030810,transparent)" }} />

      {/* Top ambient light */}
      <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:"30%",
        background:`radial-gradient(ellipse at 50% -10%,${ambientColor} 0%,transparent 70%)` }} />

      {/* Clothing rail */}
      <div style={{ position:"absolute", top:"29%", left:"14%", right:"14%", height:5,
        borderRadius:3,
        background:"linear-gradient(to bottom,#2E4158 0%,#1C2E42 100%)",
        boxShadow:"0 4px 14px rgba(0,0,0,0.75),0 1px 0 rgba(255,255,255,0.035)" }} />

      {/* Rail end caps */}
      {(["13%","13%"] as const).map((_, i) => (
        <div key={i} style={{
          position:"absolute", top:"calc(29% - 3px)",
          ...(i === 0 ? { left:"13%" } : { right:"13%" }),
          width:11, height:11, borderRadius:"50%",
          background:"#2E4158", boxShadow:"0 2px 8px rgba(0,0,0,0.65)",
        }} />
      ))}

      {/* Floor shadow */}
      <div style={{ position:"absolute", bottom:0, left:"5%", right:"5%", height:"11%",
        background:"linear-gradient(to top,rgba(0,0,0,0.8),transparent)" }} />
    </div>
  )
}

// ─── Mirror panel ─────────────────────────────────────────────────────────────

function MirrorPanel({ x }: { x: string | number }) {
  return (
    <motion.div
      style={{ position:"absolute", top:0, bottom:0, left:0, width:"100%" }}
      animate={{ x }}
      transition={{ duration: 0.25, ease: [0.42, 0, 0.58, 1] }}
    >
      {/* Glass base */}
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(168deg,#1B2840 0%,#18243C 28%,#142038 60%,#101A30 100%)" }} />

      {/* Reflection streak */}
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(110deg,transparent 39%,rgba(190,210,235,0.03) 44%,rgba(190,210,235,0.048) 49%,rgba(190,210,235,0.03) 54%,transparent 59%)" }} />

      {/* Right-edge depth */}
      <div style={{ position:"absolute", top:0, bottom:0, right:0, width:22,
        background:"linear-gradient(to left,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.2) 50%,transparent 100%)" }} />

      {/* Left-edge frame */}
      <div style={{ position:"absolute", top:0, bottom:0, left:0, width:2,
        background:"linear-gradient(to bottom,rgba(70,90,115,0.35),rgba(50,70,95,0.2),rgba(70,90,115,0.35))" }} />
    </motion.div>
  )
}

// ─── Partial transition (enter wardrobe) ─────────────────────────────────────

type PartialPhase = "opening" | "holding" | "closing" | "fadeout"

function PartialTransition({ isEvening, onDone }: { isEvening: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<PartialPhase>("opening")
  const doneRef = useRef(onDone)
  useEffect(() => { doneRef.current = onDone }, [onDone])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("holding"), 220)
    const t2 = setTimeout(() => setPhase("closing"),  340)
    const t3 = setTimeout(() => setPhase("fadeout"), 520)
    const t4 = setTimeout(() => doneRef.current(),   620)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  const mirrorX = phase === "opening" ? "38%" : phase === "holding" ? "38%" : "0%"

  return (
    <motion.div
      style={{ position:"fixed", inset:0, zIndex:1100, overflow:"hidden", background:"#080E18" }}
      animate={{ opacity: phase === "fadeout" ? 0 : 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <WardrobeInterior isEvening={isEvening} />
      <MirrorPanel x={mirrorX} />
    </motion.div>
  )
}

// ─── Partial-reverse (leave wardrobe) ────────────────────────────────────────

type ReversePhase = "showing" | "closing" | "fadeout"

function PartialReverseTransition({ isEvening, onDone }: { isEvening: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<ReversePhase>("showing")
  const doneRef = useRef(onDone)
  useEffect(() => { doneRef.current = onDone }, [onDone])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("closing"),  80)
    const t2 = setTimeout(() => setPhase("fadeout"), 260)
    const t3 = setTimeout(() => doneRef.current(),   340)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  // Mirror starts at 15% (briefly open) then slides back to 0
  const mirrorX = phase === "showing" ? "15%" : "0%"

  return (
    <motion.div
      style={{ position:"fixed", inset:0, zIndex:1100, overflow:"hidden", background:"#080E18" }}
      animate={{ opacity: phase === "fadeout" ? 0 : 0.72 }}
      transition={{ duration: 0.08, ease: "easeOut" }}
    >
      <WardrobeInterior isEvening={isEvening} />
      <MirrorPanel x={mirrorX} />
    </motion.div>
  )
}

// ─── Micro transition (daily app open) ───────────────────────────────────────

function MicroTransition({ onDone }: { isEvening: boolean; onDone: () => void }) {
  const doneRef = useRef(onDone)
  useEffect(() => { doneRef.current = onDone }, [onDone])

  useEffect(() => {
    const t = setTimeout(() => doneRef.current(), 180)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        width: 18,
        zIndex: 1100,
        overflow: "hidden",
      }}
      initial={{ x: -18 }}
      animate={{ x: ["-100%", "0%", "0%", "-100%"] }}
      transition={{
        duration: 0.18,
        times: [0, 0.38, 0.60, 1],
        ease: "easeInOut",
      }}
    >
      {/* Mirror sliver */}
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to right,#1B2840,#18243C)" }} />
      {/* Right edge glow */}
      <div style={{ position:"absolute", top:0, bottom:0, right:0, width:6,
        background:"linear-gradient(to left,rgba(190,210,235,0.06),transparent)" }} />
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WardrobeTransitionOverlay({ variant, isEvening, onDone }: Props) {
  if (variant === "partial")         return <PartialTransition isEvening={isEvening} onDone={onDone} />
  if (variant === "partial-reverse") return <PartialReverseTransition isEvening={isEvening} onDone={onDone} />
  return <MicroTransition isEvening={isEvening} onDone={onDone} />
}
