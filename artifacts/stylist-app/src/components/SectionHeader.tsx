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
    <div className={`mb-3 flex items-center justify-between ${className}`}>
      <h3 className="text-[18px] font-semibold text-[#F6F3EE]">{title}</h3>

      {actionLabel ? (
        <button
          onClick={onActionClick}
          className="flex items-center gap-1 text-sm text-[#A8AFBE] transition hover:text-[#F6F3EE]"
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      ) : null}
    </div>
  )
}
