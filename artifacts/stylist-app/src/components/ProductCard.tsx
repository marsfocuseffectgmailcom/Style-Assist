import type { HTMLAttributes } from "react"
import type { RecommendedProduct } from "../lib/types"
import { useAffiliateClickTracking } from "../hooks/useAffiliateClickTracking"

type ProductCardProps = HTMLAttributes<HTMLDivElement> & {
  product: RecommendedProduct
  sourceScreen?: "shop" | "stylist" | "gap-analysis" | "home"
  buttonLabel?: string
}

export function ProductCard({
  product,
  sourceScreen = "shop",
  buttonLabel = "View",
  className = "",
  ...props
}: ProductCardProps) {
  const { trackClick } = useAffiliateClickTracking({ sourceScreen })

  return (
    <article
      className={`flex items-center gap-3 rounded-[20px] border border-white/10 bg-[#151922] p-3 ${className}`}
      {...props}
    >
      <div className="h-16 w-16 overflow-hidden rounded-[16px] bg-[#11151C]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-[#F6F3EE]">
          {product.name}
        </h4>

        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6F7788]">
          {product.brand} · {product.merchant}
        </p>

        <p className="mt-2 text-sm text-[#F6F3EE]">
          {product.currency} {product.price}
        </p>

        {product.matchedWardrobeGapTitle ? (
          <p className="mt-1 text-[11px] text-[#A8AFBE]">
            For: {product.matchedWardrobeGapTitle}
          </p>
        ) : null}
      </div>

      <button
        onClick={() => trackClick(product)}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#F6F3EE] transition hover:bg-white/10"
      >
        {buttonLabel}
      </button>
    </article>
  )
}
