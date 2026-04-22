import {
  Bell,
  Sparkles,
  Briefcase,
  Heart,
  CalendarDays,
} from "lucide-react"
import { motion } from "framer-motion"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { SectionHeader } from "../components/SectionHeader"
import { OutfitCard } from "../components/OutfitCard"
import { quickActions, outfitCards } from "../lib/mockData"
import { PrimaryButton } from "../components/PrimaryButton"

const iconMap: Record<string, JSX.Element> = {
  Work: <Briefcase size={18} />,
  "Date Night": <Heart size={18} />,
  Weekend: <Sparkles size={18} />,
  Event: <CalendarDays size={18} />,
}

export default function Home() {
  return (
    <AppShell>
      <header className="mb-6 flex items-start justify-between pt-4">
        <div>
          <p className="text-base text-[#A8AFBE]">Good morning,</p>
          <h1 className="text-[34px] font-bold leading-none tracking-[-0.5px]">
            Alex
          </h1>
        </div>

        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#F6F3EE]">
          <Bell size={18} />
        </button>
      </header>

      <Card elevated gradient className="rounded-[28px]">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="text-[18px] font-semibold">Today&apos;s Look</h2>
            <p className="text-sm text-[#A8AFBE]">Smart casual</p>
          </div>

          <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#A8AFBE]">
            23°C
          </div>
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
          <PrimaryButton>View Look</PrimaryButton>

          <button className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 text-sm text-[#F6F3EE] transition active:scale-[0.98]">
            Regenerate
          </button>
        </div>
      </Card>

      <section className="mt-5">
        <SectionHeader title="Quick Actions" actionLabel="See all" />

        <div className="flex gap-3 overflow-x-auto pb-1">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="flex h-[76px] min-w-[76px] flex-col items-center justify-center gap-2 rounded-[22px] border border-white/8 bg-[#151922] text-[#F6F3EE]"
            >
              <span className="text-[#C8A96A]">{iconMap[action.label]}</span>
              <span className="text-[12px]">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
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
              Try tonal dressing today — layering similar shades creates a
              cleaner silhouette and makes the whole look feel more intentional
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
