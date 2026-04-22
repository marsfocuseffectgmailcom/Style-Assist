import type { AffiliateClickEvent, RecommendedProduct } from "./types"

export function trackAffiliateClick(event: AffiliateClickEvent) {
  const existing = localStorage.getItem("affiliate_click_events")
  const parsed: AffiliateClickEvent[] = existing ? JSON.parse(existing) : []

  parsed.push(event)

  localStorage.setItem("affiliate_click_events", JSON.stringify(parsed))
}

export function openAffiliateProduct(
  product: RecommendedProduct,
  sourceScreen: AffiliateClickEvent["sourceScreen"] = "shop",
) {
  trackAffiliateClick({
    productId: product.id,
    merchant: product.merchant,
    affiliateUrl: product.affiliateUrl,
    matchedWardrobeGapId: product.matchedWardrobeGapId,
    clickedAtIso: new Date().toISOString(),
    sourceScreen,
  })

  window.open(product.affiliateUrl || product.productUrl, "_blank", "noopener,noreferrer")
}
