import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(false), 2200)
    const doneTimer = setTimeout(() => onComplete(), 2900)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#1F2A37",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            gap: 0,
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(63,111,115,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Icon */}
          <motion.img
            src="/icon-512.png"
            alt="Style Assist"
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ width: 120, height: 120, borderRadius: 28, marginBottom: 28 }}
          />

          {/* App name */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#F2F4F5",
              letterSpacing: "-0.03em",
              margin: 0,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Style Assist
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
            style={{
              fontSize: 14,
              color: "#AABBC0",
              marginTop: 6,
              letterSpacing: "0.01em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Your AI personal stylist
          </motion.p>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            style={{ display: "flex", gap: 6, marginTop: 48 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#3F6F73" }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
