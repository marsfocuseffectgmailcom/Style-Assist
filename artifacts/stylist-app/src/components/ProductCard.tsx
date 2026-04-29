import { Heart } from "lucide-react"
import type { HTMLAttributes, MouseEvent } from "react"
import type { RecommendedProduct } from "../lib/types"
import { useSavedProducts } from "../hooks/useSavedProducts"
import { useRecentlyViewed } from "../hooks/useRecentlyViewed"
import { useAffiliateClickTracking } from "../hooks/useAffiliateClickTracking"

type ProductCardProps = HTMLAttributes<HTMLDivElement> & {
  product: RecommendedProduct
  sourceScreen?: "shop" | "stylist" | "gap-analysis" | "home"
  buttonLabel?: string
  badge?: string
  showMerchantBadge?: boolean
  showSaveButton?: boolean
  onProductClick?: (product: RecommendedProduct) => void
  onTrackedClick?: (product: RecommendedProduct) => void
}

export function ProductCard({
  product,
  sourceScreen = "shop",
  buttonLabel = "View",
  badge,
  showMerchantBadge = false,
  showSaveButton = true,
  onProductClick,
  onTrackedClick,
  className = "",
  ...props
}: ProductCardProps) {
  const { isSaved, toggleSavedProduct } = useSavedProducts()
  const { addRecentlyViewed } = useRecentlyViewed()
  const { trackClick } = useAffiliateClickTracking({
    sourceScreen,
  })

  const saved = isSaved(product.id)

  const resolvedBadge = badge || (showMerchantBadge ? product.merchant : undefined)

  function handleSaveClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    toggleSavedProduct(product)
  }

  function handleProductOpen() {
    addRecentlyViewed(product)
    trackClick(product)

    if (onTrackedClick) {
      onTrackedClick(product)
    }

    if (onProductClick) {
      onProductClick(product)
    }
  }

  return (
    <article
      className={`flex items-center gap-3 rounded-[20px] border border-white/10 bg-[#2A3645] p-3 ${className}`}
      {...props}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] bg-[#1C2A37]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />

        {resolvedBadge ? (
          <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {resolvedBadge}
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-[#F2F4F5]">
          {product.name}
        </h4>

        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6B8490]">
          {product.brand}
        </p>

        <p className="mt-2 text-sm text-[#F2F4F5]">
          {product.currency} {product.price}
        </p>

        {product.matchedWardrobeGapTitle ? (
          <p className="mt-1 truncate text-[11px] text-[#AABBC0]">
            For: {product.matchedWardrobeGapTitle}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-2">
        {showSaveButton ? (
          <button
            type="button"
            onClick={handleSaveClick}
            aria-label={saved ? "Remove from saved products" : "Save product"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              saved
                ? "border-[#3F6F73]/30 bg-[#3F6F73]/15 text-[#5F8F8A]"
                : "border-white/10 bg-white/5 text-[#AABBC0] hover:bg-white/10 hover:text-[#F2F4F5]"
            }`}
          >
            <Heart
              size={16}
              className={saved ? "fill-current" : ""}
            />
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleProductOpen}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#F2F4F5] transition hover:bg-white/10"
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  )
}
