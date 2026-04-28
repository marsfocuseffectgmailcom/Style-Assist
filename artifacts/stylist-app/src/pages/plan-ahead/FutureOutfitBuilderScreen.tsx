import { useState } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { AppShell } from "../../components/AppShell"
import { CategoryPill } from "../../components/CategoryPill"
import { SectionHeader } from "../../components/SectionHeader"
import { PrimaryButton } from "../../components/PrimaryButton"
import { usePlannedEvents } from "../../hooks/usePlannedEvents"
import { wardrobeItems } from "../../lib/mockData"
import type { PlannedOutfitItem } from "../../lib/types"

const categories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear"] as const
type Category = (typeof categories)[number]

function wardrobeItemToOutfitItem(item: typeof wardrobeItems[number]): PlannedOutfitItem {
  return {
    id: `wardrobe-${item.id}`,
    name: item.name,
    image: item.image,
    category: item.category,
    source: "wardrobe",
    purchaseStatus: "arrived",
  }
}

export default function FutureOutfitBuilderScreen() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { getEvent, getOutfit, saveOutfit } = usePlannedEvents()

  const event = getEvent(eventId ?? "")
  const existingOutfit = getOutfit(eventId ?? "")

  const existingWardrobeIds = new Set(
    (existingOutfit?.items ?? [])
      .filter((i) => i.source === "wardrobe")
      .map((i) => i.id)
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(existingWardrobeIds)
  const [filter, setFilter] = useState<Category>("All")

  const filtered = wardrobeItems.filter(
    (item) => filter === "All" || item.category === filter
  )

  function toggleItem(item: typeof wardrobeItems[number]) {
    const id = `wardrobe-${item.id}`
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    const selectedWardrobe = wardrobeItems
      .filter((i) => selectedIds.has(`wardrobe-${i.id}`))
      .map(wardrobeItemToOutfitItem)

    const existingSuggestions = (existingOutfit?.items ?? []).filter(
      (i) => i.source === "suggestion"
    )

    saveOutfit(eventId ?? "", [...selectedWardrobe, ...existingSuggestions])
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
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Build Outfit</h1>
          <p className="text-xs text-[#6F7788]">Select from your wardrobe · {selectedIds.size} chosen</p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <CategoryPill
            key={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </CategoryPill>
        ))}
      </div>

      <section className="mt-4">
        <SectionHeader title="Your Wardrobe" />
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((item) => {
            const id = `wardrobe-${item.id}`
            const isSelected = selectedIds.has(id)

            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item)}
                className={`overflow-hidden rounded-[20px] border text-left transition active:scale-[0.97] ${
                  isSelected ? "border-[#FF4D8D]/60" : "border-white/8"
                } bg-[#151922]`}
              >
                <div className="relative h-[100px] overflow-hidden bg-[#11151C]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#FF4D8D]/25">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4D8D]">
                        <Check size={14} className="text-white" />
                      </div>
                    </div>
                  )}
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

      <div className="mt-6 pb-6">
        <PrimaryButton onClick={handleSave}>
          {selectedIds.size > 0
            ? `Save ${selectedIds.size} Item${selectedIds.size > 1 ? "s" : ""} to Outfit`
            : "Clear Outfit Selection"}
        </PrimaryButton>
      </div>
    </AppShell>
  )
}
