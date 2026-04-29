import { ChevronRight } from "lucide-react"

type SectionHeaderProps = {
  title: string
  actionLabel?: string
  onActionClick?: () => void
  className?: string
}

export function SectionHeader({
  title,
  actionLabel,
  onActionClick,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-4 flex items-center justify-between ${className}`}>
      <h3 className="text-[20px] font-bold leading-[26px] tracking-[-0.02em] text-[#F5F5F5]">
        {title}
      </h3>

      {actionLabel ? (
        <button
          onClick={onActionClick}
          className="flex items-center gap-1 text-[13px] font-medium text-[#A8B0B8] transition hover:text-[#F5F5F5]"
        >
          {actionLabel}
          <ChevronRight size={14} />
        </button>
      ) : null}
    </div>
  )
}
