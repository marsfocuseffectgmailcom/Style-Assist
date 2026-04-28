import { Sparkles, Package, CalendarDays, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { NotificationBell } from "../components/NotificationCenter"
import { SectionHeader } from "../components/SectionHeader"
import { OutfitCard } from "../components/OutfitCard"
import { outfitCards } from "../lib/mockData"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { usePlannedEvents } from "../hooks/usePlannedEvents"
import { formatEventDate } from "../lib/deliveryStatus"

export default function Home() {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const { outfits } = useTimelineOutfits()
  const { items: incoming } = useIncomingItems()
  const { events } = usePlannedEvents()

  const todayOutfit = outfits[today]

  const nextDelivery = [...incoming]
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .find((i) => new Date(i.deliveryDate) >= new Date(new Date().toISOString().slice(0, 10)))

  const nextEvent = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .find((e) => new Date(e.date) >= new Date(today))

  function daysUntil(dateStr: string): number {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <AppShell>
      <header className="mb-6 flex items-start justify-between pt-4">
        <div>
          <p className="text-base text-[#A8AFBE]">Good morning,</p>
          <h1 className="text-[34px] font-bold leading-none tracking-[-0.5px]">Alex</h1>
        </div>
        <NotificationBell />
      </header>

      <button
        onClick={() => navigate("/timeline")}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(255,77,141,0.28)] transition active:scale-[0.97]"
      >
        <CalendarDays size={17} />
        Plan My Month
      </button>

      <button
        onClick={() => navigate("/timeline")}
        className="mb-5 h-11 w-full rounded-[18px] border border-white/10 bg-white/5 text-sm text-[#F6F3EE] transition active:scale-[0.98]"
      >
        Open Timeline
      </button>

      {(nextDelivery || nextEvent) && (
        <div className="mb-5 grid grid-cols-2 gap-3">
          {nextDelivery && (
            <button
              onClick={() => navigate("/incoming-items")}
              className="rounded-[20px] border border-white/8 bg-[#151922] p-3 text-left transition active:scale-[0.97]"
            >
              <Package size={16} className="mb-2 text-[#C8A96A]" />
              <p className="text-xs text-[#6F7788]">Next delivery</p>
              <p className="mt-0.5 truncate text-[13px] font-semibold text-[#F6F3EE]">
                {nextDelivery.name}
              </p>
              <p className="text-[11px] text-[#C8A96A]">
                {daysUntil(nextDelivery.deliveryDate) <= 0
                  ? "Today"
                  : `${daysUntil(nextDelivery.deliveryDate)}d away`}
              </p>
            </button>
          )}
          {nextEvent && (
            <button
              onClick={() => navigate("/plan-ahead")}
              className="rounded-[20px] border border-white/8 bg-[#151922] p-3 text-left transition active:scale-[0.97]"
            >
              <CalendarDays size={16} className="mb-2 text-[#FF4D8D]" />
              <p className="text-xs text-[#6F7788]">Next event</p>
              <p className="mt-0.5 truncate text-[13px] font-semibold text-[#F6F3EE]">
                {nextEvent.name}
              </p>
              <p className="text-[11px] text-[#FF4D8D]">
                {daysUntil(nextEvent.date) === 0 ? "Today" : `${daysUntil(nextEvent.date)}d away`}
              </p>
            </button>
          )}
        </div>
      )}

      {todayOutfit ? (
        <Card elevated gradient className="mb-5 rounded-[28px]">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-semibold">Today&apos;s Look</h2>
              <p className="text-sm text-[#A8AFBE]">{todayOutfit.name}</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                color: todayOutfit.confidence === "high" ? "#4ECFA8" : todayOutfit.confidence === "safe" ? "#C8A96A" : "#FF7A5C",
                backgroundColor: todayOutfit.confidence === "high" ? "rgba(78,207,168,0.12)" : todayOutfit.confidence === "safe" ? "rgba(200,169,106,0.12)" : "rgba(255,122,92,0.12)",
              }}
            >
              {todayOutfit.confidence === "high" ? "High match" : todayOutfit.confidence === "safe" ? "Safe" : "Bold pick"}
            </span>
          </div>

          <div className="mb-4 grid h-[160px] grid-cols-2 gap-1 overflow-hidden rounded-[20px]">
            {todayOutfit.items.slice(0, 4).map((item, i) => (
              <img key={i} src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ))}
          </div>

          <button
            onClick={() => navigate("/timeline")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] text-sm font-semibold text-white transition active:scale-[0.97]"
          >
            View on Timeline <ChevronRight size={15} />
          </button>
        </Card>
      ) : (
        <Card elevated gradient className="mb-5 rounded-[28px]">
          <div className="mb-3">
            <h2 className="text-[18px] font-semibold">Today&apos;s Look</h2>
            <p className="text-sm text-[#A8AFBE]">Smart casual</p>
          </div>

          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="mb-4 flex h-[170px] items-center justify-center overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_60%)]"
          >
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
              alt="Featured outfit"
              className="h-full w-full object-cover opacity-95"
            />
          </motion.div>

          <div className="space-y-2">
            <button
              onClick={() => navigate("/timeline")}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] text-sm font-semibold text-white transition active:scale-[0.97]"
            >
              <Sparkles size={15} />
              Generate Today&apos;s Look
            </button>

            <button
              onClick={() => navigate("/timeline")}
              className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 text-sm text-[#F6F3EE] transition active:scale-[0.98]"
            >
              Open Timeline
            </button>
          </div>
        </Card>
      )}

      <section className="mt-1">
        <SectionHeader title="Recent Looks" actionLabel="See all" />
        <div className="flex gap-3 overflow-x-auto pb-1">
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

      <Card className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold">
              You haven&apos;t worn 6 items in 90 days
            </h3>
            <p className="mt-1 text-sm text-[#A8AFBE]">
              Rediscover pieces already in your wardrobe
            </p>
          </div>
          <button className="rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] px-3 py-2 text-xs font-semibold text-white">
            Style Them
          </button>
        </div>
      </Card>

      <Card className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold">Daily Styling Insight</h3>
            <p className="mt-2 text-sm leading-6 text-[#A8AFBE]">
              Try tonal dressing today — layering similar shades creates a cleaner silhouette and
              makes the whole look feel more intentional
            </p>
          </div>
          <div className="mt-1 text-[#C8A96A]">
            <Sparkles size={18} />
          </div>
        </div>
      </Card>
    </AppShell>
  )
}
