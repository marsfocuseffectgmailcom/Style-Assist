import { env } from "../../lib/env"
import type {
  MerchantAdapter,
  MerchantSearchParams,
  RawMerchantProduct,
} from "../../types/shop"

function buildAsosAffiliateUrl(productUrl: string): string {
  if (!env.asosAffiliateBaseUrl) return productUrl
  return `${env.asosAffiliateBaseUrl}?redirect=${encodeURIComponent(productUrl)}`
}

async function searchAsosMock(params: MerchantSearchParams): Promise<RawMerchantProduct[]> {
  return [
    {
      id: "asos-1",
      merchant: "ASOS",
      title: `Tailored Single-Breasted Blazer - ${params.query}`,
      brand: "ASOS DESIGN",
      price: 89.0,
      currency: "AUD",
      imageUrl:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
      productUrl: "https://www.asos.com/example-blazer",
      affiliateUrl: buildAsosAffiliateUrl("https://www.asos.com/example-blazer"),
      category: params.category || "outerwear",
      colors: params.colorPreferences || ["beige"],
      sizes: ["6", "8", "10", "12", "14"],
      inStock: true,
      rating: 4.5,
      reviewCount: 126,
    },
  ]
}

async function searchAsosApi(params: MerchantSearchParams): Promise<RawMerchantProduct[]> {
  // Replace with actual ASOS partner or affiliate product source later
  return searchAsosMock(params)
}

export const asosAdapter: MerchantAdapter = {
  merchant: "ASOS",
  enabled: true,
  async searchProducts(params) {
    if (env.useMockMerchantData) {
      return searchAsosMock(params)
    }
    return searchAsosApi(params)
  },
}
