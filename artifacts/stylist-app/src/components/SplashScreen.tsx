import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(false), 2400)
    const doneTimer = setTimeout(() => onComplete(), 3100)
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
          {/* Wordmark background image — fades in */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url(/wordmark-bg.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Subtle dark vignette overlay to keep edges deep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(15,21,30,0.55) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* App icon — floats above the wordmark image */}
          <motion.img
            src="/icon-512.png"
            alt="Style Assist"
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              position: "relative",
              width: 96,
              height: 96,
              borderRadius: 22,
              marginBottom: 220,
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            }}
          />

          {/* Loading dots — bottom center */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
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
