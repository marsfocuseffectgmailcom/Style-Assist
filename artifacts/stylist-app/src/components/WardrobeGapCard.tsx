import type { WardrobeGap } from "../lib/types"

type WardrobeGapCardProps = {
  gap: WardrobeGap
  onShop?: (gap: WardrobeGap) => void
}

export function WardrobeGapCard({ gap, onShop }: WardrobeGapCardProps) {
  const priorityStyles =
    gap.priority === "high"
      ? "border border-[#B86B6B]/25 bg-[#B86B6B]/10 text-[#C47A7A]"
      : gap.priority === "medium"
        ? "border border-[#C8A96A]/25 bg-[#C8A96A]/10 text-[#C8A96A]"
        : "border border-[#5F8F7F]/25 bg-[#5F8F7F]/10 text-[#7FA9A3]"

  return (
    <div className="rounded-[20px] border border-white/10 bg-[#2A3645] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-[#F2F4F5]">
            {gap.title}
          </h3>
          <p className="mt-1 text-sm text-[#AABBC0]">{gap.description}</p>
        </div>

        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${priorityStyles}`}>
          {gap.priority}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#AABBC0]">
        {gap.reason}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {gap.styleTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#C8A96A]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="truncate text-[11px] text-[#6B8490]">
          Search: {gap.searchQuery}
        </p>

        <button
          onClick={() => onShop?.(gap)}
          className="rounded-full bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] px-3 py-2 text-xs font-semibold text-white"
        >
          Shop this gap
        </button>
      </div>
    </div>
  )
}
