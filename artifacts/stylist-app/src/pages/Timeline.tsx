import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Sparkles, X, Copy, MoveRight, Trash2, Package, ChevronRight, Moon } from "lucide-react"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { NotificationBell } from "../components/NotificationCenter"
import { FirstExperienceFlow } from "./FirstExperienceFlow"
import { TonightModeSheet } from "../components/TonightModeSheet"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { usePlannedEvents } from "../hooks/usePlannedEvents"
import { wardrobeItems } from "../lib/mockData"
import { generateMonthPlan } from "../lib/outfitGenerator"
import type { PlannedEvent, TimelineOutfit } from "../lib/types"

const FTE_KEY = "style-assist-fte-done"

type Range = 1 | 2 | 4

function getDays(range: Range): string[] {
  const days: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < range * 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function formatDay(dateStr: string): { weekday: string; day: string; month: string } {
  const d = new Date(dateStr)
  return {
    weekday: d.toLocaleDateString("en-AU", { weekday: "short" }),
    day: d.toLocaleDateString("en-AU", { day: "numeric" }),
    month: d.toLocaleDateString("en-AU", { month: "short" }),
  }
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10)
}

const confidenceLabel: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "High match", color: "#4ECFA8", bg: "rgba(78,207,168,0.12)" },
  safe: { label: "Safe", color: "#C8A96A", bg: "rgba(200,169,106,0.12)" },
  experimental: { label: "Bold pick", color: "#FF7A5C", bg: "rgba(255,122,92,0.12)" },
}

function OutfitCollage({ items }: { items: { image: string; name: string }[] }) {
  const shown = items.slice(0, 4)
  if (shown.length === 0) return <div className="h-full w-full bg-[#1A1F2B]" />
  if (shown.length === 1) {
    return <img src={shown[0].image} alt={shown[0].name} className="h-full w-full object-cover" />
  }
  return (
    <div className="grid h-full w-full grid-cols-2 gap-0.5">
      {shown.map((item, i) => (
        <img key={i} src={item.image} alt={item.name} className="h-full w-full object-cover" />
      ))}
    </div>
  )
}

type DatePickerSheetProps = {
  title: string
  excludeDate: string
  onSelect: (date: string) => void
  onClose: () => void
}

function DatePickerSheet({ title, excludeDate, onSelect, onClose }: DatePickerSheetProps) {
  const days = getDays(4).filter((d) => d !== excludeDate)
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative max-h-[70vh] overflow-y-auto rounded-t-[28px] bg-[#151922] px-5 pb-10 pt-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <button onClick={onClose} className="text-[#6F7788]">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2">
          {days.map((d) => {
            const { weekday, day, month } = formatDay(d)
            return (
              <button
                key={d}
                onClick={() => onSelect(d)}
                className="flex w-full items-center justify-between rounded-[16px] border border-white/8 bg-white/5 px-4 py-3 text-left transition active:scale-[0.98]"
              >
                <span className="text-sm font-medium text-[#F6F3EE]">
                  {weekday} {day} {month}
                </span>
                {isToday(d) && (
                  <span className="rounded-full bg-[#FF4D8D]/15 px-2 py-0.5 text-[10px] font-semibold text-[#FF4D8D]">
                    Today
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

type DayCardProps = {
  dateStr: string
  outfit: TimelineOutfit | undefined
  event: PlannedEvent | undefined
  onGenerate: () => void
  onRemove: () => void
  onDuplicate: () => void
  onMove: () => void
}

function DayCard({ dateStr, outfit, event, onGenerate, onRemove, onDuplicate, onMove }: DayCardProps) {
  const { weekday, day, month } = formatDay(dateStr)
  const today = isToday(dateStr)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[24px] border p-4 ${
        today ? "border-[#FF4D8D]/30 bg-[#151922]" : "border-white/8 bg-[#151922]"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[13px] font-semibold uppercase tracking-[0.06em] ${
                today ? "text-[#FF4D8D]" : "text-[#6F7788]"
              }`}
            >
              {weekday}
            </span>
            {today && (
              <span className="rounded-full bg-[#FF4D8D]/15 px-2 py-0.5 text-[10px] font-semibold text-[#FF4D8D]">
                Today
              </span>
            )}
          </div>
          <p className="text-[22px] font-bold leading-none tracking-[-0.5px] text-[#F6F3EE]">
            {day} <span className="text-[16px] font-medium text-[#A8AFBE]">{month}</span>
          </p>
        </div>
        {event && (
          <span className="rounded-full bg-[#C8A96A]/15 px-3 py-1 text-[11px] font-semibold text-[#C8A96A]">
            {event.name}
          </span>
        )}
      </div>

      {outfit ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[16px] bg-[#1A1F2B]">
              <OutfitCollage items={outfit.items} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#F6F3EE]">{outfit.name}</p>
              <p className="mt-0.5 text-xs text-[#6F7788]">
                {outfit.items.length} piece{outfit.items.length !== 1 ? "s" : ""}
              </p>
              <div className="mt-1.5">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    color: confidenceLabel[outfit.confidence]?.color,
                    backgroundColor: confidenceLabel[outfit.confidence]?.bg,
                  }}
                >
                  {confidenceLabel[outfit.confidence]?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onDuplicate}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-white/8 bg-white/5 py-2 text-[12px] text-[#A8AFBE] transition active:scale-[0.97]"
            >
              <Copy size={13} />
              Copy
            </button>
            <button
              onClick={onMove}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-white/8 bg-white/5 py-2 text-[12px] text-[#A8AFBE] transition active:scale-[0.97]"
            >
              <MoveRight size={13} />
              Move
            </button>
            <button
              onClick={onRemove}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-white/8 bg-white/5 py-2 text-[12px] text-[#FF7A5C] transition active:scale-[0.97]"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onGenerate}
          className="flex w-full items-center justify-between rounded-[16px] border border-dashed border-white/15 bg-white/3 px-4 py-3 transition active:scale-[0.98] hover:border-white/25"
        >
          <span className="text-sm text-[#6F7788]">No outfit planned yet</span>
          <span className="flex items-center gap-1 text-[12px] font-medium text-[#FF4D8D]">
            Generate <ChevronRight size={14} />
          </span>
        </button>
      )}
    </motion.div>
  )
}

export default function Timeline() {
  const navigate = useNavigate()
  const [range, setRange] = useState<Range>(1)
  const [planningMonth, setPlanningMonth] = useState(false)
  const [planDone, setPlanDone] = useState(false)
  const [sheetMode, setSheetMode] = useState<{ type: "move" | "duplicate"; date: string } | null>(null)
  const [showFTE, setShowFTE] = useState(() => localStorage.getItem(FTE_KEY) !== "true")
  const [showTonightMode, setShowTonightMode] = useState(false)

  const { outfits, saveOutfit, removeOutfit, moveOutfit, duplicateOutfit, bulkFill } =
    useTimelineOutfits()
  const { items: incomingItems } = useIncomingItems()
  const { events } = usePlannedEvents()

  const days = useMemo(() => getDays(range), [range])

  const eventsByDate = useMemo(() => {
    const map: Record<string, PlannedEvent> = {}
    events.forEach((e) => {
      map[e.date.slice(0, 10)] = e
    })
    return map
  }, [events])

  async function handlePlanMonth() {
    setPlanningMonth(true)
    setPlanDone(false)
    const existingDates = new Set(Object.keys(outfits))
    const generated = generateMonthPlan(wardrobeItems, incomingItems, existingDates)
    await new Promise((r) => setTimeout(r, 1600))
    bulkFill(generated)
    setPlanningMonth(false)
    setPlanDone(true)
    setRange(4)
  }

  function handleSheetSelect(toDate: string) {
    if (!sheetMode) return
    if (sheetMode.type === "move") {
      moveOutfit(sheetMode.date, toDate)
    } else {
      duplicateOutfit(sheetMode.date, toDate)
    }
    setSheetMode(null)
  }

  return (
    <>
    <AppShell>
      <header className="mb-5 flex items-start justify-between pt-4">
        <div>
          <p className="text-sm text-[#A8AFBE]">Your outfits,</p>
          <h1 className="text-[28px] font-bold leading-none tracking-[-0.5px]">already handled.</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/incoming-items")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#F6F3EE]"
            aria-label="Incoming items"
          >
            <Package size={18} />
            {incomingItems.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4D8D] text-[9px] font-bold">
                {incomingItems.length}
              </span>
            )}
          </button>
          <NotificationBell />
        </div>
      </header>

      <button
        onClick={handlePlanMonth}
        disabled={planningMonth}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(255,77,141,0.30)] transition active:scale-[0.97] disabled:opacity-70"
      >
        {planningMonth ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
            />
            Planning your month…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Plan My Month
          </>
        )}
      </button>

      {planDone && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-[16px] bg-[#4ECFA8]/12 px-4 py-3 text-sm font-medium text-[#4ECFA8]"
        >
          Your month is planned — outfits ready for 28 days.
        </motion.div>
      )}

      <div className="mb-5 flex gap-1.5 rounded-[18px] border border-white/8 bg-[#0F1115] p-1">
        {([1, 2, 4] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 rounded-[14px] py-2 text-[13px] font-semibold transition ${
              range === r
                ? "bg-[#1A1F2B] text-[#F6F3EE] shadow-sm"
                : "text-[#6F7788]"
            }`}
          >
            {r === 1 ? "1 Week" : r === 2 ? "2 Weeks" : "4 Weeks"}
          </button>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] text-[#6F7788]">
          {days.filter((d) => outfits[d]).length} of {days.length} days planned
        </p>
        <button
          onClick={() => navigate("/incoming-items")}
          className="flex items-center gap-1 text-[12px] text-[#C8A96A]"
        >
          <Package size={12} />
          {incomingItems.length} incoming
        </button>
      </div>

      <div className="space-y-3 pb-8">
        {days.map((dateStr, i) => (
          <motion.div
            key={dateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
          >
            <DayCard
              dateStr={dateStr}
              outfit={outfits[dateStr]}
              event={eventsByDate[dateStr]}
              onGenerate={() => navigate(`/timeline/generate/${dateStr}`)}
              onRemove={() => removeOutfit(dateStr)}
              onDuplicate={() => setSheetMode({ type: "duplicate", date: dateStr })}
              onMove={() => setSheetMode({ type: "move", date: dateStr })}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {sheetMode && (
          <DatePickerSheet
            title={sheetMode.type === "move" ? "Move outfit to…" : "Copy outfit to…"}
            excludeDate={sheetMode.date}
            onSelect={handleSheetSelect}
            onClose={() => setSheetMode(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {planningMonth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F1115]/90 backdrop-blur-lg"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4D8D]/20 to-[#FF7A5C]/20"
            >
              <CalendarDays size={36} className="text-[#FF4D8D]" />
            </motion.div>
            <p className="text-[20px] font-semibold text-[#F6F3EE]">Planning your month…</p>
            <p className="mt-2 text-sm text-[#6F7788]">Building outfit combos from your wardrobe</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>

    {/* Tonight Mode floating button */}
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
      onClick={() => setShowTonightMode(true)}
      className="fixed bottom-[88px] right-4 z-40 flex items-center gap-2 rounded-full bg-[#1A1F2B] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.5)] border border-[#C8A96A]/25 text-[#F6F3EE] transition active:scale-[0.96] hover:border-[#C8A96A]/50"
      aria-label="Tonight Mode"
    >
      <Moon size={15} className="text-[#C8A96A]" />
      <span className="text-[13px] font-semibold">Tonight</span>
    </motion.button>

    <AnimatePresence>
      {showTonightMode && (
        <TonightModeSheet onClose={() => setShowTonightMode(false)} />
      )}
    </AnimatePresence>

    {showFTE && (
      <FirstExperienceFlow
        onComplete={() => {
          localStorage.setItem(FTE_KEY, "true")
          setShowFTE(false)
        }}
      />
    )}
  </>
  )
}
