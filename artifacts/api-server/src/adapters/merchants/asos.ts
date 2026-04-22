import type { MerchantAdapter } from "../registry"
import type { RecommendedProduct, WardrobeGap } from "../../types/shop"

export const asosAdapter: MerchantAdapter = {
  merchant: "ASOS",
  async search(_gap: WardrobeGap): Promise<RecommendedProduct[]> {
    return []
  },
}
