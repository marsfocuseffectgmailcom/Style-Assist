import type {
  Merchant,
  RecommendedProduct,
  ShoppingRecommendationResponse,
  WardrobeGap,
} from "./types"

export type ProductSearchRequest = {
  query: string
  merchant?: Merchant | "All"
  category?: string
  styleTags?: string[]
  colorPreferences?: string[]
}

export async function fetchWardrobeGapAnalysis(): Promise<WardrobeGap[]> { return [] }
export async function fetchRecommendedProducts(_request?: ProductSearchRequest): Promise<RecommendedProduct[]> { return [] }
export async function fetchShoppingRecommendations(): Promise<ShoppingRecommendationResponse> {
  return { wardrobeGaps: [], recommendedProducts: [] }
}

export async function fetchProductsByGap(gap: WardrobeGap): Promise<RecommendedProduct[]> {
  const response = await fetch("/api/shop/products/by-gap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gap,
      merchants: ["Amazon", "SHEIN", "Temu", "ASOS"],
      limitPerMerchant: 4,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch products by gap")
  }

  const data = await response.json()
  return data.products
}

