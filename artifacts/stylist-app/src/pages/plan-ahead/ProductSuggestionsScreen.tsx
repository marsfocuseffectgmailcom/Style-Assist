import { useState } from "react"
import { ArrowLeft, Plus, Check } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { AppShell } from "../../components/AppShell"
import { Card } from "../../components/Card"
import { SectionHeader } from "../../components/SectionHeader"
import { PrimaryButton } from "../../components/PrimaryButton"
import { usePlannedEvents } from "../../hooks/usePlannedEvents"
import { getSuggestionsForEvent } from "../../lib/planAheadSuggestions"
import { getDeliveryStatus, deliveryStatusColor } from "../../lib/deliveryStatus"
import type { PlannedOutfitItem } from "../../lib/types"

export default function ProductSuggestionsScreen() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { getEvent, getOutfit, saveOutfit } = usePlannedEvents()

  const event = getEvent(eventId ?? "")
  const existingOutfit = getOutfit(eventId ?? "")

  const suggestions = event ? getSuggestionsForEvent(event.type) : []

  const existingSuggestionIds = new Set(
    (existingOutfit?.items ?? [])
      .filter((i) => i.source === "suggestion")
      .map((i) => i.name)
  )

  const [added, setAdded] = useState<Set<string>>(existingSuggestionIds)

  function handleToggle(item: PlannedOutfitItem) {
    setAdded((prev) => {
      const next = new Set(prev)
      if (next.has(item.name)) next.delete(item.name)
      else next.add(item.name)
      return next
    })
  }

  function handleSave() {
    const existingWardrobe = (existingOutfit?.items ?? []).filter(
      (i) => i.source === "wardrobe"
    )
    const selectedSuggestions = suggestions.filter((s) => added.has(s.name))
    saveOutfit(eventId ?? "", [...existingWardrobe, ...selectedSuggestions])
    navigate(`/plan-ahead/${eventId}`)
  }

  if (!event) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center pt-20">
          <button onClick={() => navigate("/plan-ahead")} className="text-sm text-[#FF4D8D]">
            Back to Plan Ahead
          </button>
        </div>
      </AppShell>
    )
  }

  const deliveryStatus = getDeliveryStatus(event.date)
  const statusColor = deliveryStatusColor(deliveryStatus)

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
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Shop the Gaps</h1>
          <p className="text-xs text-[#6F7788]">Curated for {event.name}</p>
        </div>
      </header>

      <Card className="mb-5 flex items-center gap-3">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: statusColor }}
        />
        <div>
          <p className="text-sm font-semibold" style={{ color: statusColor }}>
            {deliveryStatus}
          </p>
          <p className="text-xs text-[#6F7788]">
            {deliveryStatus === "Safe delivery" && "Plenty of time — shop at your own pace"}
            {deliveryStatus === "Risky delivery" && "Order soon — standard delivery may be tight"}
            {deliveryStatus === "Too late" && "Express delivery only — check at checkout"}
          </p>
        </div>
      </Card>

      <section>
        <SectionHeader title={`Suggested for ${event.type === "custom" ? "Your Event" : event.name}`} />

        <div className="space-y-3">
          {suggestions.map((item) => {
            const isAdded = added.has(item.name)

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-[20px] border p-3 transition ${
                  isAdded
                    ? "border-[#FF4D8D]/40 bg-[#FF4D8D]/8"
                    : "border-white/10 bg-[#151922]"
                }`}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[#11151C]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-[#F6F3EE]">
                    {item.name}
                  </h4>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-[#6F7788]">
                    {item.brand}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <p className="text-sm font-medium text-[#F6F3EE]">{item.price}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        color: statusColor,
                        backgroundColor: `${statusColor}18`,
                      }}
                    >
                      {deliveryStatus}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(item)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.95] ${
                    isAdded
                      ? "border-[#FF4D8D]/40 bg-[#FF4D8D]/20 text-[#FF78A8]"
                      : "border-white/10 bg-white/5 text-[#A8AFBE] hover:bg-white/10"
                  }`}
                  aria-label={isAdded ? "Remove from outfit" : "Add to outfit"}
                >
                  {isAdded ? <Check size={16} /> : <Plus size={16} />}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {added.size > 0 && (
        <div className="mt-6 pb-6">
          <PrimaryButton onClick={handleSave}>
            Add {added.size} Item{added.size > 1 ? "s" : ""} to Outfit Plan
          </PrimaryButton>
        </div>
      )}
    </AppShell>
  )
}
