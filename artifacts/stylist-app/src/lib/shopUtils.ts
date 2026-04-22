import type { Merchant, RecommendedProduct, WardrobeGap } from "./types"

export function filterProductsByMerchant(
  products: RecommendedProduct[],
  merchant: Merchant | "All",
) {
  if (merchant === "All") return products
  return products.filter((product) => product.merchant === merchant)
}

export function getProductsForGap(
  products: RecommendedProduct[],
  gapId: string,
) {
  return products.filter((product) => product.matchedWardrobeGapId === gapId)
}

export function groupProductsByGap(
  products: RecommendedProduct[],
  gaps: WardrobeGap[],
) {
  return gaps.map((gap) => ({
    gap,
    products: getProductsForGap(products, gap.id),
  }))
}
