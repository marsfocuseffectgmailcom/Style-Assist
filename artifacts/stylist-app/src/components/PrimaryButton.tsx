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
        "h-12 rounded-[18px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] px-5 font-medium text-white shadow-[0_8px_24px_rgba(255,92,130,0.28)] transition active:scale-[0.98]",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}
