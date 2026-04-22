import type { Merchant, RecommendedProduct, WardrobeGap } from "./types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

type SearchProductsRequest = {
  query: string
  merchants?: Merchant[]
  category?: string
  colorPreferences?: string[]
  styleTags?: string[]
  matchedWardrobeGapId?: string
  matchedWardrobeGapTitle?: string
  limitPerMerchant?: number
}

type SearchProductsResponse = {
  products: RecommendedProduct[]
}

type ProductsByGapRequest = {
  gap: WardrobeGap
  merchants?: Merchant[]
  limitPerMerchant?: number
}

type ShopRecommendationsResponse = {
  wardrobeGaps: WardrobeGap[]
  recommendedProducts: RecommendedProduct[]
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${text}`,
    )
  }

  return response.json() as Promise<T>
}

export async function searchProducts(
  payload: SearchProductsRequest,
): Promise<RecommendedProduct[]> {
  const data = await apiFetch<SearchProductsResponse>("/api/shop/products/search", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return data.products
}

export async function fetchProductsByGap(
  payload: ProductsByGapRequest,
): Promise<RecommendedProduct[]> {
  const data = await apiFetch<SearchProductsResponse>("/api/shop/products/by-gap", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return data.products
}

export async function fetchShopRecommendations(): Promise<ShopRecommendationsResponse> {
  const module = await import("./shopService")
  return module.fetchShoppingRecommendations()
}
