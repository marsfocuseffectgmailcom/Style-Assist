import type { MerchantAdapter } from "../../types/shop"

// No authorised live product feed is configured yet. Never present sample prices,
// stock, ratings or placeholder URLs as purchasable products.
export const sheinAdapter: MerchantAdapter = {
  merchant: "SHEIN",
  enabled: false,
  async searchProducts() { return [] },
}
