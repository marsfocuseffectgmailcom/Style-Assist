import type { ButtonHTMLAttributes, ReactNode } from "react"

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  fullWidth?: boolean
}

export function SecondaryButton({
  children,
  className = "",
  fullWidth = true,
  disabled,
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        "flex h-[52px] items-center justify-center rounded-[18px] bg-transparent px-5",
        "border border-[rgba(168,176,184,0.28)]",
        "text-[15px] font-semibold text-[#F5F5F5]",
        "disabled:opacity-45",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}
