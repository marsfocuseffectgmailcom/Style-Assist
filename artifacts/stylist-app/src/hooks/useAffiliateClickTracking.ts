import { useCallback } from "react"
import type { AffiliateClickEvent, RecommendedProduct } from "../lib/types"
import { openAffiliateProduct } from "../lib/affiliate"

type UseAffiliateClickTrackingArgs = {
  sourceScreen: AffiliateClickEvent["sourceScreen"]
  onTracked?: (event: AffiliateClickEvent) => void
}

export function useAffiliateClickTracking({
  sourceScreen,
  onTracked,
}: UseAffiliateClickTrackingArgs) {
  const trackClick = useCallback(
    (product: RecommendedProduct) => {
      const event: AffiliateClickEvent = {
        productId: product.id,
        merchant: product.merchant,
        affiliateUrl: product.affiliateUrl,
        matchedWardrobeGapId: product.matchedWardrobeGapId,
        clickedAtIso: new Date().toISOString(),
        sourceScreen,
      }

      try {
        // local tracking (already handled in openAffiliateProduct)
        openAffiliateProduct(product, sourceScreen)

        // optional hook for analytics layer
        if (onTracked) {
          onTracked(event)
        }

        // optional future backend tracking
        if (import.meta.env.VITE_ENABLE_CLICK_API === "true") {
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/analytics/affiliate-click`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(event),
            },
          ).catch(() => {
            // fail silently — never block UX
          })
        }
      } catch (err) {
        console.error("Affiliate click tracking failed", err)
      }
    },
    [sourceScreen, onTracked],
  )

  return {
    trackClick,
  }
}
