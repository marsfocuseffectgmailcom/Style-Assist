import type { MerchantAdapter } from "../registry"
import type { RecommendedProduct, WardrobeGap } from "../../types/shop"

export const amazonAdapter: MerchantAdapter = {
  merchant: "Amazon",
  async search(_gap: WardrobeGap): Promise<RecommendedProduct[]> {
    return []
  },
}
