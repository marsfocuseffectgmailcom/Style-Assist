import { getAllAdapters } from "../adapters/registry"
import type { RecommendedProduct, WardrobeGap } from "../types/shop"

export async function searchProductsForGap(gap: WardrobeGap): Promise<RecommendedProduct[]> {
  const adapters = getAllAdapters()
  const results = await Promise.allSettled(adapters.map((a) => a.search(gap)))

  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
}
