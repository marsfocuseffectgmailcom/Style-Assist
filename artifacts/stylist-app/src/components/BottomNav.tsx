import { Home, Shirt, CalendarDays, ShoppingBag, User } from "lucide-react"
import { NavLink } from "react-router-dom"

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Wardrobe", to: "/wardrobe", icon: Shirt },
  { label: "Timeline", to: "/timeline", icon: CalendarDays },
  { label: "Shop", to: "/shop", icon: ShoppingBag },
  { label: "Profile", to: "/profile", icon: User },
]

export function BottomNav() {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-24px)] max-w-[382px] -translate-x-1/2 rounded-[28px] border border-white/10 bg-[#1E2B3A]/90 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex min-w-[56px] flex-col items-center gap-1 transition ${
                isActive ? "text-[#3F6F73]" : "text-[#6B8490]"
              }`
            }
          >
            <Icon size={20} strokeWidth={2.2} />
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
