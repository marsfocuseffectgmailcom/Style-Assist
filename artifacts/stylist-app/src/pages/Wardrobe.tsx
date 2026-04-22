import { Search, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { AppShell } from "../components/AppShell"
import { wardrobeItems } from "../lib/mockData"

const categories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear"] as const
type Category = (typeof categories)[number]

export default function Wardrobe() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")
  const [query, setQuery] = useState("")

  const filteredItems = useMemo(() => {
    return wardrobeItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory

      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())

      return matchesCategory && matchesQuery
    })
  }, [selectedCategory, query])

  return (
    <AppShell>
      <header className="mb-5 pt-4">
        <h1 className="text-[28px] font-semibold tracking-[-0.3px]">
          Wardrobe
        </h1>
        <p className="mt-1 text-sm text-[#A8AFBE]">
          Search, organise, and rediscover your clothes
        </p>
      </header>

      <div className="mb-4 flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#151922] px-4 py-3">
        <Search size={16} className="text-[#6F7788]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your wardrobe"
          className="flex-1 bg-transparent text-sm text-[#F6F3EE] outline-none placeholder:text-[#6F7788]"
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const active = category === selectedCategory

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                active
                  ? "bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] text-white"
                  : "border border-white/10 bg-[#151922] text-[#A8AFBE]"
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-[20px] border border-white/8 bg-[#171C25]"
          >
            <div className="relative h-[110px] overflow-hidden bg-[#11151C]">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />

              {typeof item.wearCount === "number" && (
                <div className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] text-white">
                  {item.wearCount}x
                </div>
              )}
            </div>

            <div className="p-2">
              <p className="truncate text-xs font-medium text-[#F6F3EE]">
                {item.name}
              </p>
              <p className="mt-1 text-[11px] text-[#6F7788]">{item.category}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="fixed bottom-24 right-[max(24px,calc((100vw-430px)/2+24px))] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] text-white shadow-[0_8px_24px_rgba(255,92,130,0.28)] transition active:scale-[0.98]">
        <Plus size={24} />
      </button>
    </AppShell>
  )
}
