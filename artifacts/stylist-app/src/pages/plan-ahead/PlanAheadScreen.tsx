import { CalendarDays, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AppShell } from "../../components/AppShell"
import { Card } from "../../components/Card"
import { SectionHeader } from "../../components/SectionHeader"
import { PrimaryButton } from "../../components/PrimaryButton"
import { usePlannedEvents } from "../../hooks/usePlannedEvents"
import { daysUntil, formatEventDate, getDeliveryStatus, deliveryStatusColor } from "../../lib/deliveryStatus"
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

export default function PlanAheadScreen() {
  const navigate = useNavigate()
  const { events, removeEvent } = usePlannedEvents()

  const upcoming = events
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const past = events.filter((e) => daysUntil(e.date) < 0)

  return (
    <AppShell>
      <header className="mb-6 flex items-start justify-between pt-4">
        <div>
          <p className="text-sm text-[#AABBC0]">Stress-free dressing</p>
          <h1 className="text-[28px] font-semibold tracking-[-0.3px]">Plan Ahead</h1>
        </div>

        <button
          onClick={() => navigate("/plan-ahead/new")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] text-white shadow-[0_4px_16px_rgba(63,111,115,0.28)] transition active:scale-[0.97]"
          aria-label="New event"
        >
          <Plus size={20} />
        </button>
      </header>

      {events.length === 0 ? (
        <Card className="text-center py-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-3xl">
            <CalendarDays size={28} className="text-[#C8A96A]" />
          </div>
          <h3 className="mt-4 text-[18px] font-semibold text-[#F2F4F5]">
            No events planned yet
          </h3>
          <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-[#AABBC0]">
            Add an upcoming event and we'll help you plan the perfect outfit with time to spare.
          </p>
          <div className="mt-6">
            <PrimaryButton fullWidth={false} className="px-6" onClick={() => navigate("/plan-ahead/new")}>
              Plan an Event
            </PrimaryButton>
          </div>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <SectionHeader title="Upcoming Events" />
              <div className="space-y-3">
                {upcoming.map((event) => {
                  const days = daysUntil(event.date)
                  const status = getDeliveryStatus(event.date)
                  const color = deliveryStatusColor(status)

                  return (
                    <button
                      key={event.id}
                      onClick={() => navigate(`/plan-ahead/${event.id}`)}
                      className="w-full text-left"
                    >
                      <Card className="flex items-center gap-4 transition active:scale-[0.99]">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-white/5 text-2xl">
                          {eventEmoji[event.type]}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[15px] font-semibold text-[#F2F4F5]">
                            {event.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-[#6B8490]">
                            {formatEventDate(event.date)}
                          </p>
                          <p className="mt-1 text-[11px] font-medium" style={{ color }}>
                            {status} · {days}d away
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeEvent(event.id)
                          }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#6B8490] transition hover:bg-white/10"
                          aria-label="Remove event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </Card>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="mt-6">
              <SectionHeader title="Past Events" />
              <div className="space-y-3">
                {past.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/plan-ahead/${event.id}`)}
                    className="w-full text-left opacity-50"
                  >
                    <Card className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-white/5 text-2xl">
                        {eventEmoji[event.type]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[15px] font-semibold text-[#F2F4F5]">
                          {event.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#6B8490]">
                          {formatEventDate(event.date)}
                        </p>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </AppShell>
  )
}
