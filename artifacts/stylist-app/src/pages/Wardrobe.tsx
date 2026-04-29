import { Plus, Camera } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppShell } from "../components/AppShell"
import { SearchInput } from "../components/SearchInput"
import { CategoryPill } from "../components/CategoryPill"
import { SectionHeader } from "../components/SectionHeader"
import { ItemPreferenceSheet } from "../components/ItemPreferenceSheet"
import type { SheetItem } from "../components/ItemPreferenceSheet"
import { wardrobeItems } from "../lib/mockData"
import { useWardrobeCapture } from "../hooks/useWardrobeCapture"
import type { CapturedItem } from "../hooks/useWardrobeCapture"
import { useItemPreferences, REACH_COLOR } from "../hooks/useItemPreferences"
import { useWardrobeRemoval } from "../hooks/useWardrobeRemoval"

const categories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear"] as const
type Category = (typeof categories)[number]

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function Wardrobe() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")
  const [query, setQuery] = useState("")
  const [activeSheet, setActiveSheet] = useState<SheetItem | null>(null)

  const { items: capturedItems, removeItem: removeCapturedItem } = useWardrobeCapture()
  const { getPref } = useItemPreferences()
  const { removedIds } = useWardrobeRemoval()

  // Merge static + captured into a single display list
  const allItems = useMemo<DisplayItem[]>(() => {
    const staticDisplayed: DisplayItem[] = wardrobeItems.filter((i) => !removedIds.has(String(i.id))).map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      image: i.image,
      wearCount: i.wearCount,
    }))
    const capturedDisplayed: DisplayItem[] = capturedItems.filter((i) => !removedIds.has(i.id)).map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category === "Dress" ? "Tops" : i.category,
      image: i.image,
      wearCount: i.wearCount,
      isCapture: true,
      status: i.status,
    }))
    return [...capturedDisplayed, ...staticDisplayed]
  }, [capturedItems, removedIds])

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [allItems, selectedCategory, query])

  const totalCount = allItems.length
  const newCount = capturedItems.length

  return (
    <AppShell>
      <header className="mb-5 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.3px]">Wardrobe</h1>
            <p className="mt-1 text-sm text-[#AABBC0]">
              {totalCount} item{totalCount !== 1 ? "s" : ""}
              {newCount > 0 && (
                <span className="ml-1.5 text-[#5F8F7F]">· {newCount} added by you</span>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate("/wardrobe/add")}
            className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#AABBC0] transition hover:bg-white/10"
            aria-label="Add item"
          >
            <Camera size={18} />
          </button>
        </div>
      </header>

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

      <section className="mt-5">
        <SectionHeader title="Your Items" />

        {filteredItems.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-sm text-[#6B8490]">No items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const dot  = item.isCapture ? statusDot(item.status) : null
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

                    {/* Reach preference indicator */}
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

      {/* Item preference sheet */}
      <ItemPreferenceSheet
        item={activeSheet}
        onClose={() => setActiveSheet(null)}
        onPermanentDelete={(id) => removeCapturedItem(String(id))}
      />
    </AppShell>
  )
}
