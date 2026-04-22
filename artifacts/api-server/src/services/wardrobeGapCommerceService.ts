import { searchProductsAcrossMerchants } from "./productSearchService"
import type {
  Merchant,
  RecommendedProduct,
  WardrobeGap,
} from "../types/shop"

export async function getProductsForWardrobeGap(args: {
  gap: WardrobeGap
  merchants?: Merchant[]
  limitPerMerchant?: number
}): Promise<RecommendedProduct[]> {
  const { gap, merchants, limitPerMerchant = 4 } = args

  return searchProductsAcrossMerchants({
    query: gap.searchQuery,
    merchants,
    category: gap.category,
    colorPreferences: gap.colorPreferences,
    styleTags: gap.styleTags,
    matchedWardrobeGapId: gap.id,
    matchedWardrobeGapTitle: gap.title,
    limitPerMerchant,
  })
}
