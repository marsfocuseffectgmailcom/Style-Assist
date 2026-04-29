import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Package, Plus, Trash2, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { SectionHeader } from "../components/SectionHeader"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { matchIncomingItem } from "../lib/outfitGenerator"
import type { IncomingItemMatchResult, IncomingItemOutfitMatch } from "../lib/outfitGenerator"
import type { IncomingItem } from "../lib/types"
import { wardrobeItems } from "../lib/mockData"

type Category = IncomingItem["category"]

const categories: Category[] = ["top", "bottom", "dress", "shoes", "outerwear", "accessory"]
const categoryLabel: Record<Category, string> = {
  top: "Top",
  bottom: "Bottom",
  dress: "Dress",
  shoes: "Shoes",
  outerwear: "Outerwear",
  accessory: "Accessory",
}

const categoryImages: Record<Category, string> = {
  top: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
  bottom: "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=400&q=80",
  dress: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
  outerwear: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80",
  accessory: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=400&q=80",
}

const deliveryStatusConfig = (days: number) => {
  if (days < 0) return { label: "Arrived", color: "#5F8F7F", bg: "rgba(95,143,127,0.12)" }
  if (days === 0) return { label: "Today", color: "#5F8F7F", bg: "rgba(95,143,127,0.12)" }
  if (days <= 3) return { label: `${days}d away`, color: "#7FA9A3", bg: "rgba(127,169,163,0.12)" }
  if (days <= 7) return { label: `${days}d away`, color: "#C8A96A", bg: "rgba(200,169,106,0.12)" }
  return { label: `${days}d away`, color: "#AABBC0", bg: "rgba(170,187,192,0.08)" }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  })
}

const blankForm = {
  name: "",
  category: "top" as Category,
  deliveryDate: "",
  storeName: "",
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 82 ? "#7FA9A3"
    : score >= 65 ? "#C8A96A"
    : "#AABBC0"
  return (
    <span
      className="shrink-0 text-[12px] font-bold tabular-nums"
      style={{ color }}
    >
      {score}
    </span>
  )
}

// ─── Single outfit match card ─────────────────────────────────────────────────

function MatchCard({
  match,
  anchorId,
}: {
  match: IncomingItemOutfitMatch
  anchorId: string
}) {
  return (
    <div
      className="rounded-[16px] p-3"
      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Thumbnails + score */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          {match.items.slice(0, 4).map((item) => (
            <div key={item.id} className="relative">
              <div
                className="h-9 w-9 overflow-hidden rounded-[10px]"
                style={{
                  backgroundColor: "#243140",
                  outline: item.id === anchorId ? "2px solid #7FA9A3" : "none",
                  outlineOffset: "1px",
                }}
              >
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              {item.id === anchorId && (
                <span
                  className="absolute -top-1 -right-1 rounded-full px-1 text-[8px] font-bold"
                  style={{ backgroundColor: "#7FA9A3", color: "#1F2A37" }}
                >
                  NEW
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {match.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize"
              style={{ backgroundColor: "rgba(127,169,163,0.10)", color: "#7FA9A3" }}
            >
              {tag}
            </span>
          ))}
          <ScoreBadge score={match.score} />
        </div>
      </div>

      {/* Item names (non-anchor) */}
      <div className="mt-2 space-y-0.5">
        {match.items
          .filter((i) => i.id !== anchorId)
          .map((item) => (
            <p key={item.id} className="truncate text-[11px] text-[#5E7580]">
              {item.name}
            </p>
          ))}
      </div>
    </div>
  )
}

// ─── Shoe status section ──────────────────────────────────────────────────────

function ShoeStatusSection({ result }: { result: IncomingItemMatchResult }) {
  if (result.shoeStatus === "incoming_is_shoe" || result.shoeStatus === "strong_single") return null

  if (result.shoeStatus === "no_match") {
    return (
      <div
        className="mt-2 flex items-center gap-2.5 rounded-[14px] px-3.5 py-2.5"
        style={{ backgroundColor: "rgba(200,169,106,0.07)", border: "1px solid rgba(200,169,106,0.15)" }}
      >
        <span className="text-[13px]">👟</span>
        <p className="text-[12px] leading-[17px] text-[#C8A96A]">
          Add neutral shoes to unlock stronger outfits.
        </p>
      </div>
    )
  }

  if (result.shoeStatus === "multiple" && result.bestShoes.length > 0) {
    return (
      <div
        className="mt-2 rounded-[14px] p-3"
        style={{ backgroundColor: "rgba(127,169,163,0.06)", border: "1px solid rgba(127,169,163,0.13)" }}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#5E7580]">
          Best shoe matches
        </p>
        <div className="space-y-1.5">
          {result.bestShoes.map((shoe) => (
            <div key={shoe.id} className="flex items-center gap-2">
              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-[8px] bg-[#243140]">
                <img src={shoe.image} alt={shoe.name} className="h-full w-full object-cover" />
              </div>
              <span className="flex-1 truncate text-[11px] text-[#AABBC0]">{shoe.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

// ─── Outfit matches panel ──────────────────────────────────────────────────────

function OutfitMatchesPanel({ item }: { item: IncomingItem }) {
  const result = useMemo(
    () => matchIncomingItem(item, wardrobeItems),
    [item.id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const isShoe  = item.category === "shoes"
  const isEmpty = result.matches.length === 0

  return (
    <div className="mt-3 border-t border-white/[0.06] pt-3">
      {isShoe && (
        <p className="mb-2.5 text-[12px] leading-[17px] text-[#7FA9A3]">
          When they arrive, these look best:
        </p>
      )}

      {isEmpty ? (
        <p className="text-[12px] text-[#5E7580]">
          Add more wardrobe pieces to see outfit combinations.
        </p>
      ) : (
        <div className="space-y-2">
          {result.matches.map((match) => (
            <MatchCard key={match.id} match={match} anchorId={item.id} />
          ))}
        </div>
      )}

      <ShoeStatusSection result={result} />
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function IncomingItemsScreen() {
  const navigate = useNavigate()
  const { items, addItem, removeItem, daysUntilDelivery } = useIncomingItems()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blankForm)
  const [submitting, setSubmitting] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const sorted = [...items].sort(
    (a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
  )

  function handleSubmit() {
    if (!form.name || !form.deliveryDate || !form.storeName) return
    setSubmitting(true)
    addItem({
      name: form.name,
      category: form.category,
      image: categoryImages[form.category],
      styleTags: [],
      deliveryDate: form.deliveryDate,
      storeName: form.storeName,
    })
    setForm(blankForm)
    setShowForm(false)
    setSubmitting(false)
  }

  const minDate = new Date().toISOString().slice(0, 10)

  return (
    <AppShell>
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/timeline")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#A8B0B8] transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold leading-[26px] tracking-[-0.02em] text-[#F5F5F5]">
            Incoming Deliveries
          </h1>
          <p className="text-[12px] leading-[16px] font-medium text-[#9CA3AF]">
            {items.length} item{items.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F6F73]/15 text-[#3F6F73] transition hover:bg-[#3F6F73]/25"
          aria-label="Add item"
        >
          <Plus size={18} />
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="mb-5 space-y-3">
              <h3 className="text-[14px] font-semibold text-[#F2F4F5]">Add Incoming Item</h3>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-[#6B8490]">
                  Item name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. White Linen Blazer"
                  className="w-full rounded-[14px] border border-white/10 bg-[#243140] px-4 py-3 text-sm text-[#F2F4F5] placeholder-[#4D6A78] outline-none focus:border-[#3F6F73]/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-[#6B8490]">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                    className="w-full appearance-none rounded-[14px] border border-white/10 bg-[#243140] px-4 py-3 text-sm text-[#F2F4F5] outline-none focus:border-[#3F6F73]/40"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {categoryLabel[c]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B8490]" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-[#6B8490]">
                  Store / Brand
                </label>
                <input
                  value={form.storeName}
                  onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
                  placeholder="e.g. ASOS, Zara"
                  className="w-full rounded-[14px] border border-white/10 bg-[#243140] px-4 py-3 text-sm text-[#F2F4F5] placeholder-[#4D6A78] outline-none focus:border-[#3F6F73]/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-[#6B8490]">
                  Estimated delivery date
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={form.deliveryDate}
                  onChange={(e) => setForm((f) => ({ ...f, deliveryDate: e.target.value }))}
                  className="w-full rounded-[14px] border border-white/10 bg-[#243140] px-4 py-3 text-sm text-[#F2F4F5] outline-none focus:border-[#3F6F73]/40"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowForm(false); setForm(blankForm) }}
                  className="flex h-[52px] flex-1 items-center justify-center rounded-[18px] border border-[rgba(168,176,184,0.28)] text-[15px] font-semibold text-[#F5F5F5] transition-[transform] duration-[160ms] active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.name || !form.deliveryDate || !form.storeName}
                  className="flex h-14 flex-1 items-center justify-center rounded-[18px] bg-[#3F6F73] text-base font-bold text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] transition-[transform] duration-[160ms] active:scale-[0.97] disabled:opacity-45"
                >
                  Add Item
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.length === 0 ? (
        <Card className="py-12 text-center">
          <Package size={32} className="mx-auto mb-3 text-[#6B8490]" />
          <p className="text-sm font-medium text-[#AABBC0]">No incoming deliveries</p>
          <p className="mt-1 text-xs text-[#6B8490]">
            Add items you&apos;ve ordered so we can include them in outfit suggestions after they arrive
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-[14px] bg-[#3F6F73]/15 px-5 py-2.5 text-sm font-semibold text-[#3F6F73]"
          >
            Add First Item
          </button>
        </Card>
      ) : (
        <section>
          <SectionHeader title="Your deliveries" />
          <div className="space-y-3">
            {sorted.map((item) => {
              const days      = daysUntilDelivery(item)
              const status    = deliveryStatusConfig(days)
              const expanded  = expandedIds.has(item.id)
              return (
                <motion.div
                  key={item.id}
                  layout
                  className="overflow-hidden rounded-[20px] border border-white/8 bg-[#2A3645]"
                >
                  {/* ── Item row ── */}
                  <div className="flex items-center gap-3 p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[#243140]">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#F2F4F5]">{item.name}</p>
                      <p className="mt-0.5 text-xs text-[#6B8490]">{item.storeName}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-[#AABBC0]">Arrives {formatDate(item.deliveryDate)}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ color: status.color, backgroundColor: status.bg }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-center gap-1.5">
                      {/* Outfit matches toggle */}
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition"
                        style={{
                          backgroundColor: expanded ? "rgba(127,169,163,0.15)" : "rgba(127,169,163,0.08)",
                          color: "#7FA9A3",
                        }}
                        aria-label={expanded ? "Hide outfit matches" : "Show outfit matches"}
                      >
                        <Sparkles size={11} />
                        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B8490] transition hover:bg-white/5 hover:text-[#7FA9A3]"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* ── Outfit matches panel ── */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden px-3 pb-3"
                      >
                        <OutfitMatchesPanel item={item} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          <Card className="mt-5 border-dashed border-[#C8A96A]/25 bg-[#C8A96A]/5">
            <p className="text-[13px] text-[#AABBC0]">
              <span className="font-semibold text-[#C8A96A]">How it works:</span> Incoming items are automatically
              included in outfit suggestions once their delivery date has passed.
            </p>
          </Card>
        </section>
      )}
    </AppShell>
  )
}
