import type { HTMLAttributes } from "react"

type ProductCardProps = HTMLAttributes<HTMLDivElement> & {
  name: string
  brand: string
  price: string
  image: string
  buttonLabel?: string
}

export function ProductCard({
  name,
  brand,
  price,
  image,
  buttonLabel = "View",
  className = "",
  ...props
}: ProductCardProps) {
  return (
    <article
      className={`flex items-center gap-3 rounded-[20px] border border-white/10 bg-[#151922] p-3 ${className}`}
      {...props}
    >
      <div className="h-16 w-16 overflow-hidden rounded-[16px] bg-[#11151C]">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-[#F6F3EE]">
          {name}
        </h4>
        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6F7788]">
          {brand}
        </p>
        <p className="mt-2 text-sm text-[#F6F3EE]">{price}</p>
      </div>

      <button className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#F6F3EE] transition hover:bg-white/10">
        {buttonLabel}
      </button>
    </article>
  )
}
