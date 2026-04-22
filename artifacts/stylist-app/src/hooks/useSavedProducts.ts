import { useCallback, useEffect, useMemo, useState } from "react"
import type { RecommendedProduct } from "../lib/types"

const STORAGE_KEY = "drape_saved_products"

function readSavedProducts(): RecommendedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecommendedProduct[]
  } catch (error) {
    console.error("Failed to read saved products", error)
    return []
  }
}

function writeSavedProducts(products: RecommendedProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (error) {
    console.error("Failed to write saved products", error)
  }
}

export function useSavedProducts() {
  const [savedProducts, setSavedProducts] = useState<RecommendedProduct[]>([])

  useEffect(() => {
    setSavedProducts(readSavedProducts())
  }, [])

  const savedProductIds = useMemo(
    () => new Set(savedProducts.map((product) => product.id)),
    [savedProducts],
  )

  const isSaved = useCallback(
    (productId: string) => savedProductIds.has(productId),
    [savedProductIds],
  )

  const saveProduct = useCallback((product: RecommendedProduct) => {
    setSavedProducts((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current
      }

      const next = [product, ...current]
      writeSavedProducts(next)
      return next
    })
  }, [])

  const unsaveProduct = useCallback((productId: string) => {
    setSavedProducts((current) => {
      const next = current.filter((item) => item.id !== productId)
      writeSavedProducts(next)
      return next
    })
  }, [])

  const toggleSavedProduct = useCallback((product: RecommendedProduct) => {
    setSavedProducts((current) => {
      const exists = current.some((item) => item.id === product.id)

      const next = exists
        ? current.filter((item) => item.id !== product.id)
        : [product, ...current]

      writeSavedProducts(next)
      return next
    })
  }, [])

  const clearSavedProducts = useCallback(() => {
    writeSavedProducts([])
    setSavedProducts([])
  }, [])

  return {
    savedProducts,
    savedCount: savedProducts.length,
    isSaved,
    saveProduct,
    unsaveProduct,
    toggleSavedProduct,
    clearSavedProducts,
  }
}
