import type { MerchantAdapter } from "../registry"
import type { RecommendedProduct, WardrobeGap } from "../../types/shop"

export const sheinAdapter: MerchantAdapter = {
  merchant: "SHEIN",
  async search(_gap: WardrobeGap): Promise<RecommendedProduct[]> {
    return []
  },
}
