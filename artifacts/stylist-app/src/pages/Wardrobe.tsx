import { Plus, Camera, Clock } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppShell } from "../components/AppShell"
import { SearchInput } from "../components/SearchInput"
import { CategoryPill } from "../components/CategoryPill"
import { SectionHeader } from "../components/SectionHeader"
import { ItemPreferenceSheet } from "../components/ItemPreferenceSheet"
import type { SheetItem } from "../components/ItemPreferenceSheet"
import { useWardrobeCapture } from "../hooks/useWardrobeCapture"
import type { CapturedItem } from "../hooks/useWardrobeCapture"
import { useItemPreferences, REACH_COLOR } from "../hooks/useItemPreferences"
import { useWardrobeRemoval } from "../hooks/useWardrobeRemoval"
import { usePersonalisation, loadPersonalisationStore } from "../lib/usePersonalisation"
import { ItemUsagePill } from "../components/PersonalisationHint"

const categories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear"] as const
type Category = (typeof categories)[number]

// ─── Placeholder slot definitions ─────────────────────────────────────────────

type PlaceholderSlot = {
  id: string
  isHero: boolean
  label: string
  guide: string | null
}

const PLACEHOLDER_SLOTS: PlaceholderSlot[] = [
  { id: "ph-1", isHero: true,  label: "Start here",       guide: "Add your first item"              },
  { id: "ph-2", isHero: false, label: "A go-to piece",    guide: "Start with something you wear often" },
  { id: "ph-3", isHero: false, label: "Footwear",         guide: "Add shoes to complete outfits"    },
  { id: "ph-4", isHero: false, label: "Bottoms",          guide: null                               },
  { id: "ph-5", isHero: false, label: "Outer layer",      guide: null                               },
  { id: "ph-6", isHero: false, label: "Anything",         guide: null                               },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DisplayItem = {
  id: string | number
  name: string
  category: string
  image: string
  wearCount?: number
  isCapture?: boolean
  status?: CapturedItem["status"]
}

function statusDot(status: CapturedItem["status"] | undefined) {
  if (!status || status === "Clean") return null
  const cfg: Record<string, { label: string; color: string }> = {
    "In wash": { label: "In wash", color: "#C8A96A" },
    "On loan": { label: "On loan", color: "#7FA9A3" },
  }
  return cfg[status] ?? null
}

// ─── Guided empty-wardrobe grid ────────────────────────────────────────────────

function EmptyWardrobeGrid({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="mt-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#5E7580]">
            Your Items
          </h2>
          <p className="mt-1 text-[13px] text-[#6B8490]">
            Nothing here yet — add your first piece to get started.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PLACEHOLDER_SLOTS.map((slot) => (
          <button
            key={slot.id}
            onClick={onAdd}
            className="overflow-hidden rounded-[20px] text-left transition active:scale-[0.96]"
            style={{
              border: slot.isHero
                ? "1.5px dashed rgba(63,111,115,0.70)"
                : "1.5px dashed rgba(255,255,255,0.10)",
              background: slot.isHero
                ? "rgba(63,111,115,0.07)"
                : "rgba(255,255,255,0.02)",
            }}
          >
            {/* Photo area */}
            <div
              className="relative flex h-[110px] flex-col items-center justify-center gap-1"
              style={{
                background: slot.isHero
                  ? "rgba(63,111,115,0.06)"
                  : "rgba(255,255,255,0.02)",
              }}
            >
              {slot.isHero ? (
                <>
                  <div
                    className="mb-1 flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "rgba(63,111,115,0.22)" }}
                  >
                    <Camera size={16} style={{ color: "#3F6F73" }} />
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: "rgba(63,111,115,0.22)",
                      color: "#7FAFB3",
                    }}
                  >
                    Start here
                  </span>
                </>
              ) : (
                <Camera size={18} style={{ color: "rgba(107,132,144,0.40)" }} />
              )}
            </div>

            {/* Text area */}
            <div className="p-2">
              <p
                className="truncate text-xs font-medium"
                style={{ color: slot.isHero ? "#7FAFB3" : "rgba(170,187,192,0.45)" }}
              >
                {slot.label}
              </p>
              {slot.guide && (
                <p
                  className="mt-0.5 text-[10px] leading-[14px]"
                  style={{ color: slot.isHero ? "rgba(127,175,179,0.75)" : "rgba(107,132,144,0.55)" }}
                >
                  {slot.guide}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* CTA below grid */}
      <button
        onClick={onAdd}
        className="mt-5 w-full rounded-[22px] py-4 text-[15px] font-semibold text-white transition active:scale-[0.98]"
        style={{ background: "linear-gradient(to right, #3F6F73, #7FA9A3)" }}
      >
        Add your first item
      </button>
    </section>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Wardrobe() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")
  const [query, setQuery] = useState("")
  const [activeSheet, setActiveSheet] = useState<SheetItem | null>(null)

  const { items: capturedItems, removeItem: removeCapturedItem } = useWardrobeCapture()
  const { getPref } = useItemPreferences()
  const { removedIds } = useWardrobeRemoval()
  const { getItemLabel } = usePersonalisation()

  // Only show items the user has captured — no mock data preloaded
  const allItems = useMemo<DisplayItem[]>(() => {
    return capturedItems
      .filter((i) => !removedIds.has(i.id))
      .map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category === "Dress" ? "Tops" : i.category,
        image: i.image,
        wearCount: i.wearCount,
        isCapture: true,
        status: i.status,
      }))
  }, [capturedItems, removedIds])

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [allItems, selectedCategory, query])

  const isEmpty = allItems.length === 0

  // ── Neglected items (unworn 90+ days) ───────────────────────────────────────
  const neglectedItems = useMemo(() => {
    const store = loadPersonalisationStore()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    const cutoffStr = cutoff.toISOString().slice(0, 10)

    return allItems.filter((item) => {
      const log = store.wearLog[String(item.id)]
      if (!log) return false  // never worn via outfit confirm — skip
      return log.lastWorn < cutoffStr
    })
  }, [allItems])

  return (
    <AppShell>
      <header className="mb-5 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.3px]">Wardrobe</h1>
            <p className="mt-1 text-sm text-[#AABBC0]">
              {isEmpty
                ? "Empty — ready to fill"
                : `${allItems.length} item${allItems.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={() => navigate("/wardrobe/add")}
              className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#AABBC0] transition hover:bg-white/10"
              aria-label="Add item"
            >
              <Camera size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Search + filters — only shown once user has items */}
      {!isEmpty && (
        <>
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your wardrobe"
          />

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <CategoryPill
                key={category}
                active={category === selectedCategory}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </CategoryPill>
            ))}
          </div>
        </>
      )}

      {/* ── Empty guided state ────────────────────────────────────────────────── */}
      {isEmpty ? (
        <EmptyWardrobeGrid onAdd={() => navigate("/wardrobe/add")} />
      ) : (
        <>
          {/* ── Neglected items banner ────────────────────────────────────────── */}
          {neglectedItems.length > 0 && (
            <section className="mt-5">
              <div
                className="rounded-[22px] border p-4"
                style={{ borderColor: "rgba(200,169,106,0.20)", backgroundColor: "rgba(200,169,106,0.05)" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "rgba(200,169,106,0.15)" }}>
                    <Clock size={14} style={{ color: "#C8A96A" }} />
                  </div>
                  <p className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: "#C8A96A" }}>
                    Sleeping in your wardrobe
                  </p>
                </div>
                <p className="mb-3 text-[13px] leading-[18px]" style={{ color: "#AABBC0" }}>
                  {neglectedItems.length === 1
                    ? "1 item hasn't been worn in over 3 months."
                    : `${neglectedItems.length} items haven't been worn in over 3 months.`}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {neglectedItems.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSheet({
                        id: item.id, name: item.name, category: item.category,
                        image: item.image, isCapture: item.isCapture,
                      })}
                      className="flex-shrink-0 overflow-hidden rounded-[14px] border transition active:scale-[0.97]"
                      style={{ width: 64, height: 64, borderColor: "rgba(200,169,106,0.20)", background: "#1C2A37" }}
                    >
                      {item.image
                        ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        : <div className="flex h-full w-full items-center justify-center"><Camera size={16} className="text-[#4D6A78]" /></div>
                      }
                    </button>
                  ))}
                  {neglectedItems.length > 5 && (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[14px] border" style={{ borderColor: "rgba(200,169,106,0.15)", background: "#1C2A37" }}>
                      <p className="text-[12px] font-semibold" style={{ color: "#C8A96A" }}>+{neglectedItems.length - 5}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="mt-5">
            <SectionHeader title="Your Items" />

            {filteredItems.length === 0 ? (
              <div className="mt-8 text-center">
                <p className="text-sm text-[#6B8490]">No items found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredItems.map((item) => {
                  const dot = statusDot(item.status)
                  const pref = getPref(item.id)
                  const reachColor = pref.reach ? REACH_COLOR[pref.reach] : null

                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        setActiveSheet({
                          id:        item.id,
                          name:      item.name,
                          category:  item.category,
                          image:     item.image,
                          isCapture: item.isCapture,
                        })
                      }
                      className="overflow-hidden rounded-[20px] border border-white/8 bg-[#202E3E] text-left transition active:scale-[0.97]"
                    >
                      {/* Image area */}
                      <div className="relative h-[110px] overflow-hidden bg-[#1C2A37]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#243140]">
                            <Camera size={20} className="text-[#2E4055]" />
                          </div>
                        )}

                        {typeof item.wearCount === "number" && item.wearCount > 0 && (
                          <div className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] text-white">
                            {item.wearCount}x
                          </div>
                        )}

                        {item.isCapture && (
                          <div className="absolute left-2 top-2 rounded-full bg-[#5F8F7F]/25 px-1.5 py-0.5 text-[9px] font-semibold text-[#5F8F7F]">
                            New
                          </div>
                        )}

                        {getItemLabel(item.id) === "frequently-worn" && (
                          <div className="absolute bottom-2 left-2">
                            <ItemUsagePill label="frequently-worn" />
                          </div>
                        )}
                      </div>

                      {/* Text + indicators */}
                      <div className="p-2">
                        <p className="truncate text-xs font-medium text-[#F2F4F5]">{item.name}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <p className="text-[11px] text-[#6B8490]">{item.category}</p>
                          {dot && (
                            <span className="text-[10px]" style={{ color: dot.color }}>
                              · {dot.label}
                            </span>
                          )}
                        </div>

                        {reachColor && (
                          <div className="mt-1.5">
                            <div
                              className="h-[2px] w-full rounded-full"
                              style={{ backgroundColor: reachColor, opacity: 0.55 }}
                            />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Floating add button */}
          <button
            onClick={() => navigate("/wardrobe/add")}
            className="fixed bottom-24 right-[max(24px,calc((100vw-430px)/2+24px))] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(63,111,115,0.28)] transition active:scale-[0.98]"
            style={{ background: "linear-gradient(to right, #3F6F73, #7FA9A3)" }}
            aria-label="Add clothing item"
          >
            <Plus size={24} />
          </button>
        </>
      )}

      {/* Item preference sheet */}
      <ItemPreferenceSheet
        item={activeSheet}
        onClose={() => setActiveSheet(null)}
        onPermanentDelete={(id) => removeCapturedItem(String(id))}
      />
    </AppShell>
  )
}
