import { Home, Shirt, CalendarDays, ShoppingBag, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { useWardrobePanel } from "../contexts/WardrobePanelContext"

const navItems = [
  { label: "Home",     to: "/",         icon: Home        },
  { label: "Wardrobe", to: "/wardrobe",  icon: Shirt       },
  { label: "Timeline", to: "/timeline",  icon: CalendarDays},
  { label: "Shop",     to: "/shop",      icon: ShoppingBag },
  { label: "Profile",  to: "/profile",   icon: User        },
]

export function BottomNav() {
  const { panelOpen } = useWardrobePanel()

  return (
    // Outer shell: viewport-relative fixed position only.
    // Static — no framer-motion — so translateX(-50%) is never clobbered.
    <div
      style={{
        position:  "fixed",
        left:      "50vw",
        bottom:    "calc(16px + env(safe-area-inset-bottom))",
        transform: "translateX(-50%)",
        width:     "min(calc(100vw - 32px), 420px)",
        maxWidth:  "420px",
        zIndex:    1000,
      }}
    >
      {/* Inner shell: animation only (opacity + translateY).
          framer-motion owns transform here; positioning is the outer div's job. */}
      <motion.div
        animate={{
          opacity:       panelOpen ? 0 : 1,
          y:             panelOpen ? 16 : 0,
          pointerEvents: panelOpen ? "none" : "auto",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          pointerEvents:   panelOpen ? "none" : "auto",
          height:          72,
          borderRadius:    999,
          padding:         "8px 10px",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "space-between",
          background:      "rgba(31,42,55,0.92)",
          backdropFilter:  "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border:          "1px solid rgba(232,223,200,0.42)",
          boxShadow:       "0 14px 36px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            tabIndex={panelOpen ? -1 : 0}
            aria-label={label}
            style={{ flex: 1, minWidth: 0, textDecoration: "none" }}
          >
            {({ isActive }) => (
              <motion.div
                animate={{
                  backgroundColor: isActive
                    ? "rgba(127,169,163,0.10)"
                    : "rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                whileTap={{ scale: 0.96 }}
                style={{
                  height:         56,
                  borderRadius:   999,
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            4,
                  minWidth:       44,
                  cursor:         "pointer",
                }}
              >
                <Icon
                  size={24}
                  strokeWidth={2.2}
                  style={{ color: isActive ? "#7FA9A3" : "rgba(245,245,245,0.58)" }}
                />
                <span
                  style={{
                    fontSize:      11,
                    lineHeight:    "13px",
                    fontWeight:    650,
                    letterSpacing: "-0.01em",
                    color:         isActive ? "#7FA9A3" : "rgba(245,245,245,0.58)",
                    transition:    "color 160ms ease",
                  }}
                >
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </motion.div>
    </div>
  )
}
