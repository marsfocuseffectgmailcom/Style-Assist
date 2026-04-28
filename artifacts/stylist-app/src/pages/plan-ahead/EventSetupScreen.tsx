import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AppShell } from "../../components/AppShell"
import { Card } from "../../components/Card"
import { PrimaryButton } from "../../components/PrimaryButton"
import { usePlannedEvents } from "../../hooks/usePlannedEvents"
import type { EventType } from "../../lib/types"

const eventTypes: { type: EventType; label: string; emoji: string; hint: string }[] = [
  { type: "wedding", label: "Wedding", emoji: "💍", hint: "Ceremony, reception, or garden party" },
  { type: "party", label: "Party", emoji: "🎉", hint: "Cocktail, dinner, or celebration" },
  { type: "birthday", label: "Birthday", emoji: "🎂", hint: "Yours or someone special's" },
  { type: "christmas", label: "Christmas", emoji: "🎄", hint: "Festive lunch or evening party" },
  { type: "halloween", label: "Halloween", emoji: "🎃", hint: "Costume-forward or subtle" },
  { type: "easter", label: "Easter", emoji: "🐣", hint: "Brunch, garden lunch, or family" },
  { type: "custom", label: "Custom", emoji: "✨", hint: "Name your own occasion" },
]

function todayString() {
  return new Date().toISOString().split("T")[0]
}

export default function EventSetupScreen() {
  const navigate = useNavigate()
  const { addEvent } = usePlannedEvents()

  const [selectedType, setSelectedType] = useState<EventType | null>(null)
  const [date, setDate] = useState("")
  const [customName, setCustomName] = useState("")

  const isValid =
    selectedType !== null &&
    date !== "" &&
    new Date(date) > new Date(todayString())

  const eventName =
    customName.trim() ||
    (selectedType ? eventTypes.find((e) => e.type === selectedType)?.label ?? "" : "")

  function handleStart() {
    if (!isValid || !selectedType) return
    const event = addEvent({ type: selectedType, name: eventName, date })
    navigate(`/plan-ahead/${event.id}`)
  }

  return (
    <AppShell>
      <header className="mb-6 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate("/plan-ahead")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#A8AFBE] transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.3px]">New Event</h1>
          <p className="text-xs text-[#6F7788]">Tell us about the occasion</p>
        </div>
      </header>

      <section>
        <p className="mb-3 text-sm font-medium text-[#A8AFBE]">What's the event?</p>
        <div className="grid grid-cols-2 gap-3">
          {eventTypes.map(({ type, label, emoji, hint }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex flex-col items-start gap-1 rounded-[20px] border p-4 text-left transition active:scale-[0.98] ${
                selectedType === type
                  ? "border-[#FF4D8D]/60 bg-[#FF4D8D]/10"
                  : "border-white/8 bg-[#151922] hover:bg-white/5"
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-semibold text-[#F6F3EE]">{label}</span>
              <span className="text-[11px] leading-4 text-[#6F7788]">{hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="mb-3 text-sm font-medium text-[#A8AFBE]">Event name (optional)</p>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder={
            selectedType
              ? `e.g. ${eventTypes.find((e) => e.type === selectedType)?.label ?? "My Event"}`
              : "e.g. Sarah's Wedding"
          }
          className="w-full rounded-[16px] border border-white/10 bg-[#151922] px-4 py-3.5 text-sm text-[#F6F3EE] placeholder-[#6F7788] outline-none focus:border-white/25 transition"
        />
      </section>

      <section className="mt-5">
        <p className="mb-3 text-sm font-medium text-[#A8AFBE]">When is it?</p>
        <input
          type="date"
          value={date}
          min={todayString()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-[16px] border border-white/10 bg-[#151922] px-4 py-3.5 text-sm text-[#F6F3EE] outline-none focus:border-white/25 transition [color-scheme:dark]"
        />
      </section>

      {date && new Date(date) <= new Date(todayString()) && (
        <p className="mt-2 text-xs text-[#FF7A5C]">Please choose a future date.</p>
      )}

      {isValid && (
        <Card className="mt-5 bg-gradient-to-br from-[#1E1628] to-[#151922]">
          <p className="text-xs text-[#A8AFBE]">Planning for</p>
          <p className="mt-1 text-[15px] font-semibold text-[#F6F3EE]">{eventName}</p>
          <p className="mt-0.5 text-xs text-[#6F7788]">
            {new Date(date).toLocaleDateString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </Card>
      )}

      <div className="mt-6 pb-6">
        <PrimaryButton disabled={!isValid} onClick={handleStart}>
          Start Planning
        </PrimaryButton>
      </div>
    </AppShell>
  )
}
