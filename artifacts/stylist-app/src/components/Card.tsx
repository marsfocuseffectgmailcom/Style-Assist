import type { HTMLAttributes, ReactNode } from "react"

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  elevated?: boolean
  gradient?: boolean
}

export function Card({
  children,
  className = "",
  elevated = false,
  gradient = false,
  ...props
}: CardProps) {
  const baseClasses =
    "rounded-[24px] border border-white/10 p-4"

  const backgroundClasses = gradient
    ? "bg-gradient-to-b from-[#243140] to-[#1C2A37]"
    : "bg-[#2A3645]"

  const shadowClasses = elevated
    ? "shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
    : ""

  return (
    <div
      className={[baseClasses, backgroundClasses, shadowClasses, className].join(
        " ",
      )}
      {...props}
    >
      {children}
    </div>
  )
}
