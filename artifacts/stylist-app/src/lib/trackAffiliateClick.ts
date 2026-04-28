import { Product } from "./types"

export function trackAffiliateClick(product: Product) {
  console.log("Affiliate click tracked:", {
    productId: product.id,
    productName: product.name,
    timestamp: new Date().toISOString(),
  })
}
