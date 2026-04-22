import { useCallback, useEffect, useState } from "react"
import type { RecommendedProduct, WardrobeGap } from "../lib/types"
import { fetchShopRecommendations } from "../lib/shopApiClient"

type UseShopRecommendationsResult = {
  wardrobeGaps: WardrobeGap[]
  recommendedProducts: RecommendedProduct[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useShopRecommendations(): UseShopRecommendationsResult {
  const [wardrobeGaps, setWardrobeGaps] = useState<WardrobeGap[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchShopRecommendations()
      setWardrobeGaps(data.wardrobeGaps)
      setRecommendedProducts(data.recommendedProducts)
    } catch (err) {
      console.error("useShopRecommendations failed", err)
      setError(err instanceof Error ? err.message : "Failed to load recommendations")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    wardrobeGaps,
    recommendedProducts,
    loading,
    error,
    reload: load,
  }
}
