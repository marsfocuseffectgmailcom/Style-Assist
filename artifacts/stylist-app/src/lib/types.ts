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

export type AffiliateClickEvent = {
  productId: string
  merchant: Merchant
  affiliateUrl: string
  matchedWardrobeGapId?: string
  clickedAtIso: string
  sourceScreen: "shop" | "stylist" | "gap-analysis" | "home"
}

export type ShoppingRecommendationResponse = {
  wardrobeGaps: WardrobeGap[]
  recommendedProducts: RecommendedProduct[]
}

export type Recommendation = {
  id: string
  gap: string
  suggestedCategory: "Tops" | "Bottoms" | "Shoes" | "Outerwear"
}

export type Product = {
  id: string
  name: string
  image: string
  price: number
  category: "top" | "bottom" | "shoes" | "outerwear"
}

export type EventType =
  | "wedding"
  | "party"
  | "birthday"
  | "christmas"
  | "halloween"
  | "easter"
  | "custom"

export type DeliveryStatus = "Safe delivery" | "Risky delivery" | "Too late"

export type PurchaseStatus = "not_purchased" | "waiting_for_delivery" | "arrived"

export type PlannedEvent = {
  id: string
  type: EventType
  name: string
  date: string
  createdAt: string
}

export type PlannedOutfitItem = {
  id: string
  name: string
  image: string
  category: string
  source: "wardrobe" | "suggestion"
  purchaseStatus: PurchaseStatus
  price?: string
  brand?: string
}

export type PlannedOutfit = {
  id: string
  eventId: string
  items: PlannedOutfitItem[]
  notes?: string
  createdAt: string
}

export type OutfitConfidence = "high" | "safe" | "experimental"

export type TimelineOutfit = {
  id: string
  date: string
  name: string
  items: PlannedOutfitItem[]
  confidence: OutfitConfidence
  tags: string[]
  eventId?: string
  createdAt: string
}

export type IncomingItem = {
  id: string
  name: string
  category: "top" | "bottom" | "dress" | "shoes" | "outerwear" | "accessory"
  image: string
  color?: string
  styleTags: string[]
  deliveryDate: string
  storeName: string
}
