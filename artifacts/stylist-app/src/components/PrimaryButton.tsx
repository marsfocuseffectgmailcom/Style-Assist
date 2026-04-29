import type { ButtonHTMLAttributes, ReactNode } from "react"

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  fullWidth?: boolean
}

export function PrimaryButton({
  children,
  className = "",
  fullWidth = true,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        "flex h-14 items-center justify-center rounded-[18px] bg-[#3F6F73] px-5",
        "text-base font-bold tracking-[-0.01em] text-white",
        "shadow-[0_8px_20px_rgba(63,111,115,0.24)]",
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
