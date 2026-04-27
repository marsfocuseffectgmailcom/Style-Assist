import { wardrobeItems } from "./mockData"
import { Recommendation } from "./types"

export function getRecommendation(): Recommendation | null {
  const hasShoes = wardrobeItems.some(
    (item) => item.category.toLowerCase() === "shoes"
  )

  if (!hasShoes) {
    return {
      id: "rec1",
      gap: "You're missing versatile shoes",
      suggestedCategory: "Shoes",
    }
  }

  return null
}
