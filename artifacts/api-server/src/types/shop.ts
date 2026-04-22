export type Merchant =
  | "Amazon"
  | "SHEIN"
  | "Temu"
  | "ASOS"

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

export type RawMerchantProduct = {
  id: string
  merchant: Merchant
  title: string
  brand?: string
  price?: number | string
  currency?: string
  imageUrl?: string
  productUrl?: string
  affiliateUrl?: string
  category?: string
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
  rating?: number
  reviewCount?: number
  metadata?: Record<string, unknown>
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

export type MerchantSearchParams = {
  query: string
  category?: string
  colorPreferences?: string[]
  styleTags?: string[]
  limit?: number
}

export type MerchantAdapter = {
  merchant: Merchant
  enabled: boolean
  searchProducts(params: MerchantSearchParams): Promise<RawMerchantProduct[]>
}

export type SearchProductsRequest = {
  query: string
  merchants?: Merchant[]
  category?: string
  colorPreferences?: string[]
  styleTags?: string[]
  matchedWardrobeGapId?: string
  matchedWardrobeGapTitle?: string
  limitPerMerchant?: number
}
