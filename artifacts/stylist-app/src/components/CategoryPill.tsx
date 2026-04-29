import type { ButtonHTMLAttributes, ReactNode } from "react"

type CategoryPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  children: ReactNode
}

export function CategoryPill({
  active = false,
  children,
  className = "",
  ...props
}: CategoryPillProps) {
  return (
    <button
      className={[
        "rounded-full px-4 py-2 text-sm transition",
        active
          ? "bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] text-white shadow-[0_8px_24px_rgba(63,111,115,0.20)]"
          : "border border-white/10 bg-[#2A3645] text-[#AABBC0] hover:text-[#F2F4F5]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}
