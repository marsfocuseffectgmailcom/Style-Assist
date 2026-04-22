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
    ? "bg-gradient-to-br from-[#FF4D8D] via-[#C8A96A] to-[#FF7A5C] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_24px_rgba(255,92,130,0.18)]"
    : "bg-transparent"

  const imageHeight = compact ? "h-[110px]" : "h-[120px]"

  return (
    <div
      className={`min-w-[128px] rounded-[20px] p-[1px] ${outerClasses} ${className}`}
      {...props}
    >
      <div className="h-full rounded-[20px] border border-white/8 bg-[#171C25] p-2">
        <div className={`mb-2 overflow-hidden rounded-[16px] bg-[#11151C] ${imageHeight}`}>
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#F6F3EE]">{title}</h3>
          <p className="text-xs text-[#A8AFBE]">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
