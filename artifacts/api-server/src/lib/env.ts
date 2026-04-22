function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback
}

export const env = {
  port: Number(optional("PORT", "3001")),

  amazonAffiliateTag: optional("AMAZON_AFFILIATE_TAG"),
  sheinAffiliateBaseUrl: optional("SHEIN_AFFILIATE_BASE_URL"),
  temuAffiliateBaseUrl: optional("TEMU_AFFILIATE_BASE_URL"),
  asosAffiliateBaseUrl: optional("ASOS_AFFILIATE_BASE_URL"),

  useMockMerchantData: optional("USE_MOCK_MERCHANT_DATA", "true") === "true",

  // Add these later if you get actual APIs:
  amazonApiKey: optional("AMAZON_API_KEY"),
  amazonApiSecret: optional("AMAZON_API_SECRET"),
  sheinApiKey: optional("SHEIN_API_KEY"),
  temuApiKey: optional("TEMU_API_KEY"),
  asosApiKey: optional("ASOS_API_KEY"),
}
