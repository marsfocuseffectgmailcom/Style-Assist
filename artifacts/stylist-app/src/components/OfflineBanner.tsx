import { WifiOff } from "lucide-react"
import { useOnlineStatus } from "../hooks/useOnlineStatus"
import { AnimatePresence, motion } from "framer-motion"

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            background: "rgba(31,42,55,0.96)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <WifiOff size={14} style={{ color: "#C8A96A", flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: "#AABBC0", lineHeight: 1 }}>
            You're offline — your wardrobe is still available.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
