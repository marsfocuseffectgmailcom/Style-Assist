import { Home, Shirt, CalendarDays, ShoppingBag, User } from "lucide-react"
import { NavLink } from "react-router-dom"

const navItems = [
  { label: "Home",     to: "/",         icon: Home        },
  { label: "Wardrobe", to: "/wardrobe",  icon: Shirt       },
  { label: "Timeline", to: "/timeline",  icon: CalendarDays},
  { label: "Shop",     to: "/shop",      icon: ShoppingBag },
  { label: "Profile",  to: "/profile",   icon: User        },
]

export function BottomNav() {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 h-[72px] w-[calc(100%-24px)] max-w-[382px] -translate-x-1/2 rounded-[28px] border border-white/8 bg-[#2A3645]/90 shadow-[0_8px_24px_rgba(0,0,0,0.20)] backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
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
    </div>
  )
}
