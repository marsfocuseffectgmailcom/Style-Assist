import { User, Ruler, Shirt, CreditCard, ChevronRight, Heart, Clock3 } from "lucide-react"
import { Link } from "react-router-dom"
import { AppShell } from "../components/AppShell"
import { PrimaryButton } from "../components/PrimaryButton"
import { Card } from "../components/Card"

const profileSections = [
  {
    id: 1,
    icon: <Ruler size={18} className="text-[#C8A96A]" />,
    title: "Body Profile",
    subtitle: "Height, sizing, and fit preferences",
    href: "/profile/body",
  },
  {
    id: 2,
    icon: <Shirt size={18} className="text-[#C8A96A]" />,
    title: "Style Preferences",
    subtitle: "Colours, fabrics, and styling direction",
    href: "/profile/style",
  },
  {
    id: 3,
    icon: <CreditCard size={18} className="text-[#C8A96A]" />,
    title: "Subscription",
    subtitle: "Manage Drape Pro and billing",
    href: "/profile/subscription",
  },
  {
    id: 4,
    icon: <Heart size={18} className="text-[#C8A96A]" />,
    title: "Saved Products",
    subtitle: "View your wishlist and shopping picks",
    href: "/saved-products",
  },
]

export default function Profile() {
  return (
    <AppShell>
      <header className="mb-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5">
            <User size={20} className="text-[#C8A96A]" />
          </div>

          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.3px]">
              Profile
            </h1>
            <p className="text-sm text-[#AABBC0]">
              Personalise your styling experience
            </p>
          </div>
        </div>
      </header>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] text-xl font-bold text-white">
            A
          </div>

          <div>
            <h2 className="text-[20px] font-semibold">Alex Morgan</h2>
            <p className="mt-1 text-sm text-[#AABBC0]">Drape Pro member</p>
          </div>
        </div>
      </Card>

      <section className="mt-5 space-y-3">
        {profileSections.map((section) => {
          const inner = (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                {section.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#F2F4F5]">
                  {section.title}
                </h3>
                <p className="mt-1 text-sm text-[#AABBC0]">{section.subtitle}</p>
              </div>

              <ChevronRight size={18} className="text-[#6B8490]" />
            </>
          )

          const className = "flex w-full items-center gap-3 rounded-[20px] border border-white/10 bg-[#2A3645] p-4 text-left transition hover:border-white/15"

          return section.href ? (
            <Link key={section.id} to={section.href} className={className}>
              {inner}
            </Link>
          ) : (
            <button key={section.id} className={className}>
              {inner}
            </button>
          )
        })}
      </section>

      <Card className="mt-5">
        <h3 className="text-[16px] font-semibold">Current Plan</h3>
        <p className="mt-2 text-sm leading-6 text-[#AABBC0]">
          You have access to unlimited wardrobe items, all outfit variations,
          styling insights, and smart shopping recommendations
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[18px] bg-white/5 p-3">
            <p className="text-[#6B8490]">Plan</p>
            <p className="mt-1 font-semibold text-[#F2F4F5]">Drape Pro</p>
          </div>

          <div className="rounded-[18px] bg-white/5 p-3">
            <p className="text-[#6B8490]">Billing</p>
            <p className="mt-1 font-semibold text-[#F2F4F5]">$4.99 / month</p>
          </div>
        </div>

        <div className="mt-4">
          <PrimaryButton>Manage Subscription</PrimaryButton>
        </div>
      </Card>
    </AppShell>
  )
}
