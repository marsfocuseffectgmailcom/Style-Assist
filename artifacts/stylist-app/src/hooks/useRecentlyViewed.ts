import { useCallback, useEffect, useState } from "react"
import type { RecommendedProduct } from "../lib/types"

const STORAGE_KEY = "drape_recently_viewed_products"
const MAX_RECENTLY_VIEWED = 20

function readRecentlyViewed(): RecommendedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecommendedProduct[]
  } catch (error) {
    console.error("Failed to read recently viewed products", error)
    return []
  }
}

function writeRecentlyViewed(products: RecommendedProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (error) {
    console.error("Failed to write recently viewed products", error)
  }
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecommendedProduct[]>([])

  useEffect(() => {
    setRecentlyViewed(readRecentlyViewed())
  }, [])

  const addRecentlyViewed = useCallback((product: RecommendedProduct) => {
    setRecentlyViewed((current) => {
      const deduped = current.filter((item) => item.id !== product.id)
      const next = [product, ...deduped].slice(0, MAX_RECENTLY_VIEWED)
      writeRecentlyViewed(next)
      return next
    })
  }, [])

  const removeRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed((current) => {
      const next = current.filter((item) => item.id !== productId)
      writeRecentlyViewed(next)
      return next
    })
  }, [])

  const clearRecentlyViewed = useCallback(() => {
    writeRecentlyViewed([])
    setRecentlyViewed([])
  }, [])

  return {
    recentlyViewed,
    recentlyViewedCount: recentlyViewed.length,
    addRecentlyViewed,
    removeRecentlyViewed,
    clearRecentlyViewed,
  }
}
