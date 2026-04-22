import { affiliateMockData } from "./affiliateMockData"
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

export async function fetchWardrobeGapAnalysis(): Promise<WardrobeGap[]> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  return affiliateMockData.wardrobeGaps
}

export async function fetchRecommendedProducts(
  request?: ProductSearchRequest,
): Promise<RecommendedProduct[]> {
  await new Promise((resolve) => setTimeout(resolve, 250))

  let products = affiliateMockData.recommendedProducts

  if (request?.merchant && request.merchant !== "All") {
    products = products.filter((product) => product.merchant === request.merchant)
  }

  if (request?.category) {
    products = products.filter((product) => product.category === request.category)
  }

  if (request?.query) {
    const q = request.query.toLowerCase()
    products = products.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.styleTags.some((tag) => tag.toLowerCase().includes(q)) ||
        (product.matchedWardrobeGapTitle || "").toLowerCase().includes(q)
      )
    })
  }

  return products
}

export async function fetchShoppingRecommendations(): Promise<ShoppingRecommendationResponse> {
  const [wardrobeGaps, recommendedProducts] = await Promise.all([
    fetchWardrobeGapAnalysis(),
    fetchRecommendedProducts(),
  ])

  return { wardrobeGaps, recommendedProducts }
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
