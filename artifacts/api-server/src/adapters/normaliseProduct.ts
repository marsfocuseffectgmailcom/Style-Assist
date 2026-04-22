import type { RecommendedProduct } from "../types/shop"

export function normaliseProduct(raw: Record<string, unknown>): RecommendedProduct {
  return raw as RecommendedProduct
}
