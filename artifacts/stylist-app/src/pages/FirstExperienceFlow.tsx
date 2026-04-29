import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, X, Sparkles, Package, CalendarDays } from "lucide-react"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { useNotifications } from "../hooks/useNotifications"
import { wardrobeItems } from "../lib/mockData"
import { generateOutfits, generateMonthPlan } from "../lib/outfitGenerator"
import type { GeneratedOutfit } from "../lib/outfitGenerator"
import type { TimelineOutfit } from "../lib/types"

const today = new Date().toISOString().slice(0, 10)

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", { day: "numeric", month: "short" })
}

const QUICK_WARDROBE = [
  {
    id: "qa1",
    name: "White Shirt",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=70",
  },
  {
    id: "qa2",
    name: "Midi Skirt",
    image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=300&q=70",
  },
  {
    id: "qa3",
    name: "Ankle Boots",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=70",
  },
  {
    id: "qa4",
    name: "Denim Jacket",
    image: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=300&q=70",
  },
  {
    id: "qa5",
    name: "Knit Cardigan",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=300&q=70",
  },
  {
    id: "qa6",
    name: "Wide Trousers",
    image: "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=300&q=70",
  },
]

type Step =
  | "today-outfit"
  | "quick-swap"
  | "wardrobe-add"
  | "delivery-add"
  | "delivery-unlocks"
  | "plan-month"
  | "all-set"

const STEP_ORDER_DEFAULT: Step[] = [
  "today-outfit",
  "wardrobe-add",
  "delivery-add",
  "delivery-unlocks",
  "plan-month",
  "all-set",
]

const confidenceLabel: Record<string, { label: string; color: string }> = {
  high: { label: "High match", color: "#5F8F7F" },
  safe: { label: "Safe pick", color: "#C8A96A" },
  experimental: { label: "Bold pick", color: "#7FA9A3" },
}

function OutfitMini({ items }: { items: { image: string; name: string }[] }) {
  const shown = items.slice(0, 4)
  if (shown.length === 0) return <div className="h-full w-full bg-[#243140]" />
  if (shown.length === 1)
    return <img src={shown[0].image} alt="" className="h-full w-full object-cover" />
  return (
    <div className="grid h-full w-full grid-cols-2 gap-0.5">
      {shown.map((it, i) => (
        <img key={i} src={it.image} alt="" className="h-full w-full object-cover" />
      ))}
    </div>
  )
}

export function FirstExperienceFlow({ onComplete }: { onComplete: () => void }) {
  const { outfits, saveOutfit, bulkFill } = useTimelineOutfits()
  const { addItem, items: incomingItems } = useIncomingItems()
  const { addNotification, requestPermission } = useNotifications()

  const todayOutfit = outfits[today]

  const alternatives = useMemo(
    () => generateOutfits(today, wardrobeItems, incomingItems).slice(0, 4),
    [incomingItems]
  )

  const [steps, setSteps] = useState<Step[]>(STEP_ORDER_DEFAULT)
  const [stepIdx, setStepIdx] = useState(0)
  const [selectedSwap, setSelectedSwap] = useState<string | null>(
    alternatives[0]?.id ?? null
  )
  const [selectedWardrobe, setSelectedWardrobe] = useState<Set<string>>(new Set())
  const [deliveryDays, setDeliveryDays] = useState<3 | 7 | 14>(7)
  const [addedDelivery, setAddedDelivery] = useState<{ name: string; date: string } | null>(null)
  const [planning, setPlanning] = useState(false)
  const [planDone, setPlanDone] = useState(false)

  const currentStep = steps[stepIdx]
  const totalMain = STEP_ORDER_DEFAULT.length

  function advance() {
    if (stepIdx < steps.length - 1) {
      setStepIdx((i) => i + 1)
    } else {
      finishFTE()
    }
  }

  function requestSwap() {
    const withSwap: Step[] = [
      "today-outfit",
      "quick-swap",
      "wardrobe-add",
      "delivery-add",
      "delivery-unlocks",
      "plan-month",
      "all-set",
    ]
    setSteps(withSwap)
    setStepIdx(1)
  }

  function applySwap() {
    const chosen = alternatives.find((a) => a.id === selectedSwap)
    if (chosen && todayOutfit) {
      saveOutfit({
        ...todayOutfit,
        name: chosen.name,
        items: chosen.items,
        confidence: chosen.confidence,
        tags: chosen.tags,
      })
    }
    advance()
  }

  function toggleWardrobe(id: string) {
    setSelectedWardrobe((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddDelivery() {
    const dateStr = daysFromNow(deliveryDays)
    addItem({
      name: "White Linen Shirt",
      category: "top",
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80",
      styleTags: ["minimal", "classic"],
      deliveryDate: dateStr,
      storeName: "ASOS",
    })
    setAddedDelivery({ name: "White Linen Shirt", date: dateStr })
    addNotification({
      type: "delivery-unlocks",
      icon: "package",
      title: "Delivery unlocks new outfits",
      body: `Your White Linen Shirt arrives on ${fmtDate(dateStr)} — new outfit combos will unlock automatically.`,
    })
    advance()
  }

  async function handlePlanMonth() {
    setPlanning(true)
    const existingDates = new Set(Object.keys(outfits))
    const generated = generateMonthPlan(wardrobeItems, incomingItems, existingDates)
    await new Promise((r) => setTimeout(r, 1500))
    bulkFill(generated)
    addNotification({
      type: "week-ready",
      icon: "sparkles",
      title: "Your week is ready",
      body: "28 days of outfits planned using your wardrobe and incoming deliveries.",
    })
    setPlanDone(true)
    setPlanning(false)
    await new Promise((r) => setTimeout(r, 800))
    advance()
  }

  function finishFTE() {
    const tomorrow = daysFromNow(1)
    if (outfits[tomorrow]) {
      addNotification({
        type: "tomorrow-outfit",
        icon: "calendar",
        title: "Tomorrow's outfit is ready",
        body: `${outfits[tomorrow].name} — your look for tomorrow is all set.`,
      })
    }
    onComplete()
  }

  async function handlePermission() {
    await requestPermission()
    finishFTE()
  }

  const sheetContent = () => {
    switch (currentStep) {
      case "today-outfit":
        return <TodayOutfitStep outfit={todayOutfit} onKeep={advance} onSwap={requestSwap} />
      case "quick-swap":
        return (
          <QuickSwapStep
            alternatives={alternatives}
            selected={selectedSwap}
            onSelect={setSelectedSwap}
            onApply={applySwap}
          />
        )
      case "wardrobe-add":
        return (
          <WardrobeAddStep
            selected={selectedWardrobe}
            onToggle={toggleWardrobe}
            onNext={advance}
          />
        )
      case "delivery-add":
        return (
          <DeliveryAddStep
            days={deliveryDays}
            onDaysChange={setDeliveryDays}
            onAdd={handleAddDelivery}
          />
        )
      case "delivery-unlocks":
        return <DeliveryUnlocksStep delivery={addedDelivery} onNext={advance} />
      case "plan-month":
        return (
          <PlanMonthStep
            planning={planning}
            done={planDone}
            onPlan={handlePlanMonth}
          />
        )
      case "all-set":
        return <AllSetStep onAllow={handlePermission} onSkip={finishFTE} />
    }
  }

  const stepNumber = STEP_ORDER_DEFAULT.indexOf(
    steps.includes(currentStep) && currentStep !== "quick-swap"
      ? currentStep
      : "wardrobe-add"
  ) + 1

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={() => currentStep === "all-set" && finishFTE()}
      />

      <motion.div
        layout
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 36, stiffness: 360 }}
        className="relative rounded-t-[28px] bg-[#2A3645] px-5 pb-10 pt-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEP_ORDER_DEFAULT.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i < stepNumber ? "bg-[#3F6F73] w-5" : i === stepNumber - 1 ? "bg-[#3F6F73] w-5" : "bg-white/15 w-3"
                }`}
              />
            ))}
          </div>
          <button
            onClick={finishFTE}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-[#6B8490]"
          >
            <X size={14} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {sheetContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function TodayOutfitStep({
  outfit,
  onKeep,
  onSwap,
}: {
  outfit: TimelineOutfit | undefined
  onKeep: () => void
  onSwap: () => void
}) {
  const cfg = outfit ? confidenceLabel[outfit.confidence] : null
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3F6F73]">
        Your outfit for today
      </p>
      <h3 className="mb-4 text-[22px] font-bold tracking-[-0.4px] text-[#F2F4F5]">
        {outfit ? "Looking good." : "Let's start."}
      </h3>

      {outfit ? (
        <div className="mb-5 flex items-center gap-3 rounded-[20px] border border-white/10 bg-[#243140] p-3">
          <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-[#1C2A37]">
            <OutfitMini items={outfit.items} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#F2F4F5]">{outfit.name}</p>
            <p className="mt-0.5 text-[12px] text-[#6B8490]">
              {outfit.items.length} pieces selected
            </p>
            {cfg && (
              <span
                className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
              >
                {cfg.label}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-[20px] border border-dashed border-white/15 bg-white/3 py-6 text-center">
          <p className="text-sm text-[#6B8490]">Generating your first outfit…</p>
        </div>
      )}

      <button
        onClick={onKeep}
        className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.97]"
      >
        <Check size={16} />
        Looks great, keep it
      </button>
      <button
        onClick={onSwap}
        className="w-full rounded-[18px] border border-white/10 bg-white/5 py-3.5 text-[14px] text-[#AABBC0] transition active:scale-[0.97]"
      >
        Try a different look
      </button>
    </div>
  )
}

function QuickSwapStep({
  alternatives,
  selected,
  onSelect,
  onApply,
}: {
  alternatives: GeneratedOutfit[]
  selected: string | null
  onSelect: (id: string) => void
  onApply: () => void
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3F6F73]">
        Quick swap
      </p>
      <h3 className="mb-4 text-[22px] font-bold tracking-[-0.4px] text-[#F2F4F5]">
        Pick an alternative.
      </h3>

      <div className="mb-4 max-h-[280px] space-y-2 overflow-y-auto">
        {alternatives.map((alt) => {
          const cfg = confidenceLabel[alt.confidence]
          const isSelected = selected === alt.id
          return (
            <button
              key={alt.id}
              onClick={() => onSelect(alt.id)}
              className={`flex w-full items-center gap-3 rounded-[18px] border p-3 text-left transition active:scale-[0.98] ${
                isSelected
                  ? "border-[#3F6F73]/40 bg-[#3F6F73]/8"
                  : "border-white/8 bg-[#243140]"
              }`}
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-[#1C2A37]">
                <OutfitMini items={alt.items} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#F2F4F5]">{alt.name}</p>
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
                >
                  {cfg.label}
                </span>
              </div>
              {isSelected && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3F6F73]">
                  <Check size={12} className="text-white" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={onApply}
        disabled={!selected}
        className="w-full rounded-[18px] bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.97] disabled:opacity-50"
      >
        Use this look
      </button>
    </div>
  )
}

function WardrobeAddStep({
  selected,
  onToggle,
  onNext,
}: {
  selected: Set<string>
  onToggle: (id: string) => void
  onNext: () => void
}) {
  const enough = selected.size >= 3
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3F6F73]">
        Your wardrobe
      </p>
      <h3 className="mb-1 text-[22px] font-bold tracking-[-0.4px] text-[#F2F4F5]">
        Tap items you own.
      </h3>
      <p className="mb-4 text-[13px] text-[#6B8490]">
        Select at least 3 for better outfit matches.{" "}
        <span style={{ color: enough ? "#5F8F7F" : "#6B8490" }}>
          {selected.size}/3 selected
        </span>
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2.5">
        {QUICK_WARDROBE.map((item) => {
          const active = selected.has(item.id)
          return (
            <motion.button
              key={item.id}
              onClick={() => onToggle(item.id)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center gap-1.5"
            >
              <div
                className={`relative h-[72px] w-full overflow-hidden rounded-[14px] border-2 transition ${
                  active ? "border-[#3F6F73]" : "border-transparent"
                }`}
              >
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                {active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#3F6F73]/30">
                    <Check size={18} className="text-white drop-shadow" />
                  </div>
                )}
              </div>
              <span className="text-center text-[10px] text-[#AABBC0]">{item.name}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {enough && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onNext}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.97]"
          >
            Next <ChevronRight size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

function DeliveryAddStep({
  days,
  onDaysChange,
  onAdd,
}: {
  days: 3 | 7 | 14
  onDaysChange: (d: 3 | 7 | 14) => void
  onAdd: () => void
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C8A96A]">
        Incoming delivery
      </p>
      <h3 className="mb-1 text-[22px] font-bold tracking-[-0.4px] text-[#F2F4F5]">
        Track an order.
      </h3>
      <p className="mb-4 text-[13px] text-[#6B8490]">
        Items you've ordered unlock new outfits after they arrive.
      </p>

      <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-[#C8A96A]/25 bg-[#C8A96A]/6 p-3.5">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-[#243140]">
          <img
            src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=70"
            alt="White Linen Shirt"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#F2F4F5]">White Linen Shirt</p>
          <p className="text-[12px] text-[#6B8490]">ASOS · Ready to add</p>
        </div>
        <Package size={16} className="ml-auto shrink-0 text-[#C8A96A]" />
      </div>

      <p className="mb-2 text-[12px] font-medium text-[#AABBC0]">When does it arrive?</p>
      <div className="mb-5 flex gap-2">
        {([3, 7, 14] as const).map((d) => (
          <button
            key={d}
            onClick={() => onDaysChange(d)}
            className={`flex-1 rounded-[14px] border py-2.5 text-[13px] font-semibold transition active:scale-[0.97] ${
              days === d
                ? "border-[#3F6F73]/40 bg-[#3F6F73]/15 text-[#3F6F73]"
                : "border-white/10 bg-white/5 text-[#AABBC0]"
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="w-full rounded-[18px] bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.97]"
      >
        Add delivery
      </button>
    </div>
  )
}

const UNLOCK_OUTFITS = [
  {
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=200&q=60",
    ],
  },
  {
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=200&q=60",
    ],
  },
  {
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=200&q=60",
    ],
  },
]

function DeliveryUnlocksStep({
  delivery,
  onNext,
}: {
  delivery: { name: string; date: string } | null
  onNext: () => void
}) {
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    const timers = UNLOCK_OUTFITS.map((_, i) =>
      setTimeout(() => setVisible(i + 1), 400 + i * 350)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C8A96A]">
        Delivery unlocks
      </p>
      <h3 className="mb-1 text-[22px] font-bold tracking-[-0.4px] text-[#F2F4F5]">
        New outfits after delivery.
      </h3>
      <p className="mb-5 text-[13px] text-[#6B8490]">
        Once your {delivery?.name ?? "item"} arrives on{" "}
        <span className="font-medium text-[#C8A96A]">
          {delivery ? fmtDate(delivery.date) : ""}
        </span>
        , these combos unlock automatically.
      </p>

      <div className="mb-5 flex items-center gap-3">
        <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[12px] bg-[#243140]">
          <img
            src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=200&q=60"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25 }}
              className="h-1.5 w-1.5 rounded-full bg-[#C8A96A]"
            />
          ))}
        </div>

        <div className="flex gap-2">
          {UNLOCK_OUTFITS.map((o, i) => (
            <AnimatePresence key={i}>
              {i < visible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className="h-[52px] w-[52px] overflow-hidden rounded-[12px] bg-[#243140]"
                >
                  <div className="grid h-full w-full grid-cols-2 gap-0.5">
                    {o.images.map((src, j) => (
                      <img key={j} src={src} alt="" className="h-full w-full object-cover" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: visible >= 3 ? 1 : 0 }}
        className="mb-5 rounded-[14px] bg-[#5F8F7F]/10 px-4 py-2.5 text-[13px] font-medium text-[#5F8F7F]"
      >
        3 new outfit combos will unlock after {delivery ? fmtDate(delivery.date) : "delivery"}
      </motion.div>

      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.97]"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  )
}

function PlanMonthStep({
  planning,
  done,
  onPlan,
}: {
  planning: boolean
  done: boolean
  onPlan: () => void
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3F6F73]">
        Plan your month
      </p>
      <h3 className="mb-1 text-[22px] font-bold tracking-[-0.4px] text-[#F2F4F5]">
        {done ? "28 days planned." : "Fill your whole month."}
      </h3>
      <p className="mb-6 text-[13px] text-[#6B8490]">
        {done
          ? "Your outfits are ready — nothing left to think about."
          : "One tap fills 28 days of outfits using your wardrobe and incoming deliveries."}
      </p>

      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 flex items-center gap-3 rounded-[18px] bg-[#5F8F7F]/10 p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5F8F7F]/20">
            <Check size={20} className="text-[#5F8F7F]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#5F8F7F]">28 days planned</p>
            <p className="text-[12px] text-[#6B8490]">Ready to view your timeline</p>
          </div>
        </motion.div>
      ) : (
        <div className="mb-5 grid grid-cols-4 gap-1.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-[10px] border border-white/8 bg-[#243140]"
            />
          ))}
        </div>
      )}

      <button
        onClick={onPlan}
        disabled={planning || done}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(63,111,115,0.28)] transition active:scale-[0.97] disabled:opacity-60"
      >
        {planning ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
            />
            Planning 28 days…
          </>
        ) : done ? (
          <>
            <Check size={16} />
            Done — let&apos;s go
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Plan My Month
          </>
        )}
      </button>
    </div>
  )
}

function AllSetStep({ onAllow, onSkip }: { onAllow: () => void; onSkip: () => void }) {
  const [asked, setAsked] = useState(false)
  return (
    <div>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5F8F7F]/15">
        <Check size={26} className="text-[#5F8F7F]" />
      </div>
      <h3 className="mb-1 text-[22px] font-bold tracking-[-0.4px] text-[#F2F4F5]">
        You&apos;re all set.
      </h3>
      <p className="mb-5 text-[13px] text-[#6B8490]">
        Your outfits are planned, your delivery is tracked, and your month is ready. Never
        wonder what to wear again.
      </p>

      {!asked ? (
        <>
          <div className="mb-4 flex items-start gap-3 rounded-[16px] border border-white/8 bg-[#243140] p-4">
            <CalendarDays size={18} className="mt-0.5 shrink-0 text-[#3F6F73]" />
            <div>
              <p className="text-[13px] font-semibold text-[#F2F4F5]">Get reminders</p>
              <p className="mt-0.5 text-[12px] text-[#6B8490]">
                &ldquo;Tomorrow&rsquo;s outfit is ready&rdquo; · &ldquo;Delivery unlocks new looks&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={() => { setAsked(true); onAllow() }}
            className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.97]"
          >
            Allow notifications
          </button>
          <button
            onClick={onSkip}
            className="w-full rounded-[18px] border border-white/10 bg-white/5 py-3.5 text-[14px] text-[#6B8490] transition active:scale-[0.97]"
          >
            Skip for now
          </button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[16px] bg-[#5F8F7F]/10 p-4 text-center text-[13px] text-[#5F8F7F]"
        >
          Notifications enabled — we&apos;ll keep you in the loop.
        </motion.div>
      )}
    </div>
  )
}
