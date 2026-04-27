import { X, ExternalLink, Heart } from "lucide-react"
import type { RecommendedProduct } from "../lib/types"
import { useAffiliateClickTracking } from "../hooks/useAffiliateClickTracking"
import { useSavedProducts } from "../hooks/useSavedProducts"

type ProductDetailsModalProps = {
  product: RecommendedProduct
  onClose: () => void
}

export function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const { trackClick } = useAffiliateClickTracking({ sourceScreen: "shop" })
  const { isSaved, toggleSavedProduct } = useSavedProducts()

  const saved = isSaved(product.id)

  function handleViewAtRetailer() {
    trackClick(product)
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[430px] rounded-t-[28px] bg-[#151922] pb-8">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20" />

        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-xs uppercase tracking-[0.12em] text-[#6F7788]">
            {product.merchant}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-[#A8AFBE] transition hover:bg-white/15"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mx-5 overflow-hidden rounded-[20px] bg-[#11151C]">
          <img
            src={product.image}
            alt={product.name}
            className="h-56 w-full object-cover"
          />
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] font-semibold leading-tight text-[#F6F3EE]">
                {product.name}
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6F7788]">
                {product.brand}
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleSavedProduct(product)}
              aria-label={saved ? "Remove from saved products" : "Save product"}
              className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                saved
                  ? "border-[#FF4D8D]/30 bg-[#FF4D8D]/15 text-[#FF78A8]"
                  : "border-white/10 bg-white/5 text-[#A8AFBE] hover:bg-white/10 hover:text-[#F6F3EE]"
              }`}
            >
              <Heart size={16} className={saved ? "fill-current" : ""} />
            </button>
          </div>

          <p className="mt-3 text-[22px] font-semibold text-[#F6F3EE]">
            {product.currency} {product.price}
          </p>

          {product.matchedWardrobeGapTitle ? (
            <p className="mt-2 text-sm text-[#A8AFBE]">
              Recommended for: {product.matchedWardrobeGapTitle}
            </p>
          ) : null}

          {product.styleTags && product.styleTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.styleTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/8 px-3 py-1 text-[11px] text-[#A8AFBE]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {product.inStock === false ? (
            <p className="mt-3 text-sm text-[#FF7A5C]">Currently out of stock</p>
          ) : null}

          <button
            type="button"
            onClick={handleViewAtRetailer}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] font-semibold text-white shadow-[0_8px_24px_rgba(255,92,130,0.28)] transition active:scale-[0.97]"
          >
            <ExternalLink size={17} />
            View at retailer
          </button>
        </div>
      </div>
    </div>
  )
}
