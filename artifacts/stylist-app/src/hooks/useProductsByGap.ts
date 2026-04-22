import { useCallback, useEffect, useState } from "react"
import type { Merchant, RecommendedProduct, WardrobeGap } from "../lib/types"
import { fetchProductsByGap } from "../lib/shopApiClient"

type UseProductsByGapArgs = {
  gap: WardrobeGap | null
  merchants?: Merchant[]
  limitPerMerchant?: number
  enabled?: boolean
}

type UseProductsByGapResult = {
  products: RecommendedProduct[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  clear: () => void
}

export function useProductsByGap({
  gap,
  merchants,
  limitPerMerchant = 4,
  enabled = true,
}: UseProductsByGapArgs): UseProductsByGapResult {
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!gap || !enabled) {
      setProducts([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const nextProducts = await fetchProductsByGap({
        gap,
        merchants,
        limitPerMerchant,
      })

      setProducts(nextProducts)
    } catch (err) {
      console.error("useProductsByGap failed", err)
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [gap, merchants, limitPerMerchant, enabled])

  useEffect(() => {
    load()
  }, [load])

  const clear = useCallback(() => {
    setProducts([])
    setError(null)
    setLoading(false)
  }, [])

  return {
    products,
    loading,
    error,
    reload: load,
    clear,
  }
}
