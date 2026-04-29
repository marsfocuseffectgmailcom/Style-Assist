import type { HTMLAttributes, ReactNode } from "react"

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  hero?: boolean
  elevated?: boolean
  gradient?: boolean
}

export function Card({
  children,
  className = "",
  hero = false,
  elevated = false,
  gradient = false,
  ...props
}: CardProps) {
  const radius   = hero ? "rounded-[28px]" : "rounded-[24px]"
  const padding  = hero ? "p-5" : "p-4"
  const shadow   = hero || elevated
    ? "shadow-[0_16px_40px_rgba(0,0,0,0.20)]"
    : "shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
  const bg = gradient
    ? "bg-gradient-to-b from-[#243140] to-[#1C2A37]"
    : "bg-[#2A3645]"

  return (
    <div
      className={[
        radius,
        padding,
        shadow,
        bg,
        "border border-white/6",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  )
}
