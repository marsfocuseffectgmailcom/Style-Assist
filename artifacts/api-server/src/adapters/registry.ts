import { amazonAdapter } from "./merchants/amazon"
import { sheinAdapter } from "./merchants/shein"
import { temuAdapter } from "./merchants/temu"
import { asosAdapter } from "./merchants/asos"
import type { Merchant, MerchantAdapter } from "../types/shop"

const adapters: MerchantAdapter[] = [
  amazonAdapter,
  sheinAdapter,
  temuAdapter,
  asosAdapter,
]

export function getEnabledMerchantAdapters(): MerchantAdapter[] {
  return adapters.filter((adapter) => adapter.enabled)
}

export function getMerchantAdapters(merchants?: Merchant[]): MerchantAdapter[] {
  if (!merchants || merchants.length === 0) {
    return getEnabledMerchantAdapters()
  }

  return adapters.filter(
    (adapter) => adapter.enabled && merchants.includes(adapter.merchant),
  )
}
