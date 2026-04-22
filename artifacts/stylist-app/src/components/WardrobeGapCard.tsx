import type { WardrobeGap } from "../lib/types"

type WardrobeGapCardProps = {
  gap: WardrobeGap
  onShop?: (gap: WardrobeGap) => void
}

export function WardrobeGapCard({ gap, onShop }: WardrobeGapCardProps) {
  const priorityStyles =
    gap.priority === "high"
      ? "bg-[#3B1F28] text-[#FF9FBC]"
      : gap.priority === "medium"
        ? "bg-[#3A2B1A] text-[#F0C27B]"
        : "bg-[#1E2A2A] text-[#8FD3C1]"

  return (
    <div className="rounded-[20px] border border-white/10 bg-[#151922] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-[#F6F3EE]">
            {gap.title}
          </h3>
          <p className="mt-1 text-sm text-[#A8AFBE]">{gap.description}</p>
        </div>

        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${priorityStyles}`}>
          {gap.priority}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#A8AFBE]">
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
        <p className="truncate text-[11px] text-[#6F7788]">
          Search: {gap.searchQuery}
        </p>

        <button
          onClick={() => onShop?.(gap)}
          className="rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] px-3 py-2 text-xs font-semibold text-white"
        >
          Shop this gap
        </button>
      </div>
    </div>
  )
}
