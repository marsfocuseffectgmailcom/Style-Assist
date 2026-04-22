import { env } from "../../lib/env"
import type {
  MerchantAdapter,
  MerchantSearchParams,
  RawMerchantProduct,
} from "../../types/shop"

function buildTemuAffiliateUrl(productUrl: string): string {
  if (!env.temuAffiliateBaseUrl) return productUrl
  return `${env.temuAffiliateBaseUrl}?redirect=${encodeURIComponent(productUrl)}`
}

async function searchTemuMock(params: MerchantSearchParams): Promise<RawMerchantProduct[]> {
  return [
    {
      id: "temu-1",
      merchant: "Temu",
      title: `Structured Neutral Blazer - ${params.query}`,
      brand: "Temu",
      price: 31.5,
      currency: "AUD",
      imageUrl:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
      productUrl: "https://www.temu.com/example-blazer",
      affiliateUrl: buildTemuAffiliateUrl("https://www.temu.com/example-blazer"),
      category: params.category || "outerwear",
      colors: params.colorPreferences || ["camel"],
      sizes: ["S", "M", "L", "XL"],
      inStock: true,
      rating: 3.9,
      reviewCount: 54,
    },
  ]
}

async function searchTemuApi(params: MerchantSearchParams): Promise<RawMerchantProduct[]> {
  // Replace with actual Temu affiliate/API logic later
  return searchTemuMock(params)
}

export const temuAdapter: MerchantAdapter = {
  merchant: "Temu",
  enabled: true,
  async searchProducts(params) {
    if (env.useMockMerchantData) {
      return searchTemuMock(params)
    }
    return searchTemuApi(params)
  },
}
