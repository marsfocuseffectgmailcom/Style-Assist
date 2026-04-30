import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────

export type WardrobeVariant = "partial" | "partial-reverse" | "micro"

interface Props {
  variant:   WardrobeVariant
  isEvening: boolean
  onDone:    () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRACK_H = 6
const FRAME_W = 4

// ─── Door frame tracks ────────────────────────────────────────────────────────

function DoorFrame() {
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: TRACK_H, zIndex: 4,
        background: "linear-gradient(to bottom,#111E2E,#0A1320)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.035)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right,transparent,rgba(90,130,165,0.42) 25%,rgba(90,130,165,0.55) 50%,rgba(90,130,165,0.42) 75%,transparent)" }} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: TRACK_H, zIndex: 4,
        background: "linear-gradient(to top,#111E2E,#0A1320)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right,transparent,rgba(90,130,165,0.35) 25%,rgba(90,130,165,0.48) 50%,rgba(90,130,165,0.35) 75%,transparent)" }} />
      </div>
      <div style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, left: 0, width: FRAME_W, zIndex: 4,
        background: "linear-gradient(to right,#0D1825,#111E2E)" }} />
      <div style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, right: 0, width: FRAME_W, zIndex: 4,
        background: "linear-gradient(to left,#0D1825,#111E2E)" }} />
    </>
  )
}

// ─── Door panel surface ───────────────────────────────────────────────────────

function DoorPanel({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left"
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(170deg,#1C2D42 0%,#172739 34%,#121F38 70%,#0E192C 100%)" }} />
      <div style={{ position: "absolute", inset: 0,
        background: isLeft
          ? "linear-gradient(108deg,transparent 34%,rgba(195,215,238,0.05) 42%,rgba(195,215,238,0.075) 49%,rgba(195,215,238,0.05) 56%,transparent 64%)"
          : "linear-gradient(72deg,transparent 34%,rgba(195,215,238,0.05) 42%,rgba(195,215,238,0.075) 49%,rgba(195,215,238,0.05) 56%,transparent 64%)" }} />
      <div style={{ position: "absolute", left: "10%", right: "10%", top: "50%", height: 1,
        background: "linear-gradient(to right,transparent,rgba(255,255,255,0.04),transparent)" }} />
      <div style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        ...(isLeft ? { right: "14%" } : { left: "14%" }),
        width: 22, height: 5, borderRadius: 3,
        background: "rgba(4,10,18,0.65)",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.9), inset 0 -1px 1px rgba(255,255,255,0.03)",
      }} />
      {/* Inner seam edge */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        ...(isLeft ? { right: 0 } : { left: 0 }), width: 2,
        background: "linear-gradient(to bottom,transparent,rgba(140,185,220,0.42) 20%,rgba(165,205,240,0.68) 50%,rgba(140,185,220,0.42) 80%,transparent)",
      }} />
      {/* Outer shadow */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        ...(isLeft ? { left: 0 } : { right: 0 }), width: 20,
        background: isLeft
          ? "linear-gradient(to right,rgba(0,0,0,0.5),transparent)"
          : "linear-gradient(to left,rgba(0,0,0,0.5),transparent)",
      }} />
    </div>
  )
}

// ─── Wardrobe interior ────────────────────────────────────────────────────────

function WardrobeInterior({ isEvening }: { isEvening: boolean }) {
  const ambientColor = isEvening ? "rgba(95,65,110,0.04)" : "rgba(70,110,150,0.045)"
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: "0 5% 0 5%",
        background: isEvening
          ? "linear-gradient(to bottom,#0C1422,#090E18)"
          : "linear-gradient(to bottom,#0C1826,#091220)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6%",
        background: "linear-gradient(to right,#030810,transparent)" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "6%",
        background: "linear-gradient(to left,#030810,transparent)" }} />
      <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "30%",
        background: `radial-gradient(ellipse at 50% -10%,${ambientColor} 0%,transparent 70%)` }} />
      <div style={{ position: "absolute", top: "29%", left: "14%", right: "14%", height: 5,
        borderRadius: 3,
        background: "linear-gradient(to bottom,#2E4158 0%,#1C2E42 100%)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.75),0 1px 0 rgba(255,255,255,0.035)" }} />
      {([0, 1] as const).map((i) => (
        <div key={i} style={{
          position: "absolute", top: "calc(29% - 3px)",
          ...(i === 0 ? { left: "13%" } : { right: "13%" }),
          width: 11, height: 11, borderRadius: "50%",
          background: "#2E4158", boxShadow: "0 2px 8px rgba(0,0,0,0.65)",
        }} />
      ))}
      <div style={{ position: "absolute", bottom: 0, left: "5%", right: "5%", height: "11%",
        background: "linear-gradient(to top,rgba(0,0,0,0.8),transparent)" }} />
    </div>
  )
}

// ─── Shared dual-door renderer ────────────────────────────────────────────────

function DualDoors({
  isOpen,
  isEvening,
  openEase  = [0.28, 0, 0.08, 1] as const,
  openDur   = 0.48,
  closeEase = [0.55, 0, 0.45, 1] as const,
  closeDur  = 0.38,
}: {
  isOpen:     boolean
  isEvening:  boolean
  openEase?:  [number, number, number, number]
  openDur?:   number
  closeEase?: [number, number, number, number]
  closeDur?:  number
}) {
  const leftVariants = {
    closed: { x: "0%",    transition: { duration: closeDur, ease: closeEase } },
    open:   { x: "-101%", transition: { duration: openDur,  ease: openEase  } },
  }
  const rightVariants = {
    closed: { x: "0%",  transition: { duration: closeDur, ease: closeEase } },
    open:   { x: "101%", transition: { duration: openDur, ease: openEase  } },
  }

  return (
    <>
      <WardrobeInterior isEvening={isEvening} />

      {/* Center seam glow */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="seam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute", top: TRACK_H, bottom: TRACK_H,
              left: "50%", width: 2, transform: "translateX(-50%)",
              background: "linear-gradient(to bottom,transparent,rgba(140,185,220,0.32) 25%,rgba(160,205,240,0.48) 50%,rgba(140,185,220,0.32) 75%,transparent)",
              zIndex: 3, pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Left door */}
      <motion.div
        style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, left: FRAME_W, width: `calc(50% - ${FRAME_W}px)`, zIndex: 2, overflow: "hidden" }}
        variants={leftVariants}
        animate={isOpen ? "open" : "closed"}
      >
        <DoorPanel side="left" />
      </motion.div>

      {/* Right door */}
      <motion.div
        style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, right: FRAME_W, width: `calc(50% - ${FRAME_W}px)`, zIndex: 2, overflow: "hidden" }}
        variants={rightVariants}
        animate={isOpen ? "open" : "closed"}
      >
        <DoorPanel side="right" />
      </motion.div>

      <DoorFrame />
    </>
  )
}

// ─── Partial transition (entering the wardrobe) ───────────────────────────────

type PartialPhase = "opening" | "holding" | "closing" | "fadeout"

function PartialTransition({ isEvening, onDone }: { isEvening: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<PartialPhase>("opening")
  const doneRef = useRef(onDone)
  useEffect(() => { doneRef.current = onDone }, [onDone])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("holding"),  480)
    const t2 = setTimeout(() => setPhase("closing"),  980)
    const t3 = setTimeout(() => setPhase("fadeout"), 1380)
    const t4 = setTimeout(() => doneRef.current(),   1550)
    return () => { [t1,t2,t3,t4].forEach(clearTimeout) }
  }, [])

  const isOpen = phase === "opening" || phase === "holding"

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, zIndex: 1100, overflow: "hidden", background: "#080E18" }}
      animate={{ opacity: phase === "fadeout" ? 0 : 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <DualDoors
        isOpen={isOpen}
        isEvening={isEvening}
        openDur={0.44}
        openEase={[0.28, 0, 0.1, 1]}
        closeDur={0.38}
        closeEase={[0.55, 0, 0.45, 1]}
      />
    </motion.div>
  )
}

// ─── Partial-reverse transition (leaving the wardrobe) ────────────────────────

type ReversePhase = "parted" | "closing" | "fadeout"

function PartialReverseTransition({ isEvening, onDone }: { isEvening: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<ReversePhase>("parted")
  const doneRef = useRef(onDone)
  useEffect(() => { doneRef.current = onDone }, [onDone])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("closing"),  80)
    const t2 = setTimeout(() => setPhase("fadeout"), 460)
    const t3 = setTimeout(() => doneRef.current(),   620)
    return () => { [t1,t2,t3].forEach(clearTimeout) }
  }, [])

  // Doors start at a slightly open position, then slide closed
  const closing = phase === "closing" || phase === "fadeout"
  const ease: [number,number,number,number] = [0.55, 0, 0.45, 1]

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, zIndex: 1100, overflow: "hidden", background: "#080E18" }}
      animate={{ opacity: phase === "fadeout" ? 0 : 0.88 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
    >
      <WardrobeInterior isEvening={isEvening} />

      {/* Left door — starts slightly open (x: -10%) then closes to x: 0% */}
      <motion.div
        style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, left: FRAME_W, width: `calc(50% - ${FRAME_W}px)`, zIndex: 2, overflow: "hidden" }}
        initial={{ x: "-10%" }}
        animate={{ x: closing ? "0%" : "-10%" }}
        transition={{ duration: 0.38, ease }}
      >
        <DoorPanel side="left" />
      </motion.div>

      {/* Right door — starts slightly open (x: 10%) then closes to x: 0% */}
      <motion.div
        style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, right: FRAME_W, width: `calc(50% - ${FRAME_W}px)`, zIndex: 2, overflow: "hidden" }}
        initial={{ x: "10%" }}
        animate={{ x: closing ? "0%" : "10%" }}
        transition={{ duration: 0.38, ease }}
      >
        <DoorPanel side="right" />
      </motion.div>

      <DoorFrame />
    </motion.div>
  )
}

// ─── Micro transition (daily app open — visible door greeting) ────────────────

type MicroPhase = "opening" | "open" | "closing" | "done"

function MicroTransition({ isEvening, onDone }: { isEvening: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<MicroPhase>("opening")
  const doneRef = useRef(onDone)
  useEffect(() => { doneRef.current = onDone }, [onDone])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("open"),     320)   // doors done opening
    const t2 = setTimeout(() => setPhase("closing"),  580)   // start closing
    const t3 = setTimeout(() => setPhase("done"),     870)   // closing done
    const t4 = setTimeout(() => doneRef.current(),   1000)
    return () => { [t1,t2,t3,t4].forEach(clearTimeout) }
  }, [])

  const isOpen = phase === "opening" || phase === "open"

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, zIndex: 1100, overflow: "hidden", background: "#080E18" }}
      animate={{ opacity: phase === "done" ? 0 : 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <DualDoors
        isOpen={isOpen}
        isEvening={isEvening}
        openDur={0.30}
        openEase={[0.28, 0, 0.1, 1]}
        closeDur={0.27}
        closeEase={[0.60, 0, 0.40, 1]}
      />
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WardrobeTransitionOverlay({ variant, isEvening, onDone }: Props) {
  if (variant === "partial")         return <PartialTransition        isEvening={isEvening} onDone={onDone} />
  if (variant === "partial-reverse") return <PartialReverseTransition isEvening={isEvening} onDone={onDone} />
  return                                    <MicroTransition           isEvening={isEvening} onDone={onDone} />
}
