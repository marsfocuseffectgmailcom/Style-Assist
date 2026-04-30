import { User, Ruler, Shirt, CreditCard, ChevronRight, Heart, Archive, BarChart2, RotateCcw, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { AppShell } from "../components/AppShell"
import { PrimaryButton } from "../components/PrimaryButton"
import { Card } from "../components/Card"
import { usePersonalisation } from "../lib/usePersonalisation"
import type { StyleDirection } from "../lib/usePersonalisation"
import { useWardrobeCapture } from "../hooks/useWardrobeCapture"

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

const CLEAR_WINDOW_MS = 2400

function StyleMemoryCard() {
  const { store, setStyleDirection, resetPersonalisation } = usePersonalisation()
  const [, forceUpdate] = useState(0)

  // Derived directly from the store — no separate local state needed
  const justCleared = !!store.clearedAt && (Date.now() - new Date(store.clearedAt).getTime()) < CLEAR_WINDOW_MS

  // Schedule a re-render when the clear window expires so the button reverts
  useEffect(() => {
    if (!justCleared) return
    const remaining = CLEAR_WINDOW_MS - (Date.now() - new Date(store.clearedAt!).getTime())
    const t = setTimeout(() => forceUpdate((n) => n + 1), remaining + 50)
    return () => clearTimeout(t)
  }, [store.clearedAt, justCleared])

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
      <div className="flex gap-2 mb-5" role="group" aria-label="Style direction">
        {DIRECTIONS.map((d) => {
          const active = store.styleDirection === d.value
          return (
            <button
              key={d.value}
              onClick={() => setStyleDirection(d.value)}
              aria-pressed={active}
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
        style={{ color: justCleared ? "#3F6F73" : "#AABBC0" }}
      >
        {justCleared ? "Style memory cleared" : "Reset style memory"}
      </button>
    </Card>
  )
}

const profileSections = [
  {
    id: 1,
    icon: <Ruler size={18} className="text-[#C8A96A]" />,
    title: "Body Profile",
    subtitle: "Height, sizing, and fit",
    href: "/profile/body",
  },
  {
    id: 2,
    icon: <Shirt size={18} className="text-[#C8A96A]" />,
    title: "Style Preferences",
    subtitle: "Colours, fabrics, and direction",
    href: "/profile/style",
  },
  {
    id: 3,
    icon: <CreditCard size={18} className="text-[#C8A96A]" />,
    title: "Subscription",
    subtitle: "Your plan and payment",
    href: "/profile/subscription",
  },
  {
    id: 4,
    icon: <Heart size={18} className="text-[#C8A96A]" />,
    title: "Saved Products",
    subtitle: "Saved picks",
    href: "/saved-products",
  },
  {
    id: 5,
    icon: <Archive size={18} className="text-[#A8B0B8]" />,
    title: "Removed Items",
    subtitle: "Items you've put aside",
    href: "/profile/removed-items",
  },
  {
    id: 6,
    icon: <BarChart2 size={18} className="text-[#3F6F73]" />,
    title: "Usage Stats",
    subtitle: "How you're using the app",
    href: "/profile/analytics",
  },
]

export default function Profile() {
  const { items: capturedItems } = useWardrobeCapture()

  const itemCount   = capturedItems.length
  const outfitCount = (() => {
    try {
      const raw = localStorage.getItem("style-assist-timeline")
      if (!raw) return 0
      return Object.keys(JSON.parse(raw) as Record<string, unknown>).length
    } catch {
      return 0
    }
  })()

  const activeSince = (() => {
    const oldest = capturedItems
      .map((i) => i.addedAt ?? "")
      .filter(Boolean)
      .sort()[0]
    if (!oldest) return null
    const d = new Date(oldest)
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
  })()

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
              Your style, your settings
            </p>
          </div>
        </div>
      </header>

      {/* ── Wardrobe summary card ── */}
      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[14px] bg-white/5 p-3 text-center">
            <p className="text-[22px] font-extrabold tracking-[-0.04em] text-[#F5F5F5]">
              {itemCount}
            </p>
            <p className="text-[11px] font-medium text-[#6B8490] leading-tight mt-0.5">
              {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="rounded-[14px] bg-white/5 p-3 text-center">
            <p className="text-[22px] font-extrabold tracking-[-0.04em] text-[#F5F5F5]">
              {outfitCount}
            </p>
            <p className="text-[11px] font-medium text-[#6B8490] leading-tight mt-0.5">
              {outfitCount === 1 ? "outfit" : "outfits"}
            </p>
          </div>
          <div className="rounded-[14px] bg-white/5 p-3 text-center">
            <p className="text-[22px] font-extrabold tracking-[-0.04em] text-[#F5F5F5]">
              {activeSince ?? "—"}
            </p>
            <p className="text-[11px] font-medium text-[#6B8490] leading-tight mt-0.5">
              since
            </p>
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
          Every feature. No limits.
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
