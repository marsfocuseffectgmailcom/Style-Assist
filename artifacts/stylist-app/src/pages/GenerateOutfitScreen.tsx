import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Sparkles } from "lucide-react"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { wardrobeItems } from "../lib/mockData"
import { generateOutfits } from "../lib/outfitGenerator"
import type { GeneratedOutfit } from "../lib/outfitGenerator"
import type { TimelineOutfit } from "../lib/types"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

const confidenceConfig = {
  high: {
    label: "High match",
    desc: "Strong outfit — complete and well-balanced",
    color: "#4ECFA8",
    bg: "rgba(78,207,168,0.10)",
    border: "rgba(78,207,168,0.20)",
  },
  safe: {
    label: "Safe choice",
    desc: "Reliable, versatile outfit",
    color: "#C8A96A",
    bg: "rgba(200,169,106,0.10)",
    border: "rgba(200,169,106,0.20)",
  },
  experimental: {
    label: "Bold pick",
    desc: "A more daring combination",
    color: "#FF7A5C",
    bg: "rgba(255,122,92,0.10)",
    border: "rgba(255,122,92,0.20)",
  },
}

function OutfitCard({
  outfit,
  selected,
  onSelect,
}: {
  outfit: GeneratedOutfit
  selected: boolean
  onSelect: () => void
}) {
  const cfg = confidenceConfig[outfit.confidence]
  const shown = outfit.items.slice(0, 4)

  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      className={`w-full rounded-[24px] border p-4 text-left transition ${
        selected
          ? "border-[#FF4D8D]/50 bg-[#FF4D8D]/8"
          : "border-white/10 bg-[#151922]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-[80px] w-[80px] shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-[16px] bg-[#1A1F2B]">
          {shown.map((item, i) => (
            <img
              key={i}
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="flex-1 truncate text-[15px] font-semibold text-[#F6F3EE]">
              {outfit.name}
            </h3>
            {selected && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF4D8D]">
                <Check size={13} className="text-white" />
              </span>
            )}
          </div>

          <span
            className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>

          <p className="mt-1 text-xs text-[#6F7788]">{cfg.desc}</p>
        </div>
      </div>

      {outfit.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {outfit.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] text-[#A8AFBE]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        {outfit.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-[8px] bg-[#1A1F2B]">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </div>
            <span className="truncate text-xs text-[#A8AFBE]">{item.name}</span>
            {item.source === "suggestion" && (
              <span className="ml-auto shrink-0 rounded-full bg-[#C8A96A]/15 px-2 py-0.5 text-[9px] font-semibold text-[#C8A96A]">
                Incoming
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.button>
  )
}

export default function GenerateOutfitScreen() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const { saveOutfit } = useTimelineOutfits()
  const { items: incomingItems } = useIncomingItems()

  const outfits = useMemo(
    () => generateOutfits(date ?? "", wardrobeItems, incomingItems),
    [date, incomingItems]
  )

  const [selected, setSelected] = useState<string | null>(
    outfits.length > 0 ? outfits[0].id : null
  )

  function handleSave() {
    const outfit = outfits.find((o) => o.id === selected)
    if (!outfit || !date) return
    const tl: TimelineOutfit = {
      id: outfit.id,
      date,
      name: outfit.name,
      items: outfit.items,
      confidence: outfit.confidence,
      tags: outfit.tags,
      createdAt: new Date().toISOString(),
    }
    saveOutfit(tl)
    navigate("/timeline")
  }

  return (
    <AppShell>
      <header className="mb-5 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate("/timeline")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#A8AFBE] transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Generate Outfit</h1>
          <p className="text-xs text-[#6F7788]">{formatDate(date ?? "")}</p>
        </div>
      </header>

      {outfits.length === 0 ? (
        <Card className="py-10 text-center">
          <Sparkles size={28} className="mx-auto mb-3 text-[#6F7788]" />
          <p className="text-sm font-medium text-[#A8AFBE]">Not enough wardrobe items yet</p>
          <p className="mt-1 text-xs text-[#6F7788]">
            Add more items to your wardrobe to generate outfit combos
          </p>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-[13px] text-[#6F7788]">
            {outfits.length} outfit suggestion{outfits.length !== 1 ? "s" : ""} — tap to select
          </p>

          <div className="space-y-3 pb-6">
            {outfits.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                selected={selected === outfit.id}
                onSelect={() => setSelected(outfit.id)}
              />
            ))}
          </div>

          <div className="sticky bottom-[80px] pb-3">
            <button
              onClick={handleSave}
              disabled={!selected}
              className="w-full rounded-[20px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(255,77,141,0.28)] transition active:scale-[0.97] disabled:opacity-50"
            >
              Add to Timeline
            </button>
          </div>
        </>
      )}
    </AppShell>
  )
}
