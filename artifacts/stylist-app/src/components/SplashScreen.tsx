import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(false), 2600)
    const doneTimer = setTimeout(() => onComplete(), 3300)
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
          }}
        >
          {/* Subtle ambient glow behind the card */}
          <div
            style={{
              position: "absolute",
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(200,169,106,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* App icon */}
          <motion.img
            src="/icon-512.png"
            alt="Style Assist"
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              marginBottom: 28,
              boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          />

          {/* Ivory wordmark card */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.65, ease: "easeOut" }}
            style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 12px 48px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
              width: 280,
            }}
          >
            <img
              src="/wordmark-v3.png"
              alt="Style Assist"
              style={{ width: "100%", display: "block" }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{
              fontSize: 12,
              color: "#6B8490",
              marginTop: 20,
              letterSpacing: "0.12em",
              fontFamily: "Inter, sans-serif",
              textTransform: "uppercase",
              position: "relative",
            }}
          >
            Your AI personal stylist
          </motion.p>

          {/* Gold loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            style={{
              position: "absolute",
              bottom: 52,
              display: "flex",
              gap: 6,
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8A96A" }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
