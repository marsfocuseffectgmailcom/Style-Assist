import type { InputHTMLAttributes } from "react"
import { Search } from "lucide-react"

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>

export function SearchInput({
  className = "",
  ...props
}: SearchInputProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#151922] px-4 py-3",
        className,
      ].join(" ")}
    >
      <Search size={16} className="text-[#6F7788]" />
      <input
        className="flex-1 bg-transparent text-sm text-[#F6F3EE] outline-none placeholder:text-[#6F7788]"
        {...props}
      />
    </div>
  )
}
