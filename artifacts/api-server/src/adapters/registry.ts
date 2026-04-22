import type { Merchant, RecommendedProduct, WardrobeGap } from "../types/shop"

export type MerchantAdapter = {
  merchant: Merchant
  search(gap: WardrobeGap): Promise<RecommendedProduct[]>
}

const adapters = new Map<Merchant, MerchantAdapter>()

export function registerAdapter(adapter: MerchantAdapter) {
  adapters.set(adapter.merchant, adapter)
}

export function getAdapter(merchant: Merchant): MerchantAdapter | undefined {
  return adapters.get(merchant)
}

export function getAllAdapters(): MerchantAdapter[] {
  return Array.from(adapters.values())
}
