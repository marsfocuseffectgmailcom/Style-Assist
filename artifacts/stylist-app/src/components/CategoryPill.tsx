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
          ? "bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] text-white shadow-[0_8px_24px_rgba(255,92,130,0.20)]"
          : "border border-white/10 bg-[#151922] text-[#A8AFBE] hover:text-[#F6F3EE]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}
