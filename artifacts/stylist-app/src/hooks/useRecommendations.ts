import { getRecommendation } from "../lib/wardrobeRecommendations"
import { products } from "../lib/productsData"

export function useRecommendations() {
  const recommendation = getRecommendation()

  if (!recommendation) return { recommendation: null, products: [] }

  const filteredProducts = products.filter(
    (p) => p.category === recommendation.suggestedCategory.toLowerCase()
  )

  return { recommendation, products: filteredProducts }
}
