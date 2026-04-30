import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Constants ────────────────────────────────────────────────────────────────

const TRACK_H  = 7   // top + bottom track thickness (px)
const FRAME_W  = 5   // left + right frame thickness (px)

// ─── Hanger SVG ──────────────────────────────────────────────────────────────

function WardrobeHanger({ opacity = 1 }: { opacity?: number }) {
  return (
    <svg viewBox="0 0 88 66" fill="none" width={88} height={66} style={{ opacity }}>
      <path d="M44 7 Q44 1 50 1 Q58 1 58 9 Q58 16 51 19 L44 24"
        stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M5 24 Q24 18 44 24"
        stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M44 24 Q64 18 83 24"
        stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <line x1="5" y1="24" x2="12" y2="42" stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="83" y1="24" x2="76" y2="42" stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="12" y1="42" x2="76" y2="42" stroke="#3D5268" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Wardrobe interior ────────────────────────────────────────────────────────

function WardrobeInterior({ isEvening = false }: { isEvening?: boolean }) {
  const ambientColor = isEvening
    ? "rgba(95,65,110,0.05)"
    : "rgba(70,110,150,0.05)"

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: "0 5% 0 5%",
        background: isEvening
          ? "linear-gradient(to bottom, #0C1422 0%, #090E18 100%)"
          : "linear-gradient(to bottom, #0C1826 0%, #091220 100%)" }} />
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

// ─── Door panel (left or right) ───────────────────────────────────────────────

function DoorPanel({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left"

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Main door surface */}
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(170deg,#1D2F44 0%,#182840 32%,#13203A 68%,#0F1A2E 100%)" }} />

      {/* Subtle diagonal reflection */}
      <div style={{ position: "absolute", inset: 0,
        background: isLeft
          ? "linear-gradient(108deg,transparent 32%,rgba(195,215,238,0.055) 41%,rgba(195,215,238,0.08) 48%,rgba(195,215,238,0.055) 55%,transparent 64%)"
          : "linear-gradient(72deg,transparent 32%,rgba(195,215,238,0.055) 41%,rgba(195,215,238,0.08) 48%,rgba(195,215,238,0.055) 55%,transparent 64%)" }} />

      {/* Horizontal rule (subtle door register line) */}
      <div style={{ position: "absolute", left: "10%", right: "10%",
        top: "49.5%", height: 1,
        background: "linear-gradient(to right,transparent,rgba(255,255,255,0.045),transparent)" }} />

      {/* Handle groove — near inner edge */}
      <div style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        ...(isLeft ? { right: "13%" } : { left: "13%" }),
        width: 26, height: 6, borderRadius: 4,
        background: "rgba(4,10,18,0.6)",
        boxShadow: "inset 0 1.5px 3px rgba(0,0,0,0.95), inset 0 -1px 1.5px rgba(255,255,255,0.04)",
      }} />

      {/* Inner edge — bright seam where doors meet */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        ...(isLeft ? { right: 0 } : { left: 0 }),
        width: 3,
        background: "linear-gradient(to bottom,transparent 0%,rgba(140,185,220,0.40) 18%,rgba(165,205,240,0.70) 50%,rgba(140,185,220,0.40) 82%,transparent 100%)",
      }} />

      {/* Outer shadow edge */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        ...(isLeft ? { left: 0 } : { right: 0 }),
        width: 24,
        background: isLeft
          ? "linear-gradient(to right,rgba(0,0,0,0.55),transparent)"
          : "linear-gradient(to left,rgba(0,0,0,0.55),transparent)",
      }} />
    </div>
  )
}

// ─── Door frame tracks ─────────────────────────────────────────────────────────

function DoorFrame() {
  const trackStyle = {
    background: "linear-gradient(to bottom,#111E2E 0%,#0A1320 100%)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
  }
  const sideStyle = {
    background: "linear-gradient(to right,#0D1825,#111E2E)",
  }

  return (
    <>
      {/* Top track */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: TRACK_H, zIndex: 4, ...trackStyle }}>
        {/* Inner track highlight */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right,transparent,rgba(90,130,165,0.35) 20%,rgba(90,130,165,0.50) 50%,rgba(90,130,165,0.35) 80%,transparent)" }} />
      </div>

      {/* Bottom track */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: TRACK_H, zIndex: 4, ...trackStyle,
        background: "linear-gradient(to top,#111E2E 0%,#0A1320 100%)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(to right,transparent,rgba(90,130,165,0.30) 20%,rgba(90,130,165,0.45) 50%,rgba(90,130,165,0.30) 80%,transparent)" }} />
      </div>

      {/* Left frame strip */}
      <div style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, left: 0, width: FRAME_W, zIndex: 4, ...sideStyle }} />

      {/* Right frame strip */}
      <div style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, right: 0, width: FRAME_W, zIndex: 4,
        background: "linear-gradient(to left,#0D1825,#111E2E)" }} />
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = "intro" | "opening" | "dwell" | "closing" | "fadeout" | "done"

export function WardrobeMirrorTransition({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("intro")

  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    // Doors appear closed, brief pause, then open smoothly
    const t1 = setTimeout(() => setPhase("opening"),  320)   // activation pause
    const t2 = setTimeout(() => setPhase("dwell"),   1080)   // fully open (760ms open time)
    const t3 = setTimeout(() => setPhase("closing"), 2600)   // doors begin closing
    const t4 = setTimeout(() => setPhase("fadeout"), 3150)   // start fade
    const t5 = setTimeout(() => setPhase("done"),    3450)
    const t6 = setTimeout(() => onCompleteRef.current(), 3500)
    return () => { [t1,t2,t3,t4,t5,t6].forEach(clearTimeout) }
  }, [])

  // Door open/closed state per phase
  const doorsOpen = phase === "opening" || phase === "dwell"

  // Variants for smooth open/close with different easing each direction
  const leftVariants = {
    closed: { x: "0%",    transition: { duration: 0.52, ease: [0.55, 0, 0.45, 1] as const } },
    open:   { x: "-101%", transition: { duration: 0.70, ease: [0.28, 0, 0.08, 1] as const } },
  }
  const rightVariants = {
    closed: { x: "0%",   transition: { duration: 0.52, ease: [0.55, 0, 0.45, 1] as const } },
    open:   { x: "101%", transition: { duration: 0.70, ease: [0.28, 0, 0.08, 1] as const } },
  }

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden", background: "#080E18" }}
      animate={{ opacity: phase === "fadeout" || phase === "done" ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Interior (visible when doors are open) */}
      <WardrobeInterior />

      {/* Hanger — hangs from rail, sways during dwell, rises on exit */}
      <motion.div
        style={{ position: "absolute", top: "calc(29% + 3px)", left: "50%", x: "-50%", transformOrigin: "top center" }}
        animate={
          phase === "closing" || phase === "fadeout"
            ? { rotate: 0, y: -40, scale: 0.5, opacity: 0 }
            : phase === "dwell"
            ? { rotate: [0, -1.8, 1.2, -0.6, 0.2, 0] }
            : { rotate: 0 }
        }
        transition={
          phase === "closing" || phase === "fadeout"
            ? { duration: 0.5, ease: [0.42, 0, 0.58, 1] }
            : phase === "dwell"
            ? { delay: 0.12, duration: 0.9, ease: [0.37, 0, 0.63, 1] }
            : { duration: 0 }
        }
      >
        <WardrobeHanger />
      </motion.div>

      {/* Center seam glow — only visible when doors begin to part */}
      <AnimatePresence>
        {(phase === "opening" || phase === "dwell") && (
          <motion.div
            key="seam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute", top: TRACK_H, bottom: TRACK_H,
              left: "50%", width: 2, transform: "translateX(-50%)",
              background: "linear-gradient(to bottom,transparent,rgba(140,185,220,0.28) 25%,rgba(160,205,240,0.45) 50%,rgba(140,185,220,0.28) 75%,transparent)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Left door panel */}
      <motion.div
        style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, left: FRAME_W, width: `calc(50% - ${FRAME_W}px)`, zIndex: 2, overflow: "hidden" }}
        variants={leftVariants}
        animate={doorsOpen ? "open" : "closed"}
      >
        <DoorPanel side="left" />
      </motion.div>

      {/* Right door panel */}
      <motion.div
        style={{ position: "absolute", top: TRACK_H, bottom: TRACK_H, right: FRAME_W, width: `calc(50% - ${FRAME_W}px)`, zIndex: 2, overflow: "hidden" }}
        variants={rightVariants}
        animate={doorsOpen ? "open" : "closed"}
      >
        <DoorPanel side="right" />
      </motion.div>

      {/* Door frame (rendered on top of panels) */}
      <DoorFrame />
    </motion.div>
  )
}
