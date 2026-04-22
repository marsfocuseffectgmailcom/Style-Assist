import { env } from "../../lib/env"
import type {
  MerchantAdapter,
  MerchantSearchParams,
  RawMerchantProduct,
} from "../../types/shop"

function buildAmazonAffiliateUrl(productUrl: string): string {
  if (!env.amazonAffiliateTag) return productUrl

  const separator = productUrl.includes("?") ? "&" : "?"
  return `${productUrl}${separator}tag=${encodeURIComponent(env.amazonAffiliateTag)}`
}

async function searchAmazonMock(params: MerchantSearchParams): Promise<RawMerchantProduct[]> {
  return [
    {
      id: "amazon-1",
      merchant: "Amazon",
      title: `Minimal Leather Loafers - ${params.query}`,
      brand: "Amazon Essentials",
      price: 74.99,
      currency: "AUD",
      imageUrl:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      productUrl: "https://www.amazon.com/example-loafers",
      affiliateUrl: buildAmazonAffiliateUrl("https://www.amazon.com/example-loafers"),
      category: params.category || "shoes",
      colors: params.colorPreferences || ["black"],
      sizes: ["38", "39", "40", "41"],
      inStock: true,
      rating: 4.3,
      reviewCount: 248,
    },
  ]
}

async function searchAmazonApi(params: MerchantSearchParams): Promise<RawMerchantProduct[]> {
  // Replace this with Amazon PA-API logic when ready
  return searchAmazonMock(params)
}

export const amazonAdapter: MerchantAdapter = {
  merchant: "Amazon",
  enabled: true,
  async searchProducts(params) {
    if (env.useMockMerchantData) {
      return searchAmazonMock(params)
    }
    return searchAmazonApi(params)
  },
}
