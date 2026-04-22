import { getMerchantAdapters } from "../adapters/registry"
import { normaliseProducts } from "../adapters/normaliseProduct"
import type {
  RecommendedProduct,
  SearchProductsRequest,
} from "../types/shop"

export async function searchProductsAcrossMerchants(
  request: SearchProductsRequest,
): Promise<RecommendedProduct[]> {
  const adapters = getMerchantAdapters(request.merchants)

  const results = await Promise.all(
    adapters.map(async (adapter) => {
      const rawProducts = await adapter.searchProducts({
        query: request.query,
        category: request.category,
        colorPreferences: request.colorPreferences,
        styleTags: request.styleTags,
        limit: request.limitPerMerchant,
      })

      return normaliseProducts(rawProducts, {
        styleTags: request.styleTags,
        matchedWardrobeGapId: request.matchedWardrobeGapId,
        matchedWardrobeGapTitle: request.matchedWardrobeGapTitle,
      })
    }),
  )

  return results.flat()
}
