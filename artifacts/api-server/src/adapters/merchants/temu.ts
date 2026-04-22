import type { MerchantAdapter } from "../registry"
import type { RecommendedProduct, WardrobeGap } from "../../types/shop"

export const temuAdapter: MerchantAdapter = {
  merchant: "Temu",
  async search(_gap: WardrobeGap): Promise<RecommendedProduct[]> {
    return []
  },
}
