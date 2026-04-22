export type Merchant =
  | "Amazon"
  | "SHEIN"
  | "Temu"
  | "ASOS"
  | "Zara"
  | "H&M"
  | "AffiliateNetwork"
  | "Direct"

export type GenderProfile = "women" | "men" | "unisex"

export type WardrobeGapPriority = "high" | "medium" | "low"

export type WardrobeGap = {
  id: string
  title: string
  description: string
  category:
    | "tops"
    | "bottoms"
    | "shoes"
    | "outerwear"
    | "accessories"
    | "dress"
    | "bags"
  priority: WardrobeGapPriority
  reason: string
  searchQuery: string
  styleTags: string[]
  colorPreferences?: string[]
  occasion?: string
}

export type RecommendedProduct = {
  id: string
  name: string
  brand: string
  merchant: Merchant
  price: string
  currency: string
  image: string
  productUrl: string
  affiliateUrl: string
  commissionEligible: boolean
  category: string
  styleTags: string[]
  availableSizes?: string[]
  colors?: string[]
  matchedWardrobeGapId?: string
  matchedWardrobeGapTitle?: string
  rating?: number
  reviewCount?: number
  inStock?: boolean
}

export type ShoppingRecommendationResponse = {
  wardrobeGaps: WardrobeGap[]
  recommendedProducts: RecommendedProduct[]
}
