import type { Merchant } from "./types"

export type MerchantConfig = {
  merchant: Merchant
  displayName: string
  enabled: boolean
  affiliateSupported: boolean
  deepLinkBase?: string
  notes?: string
}

export const merchantConfigs: MerchantConfig[] = [
  {
    merchant: "Amazon",
    displayName: "Amazon",
    enabled: true,
    affiliateSupported: true,
    notes: "Use Amazon affiliate links or PA-API where available",
  },
  {
    merchant: "SHEIN",
    displayName: "SHEIN",
    enabled: true,
    affiliateSupported: true,
    notes: "Use affiliate network or campaign links",
  },
  {
    merchant: "Temu",
    displayName: "Temu",
    enabled: true,
    affiliateSupported: true,
    notes: "Use supported affiliate campaign links if approved",
  },
  {
    merchant: "ASOS",
    displayName: "ASOS",
    enabled: true,
    affiliateSupported: true,
    notes: "Use affiliate network product links",
  },
  {
    merchant: "Zara",
    displayName: "Zara",
    enabled: false,
    affiliateSupported: false,
    notes: "May require manual linking or non-affiliate product references",
  },
  {
    merchant: "H&M",
    displayName: "H&M",
    enabled: false,
    affiliateSupported: false,
    notes: "Enable later if affiliate access becomes available",
  },
]
