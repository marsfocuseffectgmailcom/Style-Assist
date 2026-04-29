import { User, Ruler, Shirt, CreditCard, ChevronRight, Heart, Archive, BarChart2, RotateCcw, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { AppShell } from "../components/AppShell"
import { PrimaryButton } from "../components/PrimaryButton"
import { Card } from "../components/Card"
import { usePersonalisation } from "../lib/usePersonalisation"
import type { StyleDirection } from "../lib/usePersonalisation"

const ONBOARDING_KEY = "style-assist-onboarded"

function resetApp() {
  localStorage.removeItem(ONBOARDING_KEY)
  localStorage.removeItem("style-assist-timeline")
  window.location.reload()
}

const DIRECTIONS: { value: StyleDirection; label: string; sub: string }[] = [
  { value: "casual",   label: "Casual",   sub: "Relaxed, everyday looks" },
  { value: "balanced", label: "Balanced", sub: "A mix of both"            },
  { value: "polished", label: "Polished", sub: "Considered, refined looks" },
]

function StyleMemoryCard() {
  const { store, setStyleDirection, resetPersonalisation } = usePersonalisation()
  const [resetDone, setResetDone] = useState(false)
  const prevSignalsRef = useRef(store.totalSignals)

  // Detect when totalSignals drops back to 0 (i.e. reset fired) → show feedback
  useEffect(() => {
    if (prevSignalsRef.current > 0 && store.totalSignals === 0) {
      setResetDone(true)
      const t = setTimeout(() => setResetDone(false), 2200)
      prevSignalsRef.current = 0
      return () => clearTimeout(t)
    }
    prevSignalsRef.current = store.totalSignals
    return undefined
  }, [store.totalSignals])

  function handleReset() {
    resetPersonalisation()
  }

  const signalCount = store.totalSignals
  const hasSignals  = signalCount >= 1

  return (
    <Card className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3F6F73]/15">
          <Sparkles size={15} className="text-[#3F6F73]" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-[#F5F5F5]">Style Memory</h3>
          <p className="text-[12px] text-[#6B8490]">
            {hasSignals
              ? `Adjusting based on ${signalCount} signal${signalCount !== 1 ? "s" : ""}`
              : "Learning from your choices"}
          </p>
        </div>
      </div>

      {/* Style direction selector */}
      <p className="text-[12px] font-medium text-[#AABBC0] mb-2">Lean towards</p>
      <div className="flex gap-2 mb-5">
        {DIRECTIONS.map((d) => {
          const active = store.styleDirection === d.value
          return (
            <button
              key={d.value}
              onClick={() => setStyleDirection(d.value)}
              className="flex-1 rounded-[14px] border py-2.5 px-1 text-center transition-[transform] duration-[140ms] active:scale-[0.96]"
              style={{
                background:   active ? "rgba(63,111,115,0.14)" : "rgba(255,255,255,0.04)",
                borderColor:  active ? "rgba(63,111,115,0.45)" : "rgba(255,255,255,0.08)",
                color:        active ? "#3F6F73"               : "#6B8490",
              }}
            >
              <p className="text-[12px] font-bold leading-none mb-0.5" style={{ color: active ? "#3F6F73" : "#AABBC0" }}>
                {d.label}
              </p>
              <p className="text-[9px] font-medium" style={{ color: active ? "#5F9F9F" : "#6B8490" }}>
                {d.sub}
              </p>
            </button>
          )
        })}
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full rounded-[14px] border border-white/8 bg-white/4 py-3 text-[13px] font-semibold transition-[transform] duration-[160ms] active:scale-[0.97]"
        style={{ color: resetDone ? "#3F6F73" : "#AABBC0" }}
      >
        {resetDone ? "Style memory cleared" : "Reset style memory"}
      </button>
    </Card>
  )
}

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
  {
    id: 5,
    icon: <Archive size={18} className="text-[#A8B0B8]" />,
    title: "Removed Items",
    subtitle: "View and restore items you've removed",
    href: "/profile/removed-items",
  },
  {
    id: 6,
    icon: <BarChart2 size={18} className="text-[#3F6F73]" />,
    title: "Retention Dashboard",
    subtitle: "Day 1/7 retention, DAU, acceptance rate",
    href: "/profile/analytics",
  },
]

export default function Profile() {
  return (
    <AppShell>
      {/* ── Header ── */}
      <header className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5">
            <User size={20} className="text-[#C8A96A]" />
          </div>
          <div>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.03em] text-[#F5F5F5]">
              Profile
            </h1>
            <p className="text-[15px] leading-[22px] text-[#A8B0B8]">
              Personalise your styling experience
            </p>
          </div>
        </div>
      </header>

      {/* ── Identity card ── */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[#3F6F73] text-xl font-bold text-white">
            A
          </div>
          <div>
            <h2 className="text-[17px] font-bold leading-[22px]">Alex Morgan</h2>
            <p className="mt-1 text-[15px] leading-[22px] text-[#A8B0B8]">Drape Pro member</p>
          </div>
        </div>
      </Card>

      {/* ── Sections ── */}
      <section className="mb-6 space-y-4">
        {profileSections.map((section) => {
          const inner = (
            <>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
                {section.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold leading-[22px] text-[#F5F5F5]">
                  {section.title}
                </h3>
                <p className="text-[12px] leading-[16px] font-medium text-[#A8B0B8]">
                  {section.subtitle}
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-[#9CA3AF]" />
            </>
          )

          const cls =
            "flex w-full items-center gap-4 rounded-[24px] border border-white/6 bg-[#2A3645] p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-[transform] duration-[160ms] active:scale-[0.97]"

          return section.href ? (
            <Link key={section.id} to={section.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={section.id} className={cls}>
              {inner}
            </button>
          )
        })}
      </section>

      {/* ── Style Memory ── */}
      <StyleMemoryCard />

      {/* ── Tester tools ── */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5">
            <RotateCcw size={15} className="text-[#6B8490]" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#F5F5F5]">Tester Tools</h3>
            <p className="text-[12px] text-[#6B8490]">For testing and feedback sessions</p>
          </div>
        </div>
        <button
          onClick={resetApp}
          className="w-full rounded-[14px] border border-white/8 bg-white/4 py-3 text-[13px] font-semibold text-[#AABBC0] transition-[transform] duration-[160ms] active:scale-[0.97]"
        >
          Restart onboarding
        </button>
      </Card>

      {/* ── Current plan ── */}
      <Card>
        <h3 className="text-[17px] font-bold leading-[22px]">Current Plan</h3>
        <p className="mt-2 text-[15px] leading-[22px] text-[#A8B0B8]">
          Unlimited wardrobe items, all outfit variations, styling insights, and smart shopping
          recommendations
        </p>

        <div className="my-4 grid grid-cols-2 gap-4">
          <div className="rounded-[18px] bg-white/5 p-3">
            <p className="text-[12px] leading-[16px] font-medium text-[#9CA3AF]">Plan</p>
            <p className="mt-1 text-[15px] font-bold leading-[22px] text-[#F5F5F5]">Drape Pro</p>
          </div>
          <div className="rounded-[18px] bg-white/5 p-3">
            <p className="text-[12px] leading-[16px] font-medium text-[#9CA3AF]">Billing</p>
            <p className="mt-1 text-[15px] font-bold leading-[22px] text-[#F5F5F5]">$4.99 / month</p>
          </div>
        </div>

        <PrimaryButton>Manage Subscription</PrimaryButton>
      </Card>
    </AppShell>
  )
}
