import type { HTMLAttributes } from "react"

type OutfitCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  subtitle: string
  image: string
  selected?: boolean
  compact?: boolean
}

export function OutfitCard({
  title,
  subtitle,
  image,
  selected = false,
  compact = false,
  className = "",
  ...props
}: OutfitCardProps) {
  const outerClasses = selected
    ? "bg-gradient-to-br from-[#3F6F73] via-[#C8A96A] to-[#7FA9A3] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_24px_rgba(63,111,115,0.18)]"
    : "bg-transparent"

  const imageHeight = compact ? "h-[110px]" : "h-[120px]"

  return (
    <div
      className={`min-w-[128px] rounded-[20px] p-[1px] ${outerClasses} ${className}`}
      {...props}
    >
      <div className="h-full rounded-[20px] border border-white/8 bg-[#202E3E] p-2">
        <div className={`mb-2 overflow-hidden rounded-[16px] bg-[#1C2A37] ${imageHeight}`}>
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#F2F4F5]">{title}</h3>
          <p className="text-xs text-[#AABBC0]">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
