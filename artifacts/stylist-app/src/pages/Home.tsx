import { Sparkles, Package, CalendarDays, ChevronRight, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { NotificationBell } from "../components/NotificationCenter"
import { SectionHeader } from "../components/SectionHeader"
import { OutfitCard } from "../components/OutfitCard"
import { TonightModeSheet } from "../components/TonightModeSheet"
import { outfitCards } from "../lib/mockData"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { usePlannedEvents } from "../hooks/usePlannedEvents"

const BADGE = {
  high:         { label: "High match", color: "#5F8F7F", bg: "rgba(95,143,127,0.18)"  },
  safe:         { label: "Safe",       color: "#A8B0B8", bg: "rgba(168,176,184,0.16)" },
  experimental: { label: "Bold pick",  color: "#C8A96A", bg: "rgba(200,169,106,0.18)" },
} as const

export default function Home() {
  const navigate = useNavigate()
  const [showTonightMode, setShowTonightMode] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const { outfits } = useTimelineOutfits()
  const { items: incoming } = useIncomingItems()
  const { events } = usePlannedEvents()

  const todayOutfit = outfits[today]

  const nextDelivery = [...incoming]
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .find((i) => new Date(i.deliveryDate) >= new Date(today))

  const nextEvent = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .find((e) => new Date(e.date) >= new Date(today))

  function daysUntil(dateStr: string): number {
    const t = new Date(); t.setHours(0, 0, 0, 0)
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
  }

  const todayBadge = todayOutfit ? BADGE[todayOutfit.confidence] : null

  return (
    <>
      <AppShell>
        {/* ── Header ── */}
        <header className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[15px] leading-[22px] text-[#A8B0B8]">Good morning,</p>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.03em] text-[#F5F5F5]">
              Alex
            </h1>
          </div>
          <NotificationBell />
        </header>

        {/* ── Primary CTA ── */}
        <button
          onClick={() => navigate("/timeline")}
          className="mb-3 flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#3F6F73] text-base font-bold tracking-[-0.01em] text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] transition-[transform] duration-[160ms] active:scale-[0.97]"
        >
          <CalendarDays size={18} />
          Plan My Month
        </button>

        <button
          onClick={() => navigate("/timeline")}
          className="mb-6 flex h-[52px] w-full items-center justify-center rounded-[18px] border border-[rgba(168,176,184,0.28)] text-[15px] font-semibold text-[#F5F5F5] transition-[transform] duration-[160ms] active:scale-[0.97]"
        >
          Open Timeline
        </button>

        {/* ── Quick-glance cards ── */}
        {(nextDelivery || nextEvent) && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            {nextDelivery && (
              <button
                onClick={() => navigate("/incoming-items")}
                className="rounded-[24px] border border-white/6 bg-[#2A3645] p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <Package size={16} className="mb-2 text-[#C8A96A]" />
                <p className="text-[12px] leading-[16px] font-medium text-[#9CA3AF]">Next delivery</p>
                <p className="mt-0.5 truncate text-[15px] font-bold leading-[22px] text-[#F5F5F5]">
                  {nextDelivery.name}
                </p>
                <p className="text-[12px] leading-[16px] font-medium text-[#C8A96A]">
                  {daysUntil(nextDelivery.deliveryDate) <= 0
                    ? "Today"
                    : `${daysUntil(nextDelivery.deliveryDate)}d away`}
                </p>
              </button>
            )}
            {nextEvent && (
              <button
                onClick={() => navigate("/plan-ahead")}
                className="rounded-[24px] border border-white/6 bg-[#2A3645] p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <CalendarDays size={16} className="mb-2 text-[#3F6F73]" />
                <p className="text-[12px] leading-[16px] font-medium text-[#9CA3AF]">Next event</p>
                <p className="mt-0.5 truncate text-[15px] font-bold leading-[22px] text-[#F5F5F5]">
                  {nextEvent.name}
                </p>
                <p className="text-[12px] leading-[16px] font-medium text-[#3F6F73]">
                  {daysUntil(nextEvent.date) === 0
                    ? "Today"
                    : `${daysUntil(nextEvent.date)}d away`}
                </p>
              </button>
            )}
          </div>
        )}

        {/* ── Today's Look hero card ── */}
        {todayOutfit ? (
          <Card hero gradient className="mb-6">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-bold leading-[22px]">Today&apos;s Look</h2>
                <p className="text-[15px] leading-[22px] text-[#A8B0B8]">{todayOutfit.name}</p>
              </div>
              {todayBadge && (
                <span
                  className="inline-flex h-7 items-center rounded-full px-2.5 text-[12px] font-bold"
                  style={{ color: todayBadge.color, backgroundColor: todayBadge.bg }}
                >
                  {todayBadge.label}
                </span>
              )}
            </div>

            <div className="mb-4 grid h-[160px] grid-cols-2 gap-1 overflow-hidden rounded-[20px]">
              {todayOutfit.items.slice(0, 4).map((item, i) => (
                <img key={i} src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/timeline")}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#3F6F73] text-base font-bold text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                View on Timeline <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setShowTonightMode(true)}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[18px] border border-[#C8A96A]/25 bg-[#C8A96A]/8 text-[15px] font-semibold text-[#C8A96A] transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <Moon size={15} />
                Tonight Mode
              </button>
            </div>
          </Card>
        ) : (
          <Card hero gradient className="mb-6">
            <div className="mb-3">
              <h2 className="text-[17px] font-bold leading-[22px]">Today&apos;s Look</h2>
              <p className="text-[15px] leading-[22px] text-[#A8B0B8]">Smart casual</p>
            </div>

            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="mb-4 flex h-[170px] items-center justify-center overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_60%)]"
            >
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
                alt="Featured outfit"
                className="h-full w-full object-cover opacity-90"
              />
            </motion.div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/timeline")}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#3F6F73] text-base font-bold text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <Sparkles size={16} />
                Generate Today&apos;s Look
              </button>

              <button
                onClick={() => setShowTonightMode(true)}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[18px] border border-[#C8A96A]/25 bg-[#C8A96A]/8 text-[15px] font-semibold text-[#C8A96A] transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <Moon size={15} />
                Tonight Mode
              </button>
            </div>
          </Card>
        )}

        {/* ── Recent Looks ── */}
        <section className="mb-6">
          <SectionHeader title="Recent Looks" actionLabel="See all" />
          <div className="flex gap-4 overflow-x-auto pb-1">
            {outfitCards.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                title={outfit.title}
                subtitle={outfit.subtitle}
                image={outfit.image}
                compact
              />
            ))}
          </div>
        </section>

        {/* ── Insight cards ── */}
        <Card className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[17px] font-bold leading-[22px]">
                6 items unworn in 90 days
              </h3>
              <p className="mt-1 text-[15px] leading-[22px] text-[#A8B0B8]">
                Rediscover pieces already in your wardrobe
              </p>
            </div>
            <button className="mt-0.5 shrink-0 rounded-full bg-[#3F6F73]/15 px-3 py-1.5 text-[12px] font-bold text-[#3F6F73]">
              Style Them
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-[17px] font-bold leading-[22px]">Daily Styling Insight</h3>
              <p className="mt-2 text-[15px] leading-[22px] text-[#A8B0B8]">
                Try tonal dressing today — layering similar shades creates a cleaner silhouette and
                makes the whole look feel more intentional
              </p>
            </div>
            <div className="mt-0.5 text-[#C8A96A]">
              <Sparkles size={18} />
            </div>
          </div>
        </Card>
      </AppShell>

      <AnimatePresence>
        {showTonightMode && (
          <TonightModeSheet onClose={() => setShowTonightMode(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
