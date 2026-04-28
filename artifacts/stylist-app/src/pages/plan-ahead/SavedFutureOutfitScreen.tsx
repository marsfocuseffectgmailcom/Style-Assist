import { ArrowLeft, Package, Truck, CheckCircle2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { AppShell } from "../../components/AppShell"
import { Card } from "../../components/Card"
import { SectionHeader } from "../../components/SectionHeader"
import { usePlannedEvents } from "../../hooks/usePlannedEvents"
import { formatEventDate } from "../../lib/deliveryStatus"
import type { PurchaseStatus, EventType } from "../../lib/types"

const eventEmoji: Record<EventType, string> = {
  wedding: "💍",
  party: "🎉",
  birthday: "🎂",
  christmas: "🎄",
  halloween: "🎃",
  easter: "🐣",
  custom: "✨",
}

const statusCycle: PurchaseStatus[] = [
  "not_purchased",
  "waiting_for_delivery",
  "arrived",
]

const statusConfig: Record<
  PurchaseStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  not_purchased: {
    label: "Not purchased",
    color: "#6F7788",
    bg: "bg-white/5",
    icon: <Package size={13} />,
  },
  waiting_for_delivery: {
    label: "On its way",
    color: "#C8A96A",
    bg: "bg-[#C8A96A]/10",
    icon: <Truck size={13} />,
  },
  arrived: {
    label: "Arrived",
    color: "#4ECFA8",
    bg: "bg-[#4ECFA8]/10",
    icon: <CheckCircle2 size={13} />,
  },
}

export default function SavedFutureOutfitScreen() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { getEvent, getOutfit, updateItemStatus } = usePlannedEvents()

  const event = getEvent(eventId ?? "")
  const outfit = getOutfit(eventId ?? "")

  if (!event || !outfit || outfit.items.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-4 pt-20 text-center">
          <p className="text-[#A8AFBE]">No outfit saved for this event yet.</p>
          <button
            onClick={() => navigate(`/plan-ahead/${eventId}/builder`)}
            className="rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Build Outfit
          </button>
        </div>
      </AppShell>
    )
  }

  const arrivedCount = outfit.items.filter((i) => i.purchaseStatus === "arrived").length
  const totalCount = outfit.items.length
  const isComplete = arrivedCount === totalCount
  const progressPct = Math.round((arrivedCount / totalCount) * 100)

  function handleCycleStatus(itemId: string, current: PurchaseStatus) {
    const idx = statusCycle.indexOf(current)
    const next = statusCycle[(idx + 1) % statusCycle.length]
    updateItemStatus(eventId ?? "", itemId, next)
  }

  const wardrobeItems = outfit.items.filter((i) => i.source === "wardrobe")
  const suggestionItems = outfit.items.filter((i) => i.source === "suggestion")

  return (
    <AppShell>
      <header className="mb-5 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate(`/plan-ahead/${eventId}`)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#A8AFBE] transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span>{eventEmoji[event.type]}</span>
            <h1 className="truncate text-[20px] font-semibold tracking-[-0.3px]">
              {event.name}
            </h1>
          </div>
          <p className="text-xs text-[#6F7788]">{formatEventDate(event.date)}</p>
        </div>
      </header>

      {isComplete ? (
        <Card className="mb-5 bg-gradient-to-br from-[#0F2820] to-[#151922] text-center py-4">
          <p className="text-xl">🎉</p>
          <p className="mt-2 text-[15px] font-semibold text-[#4ECFA8]">
            Your outfit is now complete
          </p>
          <p className="mt-1 text-xs text-[#A8AFBE]">
            Every piece has arrived. You're ready.
          </p>
        </Card>
      ) : (
        <Card className="mb-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#F6F3EE]">Outfit progress</p>
            <p className="text-sm font-semibold text-[#F6F3EE]">
              {arrivedCount} / {totalCount} arrived
            </p>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#4ECFA8] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#6F7788]">
            Tap any item to update its delivery status
          </p>
        </Card>
      )}

      <section>
        <SectionHeader title="Outfit Board" />
        <div className="grid grid-cols-2 gap-3">
          {outfit.items.map((item) => {
            const config = statusConfig[item.purchaseStatus]
            return (
              <button
                key={item.id}
                onClick={() => handleCycleStatus(item.id, item.purchaseStatus)}
                className="overflow-hidden rounded-[20px] border border-white/8 bg-[#151922] text-left transition active:scale-[0.97]"
              >
                <div className="relative h-[110px] overflow-hidden bg-[#11151C]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <div
                    className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium backdrop-blur-sm ${config.bg}`}
                    style={{ color: config.color }}
                  >
                    {config.icon}
                    {config.label}
                  </div>
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-[#F6F3EE]">{item.name}</p>
                  <p className="mt-0.5 text-[10px] text-[#6F7788]">{item.category}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {wardrobeItems.length > 0 && (
        <section className="mt-5">
          <SectionHeader title="From Your Wardrobe" />
          <div className="space-y-2">
            {wardrobeItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-[#151922] p-3"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[#11151C]">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F6F3EE]">{item.name}</p>
                  <p className="text-xs text-[#6F7788]">{item.category}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 rounded-full bg-[#4ECFA8]/10 px-2 py-1 text-[10px] font-medium text-[#4ECFA8]">
                  <CheckCircle2 size={11} />
                  Ready
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {suggestionItems.length > 0 && (
        <section className="mt-5 pb-6">
          <SectionHeader title="Items to Buy" />
          <div className="space-y-2">
            {suggestionItems.map((item) => {
              const config = statusConfig[item.purchaseStatus]
              return (
                <button
                  key={item.id}
                  onClick={() => handleCycleStatus(item.id, item.purchaseStatus)}
                  className="flex w-full items-center gap-3 rounded-[16px] border border-white/8 bg-[#151922] p-3 text-left transition active:scale-[0.98]"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[#11151C]">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#F6F3EE]">{item.name}</p>
                    <p className="text-xs text-[#6F7788]">{item.price}</p>
                  </div>
                  <div
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${config.bg}`}
                    style={{ color: config.color }}
                  >
                    {config.icon}
                    {config.label}
                  </div>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs text-[#6F7788]">
            Tap an item to cycle its status
          </p>
        </section>
      )}
    </AppShell>
  )
}
