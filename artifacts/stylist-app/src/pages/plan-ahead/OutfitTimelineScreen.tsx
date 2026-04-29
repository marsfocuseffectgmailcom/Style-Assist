import { ArrowLeft, Box, Sparkles, ShoppingBag, Lock } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { AppShell } from "../../components/AppShell"
import { Card } from "../../components/Card"
import { SectionHeader } from "../../components/SectionHeader"
import { PrimaryButton } from "../../components/PrimaryButton"
import { usePlannedEvents } from "../../hooks/usePlannedEvents"
import {
  daysUntil,
  formatEventDate,
  getDeliveryStatus,
  deliveryStatusColor,
} from "../../lib/deliveryStatus"
import type { EventType } from "../../lib/types"

const eventEmoji: Record<EventType, string> = {
  wedding: "💍",
  party: "🎉",
  birthday: "🎂",
  christmas: "🎄",
  halloween: "🎃",
  easter: "🐣",
  custom: "✨",
}

export default function OutfitTimelineScreen() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { getEvent, getOutfit } = usePlannedEvents()

  const event = getEvent(eventId ?? "")
  const outfit = getOutfit(eventId ?? "")

  if (!event) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-4 pt-20">
          <p className="text-[#AABBC0]">Event not found.</p>
          <button onClick={() => navigate("/plan-ahead")} className="text-sm text-[#3F6F73]">
            Back to Plan Ahead
          </button>
        </div>
      </AppShell>
    )
  }

  const days = daysUntil(event.date)
  const status = getDeliveryStatus(event.date)
  const statusColor = deliveryStatusColor(status)
  const hasOutfit = outfit && outfit.items.length > 0

  const arrivedCount = outfit?.items.filter((i) => i.purchaseStatus === "arrived").length ?? 0
  const totalCount = outfit?.items.length ?? 0
  const isComplete = totalCount > 0 && arrivedCount === totalCount

  return (
    <AppShell>
      <header className="mb-5 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate("/plan-ahead")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#AABBC0] transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{eventEmoji[event.type]}</span>
            <h1 className="truncate text-[20px] font-semibold tracking-[-0.3px] text-[#F2F4F5]">
              {event.name}
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-[#6B8490]">{formatEventDate(event.date)}</p>
        </div>
      </header>

      <Card
        elevated
        className="bg-gradient-to-br from-[#1A2635] via-[#1A2635] to-[#2A3645]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6B8490]">Time remaining</p>
            <p className="mt-1 text-[32px] font-bold leading-none tracking-[-1px] text-[#F2F4F5]">
              {days > 0 ? days : 0}
              <span className="ml-1 text-sm font-normal text-[#AABBC0]">days</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6B8490]">Delivery window</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: statusColor }}>
              {status}
            </p>
            {status === "Too late" && (
              <p className="mt-0.5 text-[11px] text-[#6B8490]">Express options only</p>
            )}
            {status === "Risky delivery" && (
              <p className="mt-0.5 text-[11px] text-[#6B8490]">Order today to be safe</p>
            )}
            {status === "Safe delivery" && (
              <p className="mt-0.5 text-[11px] text-[#6B8490]">Plenty of time to shop</p>
            )}
          </div>
        </div>

        {isComplete && (
          <div className="mt-4 rounded-[14px] bg-[#5F8F7F]/10 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-[#5F8F7F]">
              ✓ Your outfit is now complete
            </p>
          </div>
        )}
      </Card>

      <section className="mt-5">
        <SectionHeader title="Outfit Board" />

        {hasOutfit ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {outfit.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[20px] border border-white/8 bg-[#2A3645]"
                >
                  <div className="relative h-[110px] overflow-hidden bg-[#1C2A37]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {item.source === "suggestion" && (
                      <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-[#C8A96A] backdrop-blur-sm">
                        To buy
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-[#F2F4F5]">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#6B8490]">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>

            {outfit.items.length > 4 && (
              <p className="mt-2 text-center text-xs text-[#6B8490]">
                +{outfit.items.length - 4} more items
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate(`/plan-ahead/${eventId}/builder`)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/5 text-sm font-medium text-[#F2F4F5] transition active:scale-[0.98]"
              >
                <Box size={15} />
                Edit Outfit
              </button>
              <button
                onClick={() => navigate(`/plan-ahead/${eventId}/suggestions`)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/5 text-sm font-medium text-[#F2F4F5] transition active:scale-[0.98]"
              >
                <ShoppingBag size={15} />
                Shop Gaps
              </button>
            </div>

            <div className="mt-3">
              <PrimaryButton onClick={() => navigate(`/plan-ahead/${eventId}/complete`)}>
                View Full Outfit
              </PrimaryButton>
            </div>
          </>
        ) : (
          <Card className="text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Sparkles size={22} className="text-[#C8A96A]" />
            </div>
            <h3 className="mt-3 text-[16px] font-semibold text-[#F2F4F5]">
              No outfit planned yet
            </h3>
            <p className="mx-auto mt-2 max-w-[240px] text-sm text-[#AABBC0]">
              Build your outfit from your existing wardrobe or discover what's missing.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <PrimaryButton onClick={() => navigate(`/plan-ahead/${eventId}/builder`)}>
                Build from Wardrobe
              </PrimaryButton>
              <button
                onClick={() => navigate(`/plan-ahead/${eventId}/suggestions`)}
                className="h-11 w-full rounded-[16px] border border-white/10 bg-white/5 text-sm text-[#F2F4F5] transition active:scale-[0.98]"
              >
                Get Outfit Suggestions
              </button>
            </div>
          </Card>
        )}
      </section>

      <section className="mt-5">
        <Card className="flex items-center gap-4 opacity-50">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/8">
            <Lock size={18} className="text-[#AABBC0]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#F2F4F5]">3D Try-On</p>
            <p className="text-xs text-[#6B8490]">Coming later — see your outfit on a virtual model</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-medium text-[#AABBC0]">
            Soon
          </span>
        </Card>
      </section>
    </AppShell>
  )
}
