import type { ShoppingRecommendationResponse, WardrobeGap } from "../types/shop"
import { searchProductsForGap } from "./productSearchService"

export async function buildShoppingRecommendations(
  gaps: WardrobeGap[],
): Promise<ShoppingRecommendationResponse> {
  const productGroups = await Promise.all(gaps.map(searchProductsForGap))

  return {
    wardrobeGaps: gaps,
    recommendedProducts: productGroups.flat(),
  }
}
