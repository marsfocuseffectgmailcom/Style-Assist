import type {
  RawMerchantProduct,
  RecommendedProduct,
} from "../types/shop"

type NormaliseArgs = {
  raw: RawMerchantProduct
  styleTags?: string[]
  matchedWardrobeGapId?: string
  matchedWardrobeGapTitle?: string
}

export function normaliseProduct({
  raw,
  styleTags = [],
  matchedWardrobeGapId,
  matchedWardrobeGapTitle,
}: NormaliseArgs): RecommendedProduct {
  return {
    id: raw.id,
    name: raw.title,
    brand: raw.brand || raw.merchant,
    merchant: raw.merchant,
    price: typeof raw.price === "number" ? raw.price.toFixed(2) : String(raw.price ?? ""),
    currency: raw.currency || "AUD",
    image: raw.imageUrl || "",
    productUrl: raw.productUrl || "",
    affiliateUrl: raw.affiliateUrl || raw.productUrl || "",
    commissionEligible: Boolean(raw.affiliateUrl),
    category: raw.category || "general",
    styleTags,
    availableSizes: raw.sizes || [],
    colors: raw.colors || [],
    matchedWardrobeGapId,
    matchedWardrobeGapTitle,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    inStock: raw.inStock,
  }
}

export function normaliseProducts(
  raws: RawMerchantProduct[],
  options?: {
    styleTags?: string[]
    matchedWardrobeGapId?: string
    matchedWardrobeGapTitle?: string
  },
): RecommendedProduct[] {
  return raws.map((raw) =>
    normaliseProduct({
      raw,
      styleTags: options?.styleTags,
      matchedWardrobeGapId: options?.matchedWardrobeGapId,
      matchedWardrobeGapTitle: options?.matchedWardrobeGapTitle,
    }),
  )
}
