import { env } from "../../lib/env"
import type {
  MerchantAdapter,
  MerchantSearchParams,
  RawMerchantProduct,
} from "../../types/shop"

function buildSheinAffiliateUrl(productUrl: string): string {
  if (!env.sheinAffiliateBaseUrl) return productUrl
  return `${env.sheinAffiliateBaseUrl}?redirect=${encodeURIComponent(productUrl)}`
}

async function searchSheinMock(params: MerchantSearchParams): Promise<RawMerchantProduct[]> {
  return [
    {
      id: "shein-1",
      merchant: "SHEIN",
      title: `Slim Classic Belt - ${params.query}`,
      brand: "SHEIN",
      price: 12.95,
      currency: "AUD",
      imageUrl:
        "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
      productUrl: "https://au.shein.com/example-belt",
      affiliateUrl: buildSheinAffiliateUrl("https://au.shein.com/example-belt"),
      category: params.category || "accessories",
      colors: params.colorPreferences || ["black", "tan"],
      sizes: ["S", "M", "L"],
      inStock: true,
      rating: 4.1,
      reviewCount: 89,
    },
  ]
}

async function searchSheinApi(params: MerchantSearchParams): Promise<RawMerchantProduct[]> {
  // Replace with actual SHEIN affiliate feed/API logic later
  return searchSheinMock(params)
}

export const sheinAdapter: MerchantAdapter = {
  merchant: "SHEIN",
  enabled: true,
  async searchProducts(params) {
    if (env.useMockMerchantData) {
      return searchSheinMock(params)
    }
    return searchSheinApi(params)
  },
}
