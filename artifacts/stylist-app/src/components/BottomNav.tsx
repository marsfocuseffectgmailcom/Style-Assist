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
    // Outer shell: handles viewport-relative fixed positioning only.
    // No framer-motion here so translateX(-50%) is never overwritten.
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
      {/* Inner shell: handles opacity + slide animation only */}
      <motion.div
        animate={{
          opacity:       panelOpen ? 0 : 1,
          y:             panelOpen ? 16 : 0,
          pointerEvents: panelOpen ? "none" : "auto",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ pointerEvents: panelOpen ? "none" : "auto" }}
        className="h-[72px] w-full rounded-[28px] border border-white/8 bg-[#2A3645]/90 shadow-[0_8px_24px_rgba(0,0,0,0.20)] backdrop-blur-xl"
      >
        <div className="flex h-full items-center justify-between px-4">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              tabIndex={panelOpen ? -1 : 0}
              className={({ isActive }) =>
                `flex min-w-[52px] flex-col items-center gap-1 transition-[color] duration-[160ms] ${
                  isActive ? "text-[#3F6F73]" : "text-[#9CA3AF]"
                }`
              }
            >
              <Icon size={24} strokeWidth={2} />
              <span className="text-[11px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
