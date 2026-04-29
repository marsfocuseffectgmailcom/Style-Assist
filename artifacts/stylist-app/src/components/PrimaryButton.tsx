import type { ButtonHTMLAttributes, ReactNode } from "react"

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  fullWidth?: boolean
}

export function PrimaryButton({
  children,
  className = "",
  fullWidth = true,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={[
        "h-12 rounded-[18px] bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] px-5 font-medium text-white shadow-[0_8px_24px_rgba(63,111,115,0.28)] transition active:scale-[0.98]",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}
