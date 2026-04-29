import { useState } from "react"
import { ArrowLeft, Plus, Check, Clock } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { AppShell } from "../../components/AppShell"
import { Card } from "../../components/Card"
import { SectionHeader } from "../../components/SectionHeader"
import { PrimaryButton } from "../../components/PrimaryButton"
import { usePlannedEvents } from "../../hooks/usePlannedEvents"
import { getSuggestionsForEvent } from "../../lib/planAheadSuggestions"
import type { SuggestionWithDelivery } from "../../lib/planAheadSuggestions"
import {
  canDeliverBy,
  estimatedArrivalLabel,
  getDeliveryStatus,
  deliveryStatusColor,
} from "../../lib/deliveryStatus"

export default function ProductSuggestionsScreen() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { getEvent, getOutfit, saveOutfit } = usePlannedEvents()

  const event = getEvent(eventId ?? "")
  const existingOutfit = getOutfit(eventId ?? "")

  const allSuggestions = event ? getSuggestionsForEvent(event.type) : []

  const viable = allSuggestions.filter((s) =>
    canDeliverBy(event?.date ?? "", s.estimatedDeliveryDays)
  )
  const tooLate = allSuggestions.filter(
    (s) => !canDeliverBy(event?.date ?? "", s.estimatedDeliveryDays)
  )

  const existingSuggestionNames = new Set(
    (existingOutfit?.items ?? [])
      .filter((i) => i.source === "suggestion")
      .map((i) => i.name)
  )

  const [added, setAdded] = useState<Set<string>>(existingSuggestionNames)

  function handleToggle(item: SuggestionWithDelivery) {
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
    const selectedSuggestions = viable.filter((s) => added.has(s.name))
    saveOutfit(eventId ?? "", [...existingWardrobe, ...selectedSuggestions])
    navigate(`/plan-ahead/${eventId}`)
  }

  if (!event) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center pt-20">
          <button onClick={() => navigate("/plan-ahead")} className="text-sm text-[#3F6F73]">
            Back to Plan Ahead
          </button>
        </div>
      </AppShell>
    )
  }

  const overallStatus = getDeliveryStatus(event.date)
  const overallColor = deliveryStatusColor(overallStatus)

  function SuggestionCard({
    item,
    disabled = false,
  }: {
    item: SuggestionWithDelivery
    disabled?: boolean
  }) {
    const isAdded = added.has(item.name)
    const arrivalLabel = estimatedArrivalLabel(item.estimatedDeliveryDays)

    return (
      <div
        className={`flex items-center gap-3 rounded-[20px] border p-3 transition ${
          disabled
            ? "border-white/5 bg-[#1C2A37] opacity-50"
            : isAdded
              ? "border-[#3F6F73]/40 bg-[#3F6F73]/8"
              : "border-white/10 bg-[#2A3645]"
        }`}
      >
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[#1C2A37]">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-[#F2F4F5]">{item.name}</h4>
          <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-[#6B8490]">
            {item.brand}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[#F2F4F5]">{item.price}</p>
            {disabled ? (
              <span className="flex items-center gap-1 rounded-full bg-[#7FA9A3]/15 px-2 py-0.5 text-[10px] font-medium text-[#7FA9A3]">
                <Clock size={10} />
                Won&apos;t arrive in time
              </span>
            ) : (
              <span className="rounded-full bg-[#5F8F7F]/12 px-2 py-0.5 text-[10px] font-medium text-[#5F8F7F]">
                Arrives ~{arrivalLabel}
              </span>
            )}
          </div>
        </div>

        {!disabled && (
          <button
            onClick={() => handleToggle(item)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.95] ${
              isAdded
                ? "border-[#3F6F73]/40 bg-[#3F6F73]/20 text-[#5F8F8A]"
                : "border-white/10 bg-white/5 text-[#AABBC0] hover:bg-white/10"
            }`}
            aria-label={isAdded ? "Remove from outfit" : "Add to outfit"}
          >
            {isAdded ? <Check size={16} /> : <Plus size={16} />}
          </button>
        )}
      </div>
    )
  }

  return (
    <AppShell>
      <header className="mb-5 flex items-center gap-3 pt-4">
        <button
          onClick={() => navigate(`/plan-ahead/${eventId}`)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#AABBC0] transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Shop the Gaps</h1>
          <p className="text-xs text-[#6B8490]">Curated for {event.name}</p>
        </div>
      </header>

      <Card className="mb-5 flex items-center gap-3">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: overallColor }}
        />
        <div>
          <p className="text-sm font-semibold" style={{ color: overallColor }}>
            {overallStatus}
          </p>
          <p className="text-xs text-[#6B8490]">
            {overallStatus === "Safe delivery" && "Plenty of time — shop at your own pace"}
            {overallStatus === "Risky delivery" && "Order soon — standard delivery may be tight"}
            {overallStatus === "Too late" && "Express delivery only — check at checkout"}
          </p>
        </div>
      </Card>

      {viable.length > 0 && (
        <section>
          <SectionHeader
            title={`Ships in time · ${viable.length} item${viable.length > 1 ? "s" : ""}`}
          />
          <div className="space-y-3">
            {viable.map((item) => (
              <SuggestionCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {tooLate.length > 0 && (
        <section className="mt-6">
          <SectionHeader title="Won't arrive in time" />
          <p className="mb-3 text-xs text-[#6B8490]">
            Based on standard delivery windows — these items cannot reach you before the event.
          </p>
          <div className="space-y-3">
            {tooLate.map((item) => (
              <SuggestionCard key={item.id} item={item} disabled />
            ))}
          </div>
        </section>
      )}

      {viable.length === 0 && tooLate.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-[#AABBC0]">No suggestions available for this event.</p>
        </Card>
      )}

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
