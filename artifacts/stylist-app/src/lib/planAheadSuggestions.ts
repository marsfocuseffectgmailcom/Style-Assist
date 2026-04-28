import type { EventType, PlannedOutfitItem } from "./types"

type SuggestionTemplate = Omit<PlannedOutfitItem, "id" | "purchaseStatus"> & {
  estimatedDeliveryDays: number
}

export type SuggestionWithDelivery = PlannedOutfitItem & {
  estimatedDeliveryDays: number
}

const suggestions: Record<EventType, SuggestionTemplate[]> = {
  wedding: [
    {
      name: "Satin Midi Dress",
      category: "Dress",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 189",
      brand: "ASOS",
      estimatedDeliveryDays: 7,
    },
    {
      name: "Strappy Heeled Sandals",
      category: "Shoes",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 129",
      brand: "Zara",
      estimatedDeliveryDays: 6,
    },
    {
      name: "Pearl Clutch Bag",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 89",
      brand: "ASOS",
      estimatedDeliveryDays: 4,
    },
    {
      name: "Delicate Gold Necklace",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 65",
      brand: "H&M",
      estimatedDeliveryDays: 3,
    },
  ],
  party: [
    {
      name: "Sequin Mini Dress",
      category: "Dress",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 149",
      brand: "SHEIN",
      estimatedDeliveryDays: 10,
    },
    {
      name: "Block Heel Mules",
      category: "Shoes",
      image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 99",
      brand: "Zara",
      estimatedDeliveryDays: 5,
    },
    {
      name: "Mini Chain Bag",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 79",
      brand: "ASOS",
      estimatedDeliveryDays: 4,
    },
  ],
  birthday: [
    {
      name: "Wrap Midi Dress",
      category: "Dress",
      image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 119",
      brand: "Zara",
      estimatedDeliveryDays: 6,
    },
    {
      name: "Kitten Heel Pumps",
      category: "Shoes",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 109",
      brand: "ASOS",
      estimatedDeliveryDays: 7,
    },
    {
      name: "Velvet Hair Claw",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 28",
      brand: "SHEIN",
      estimatedDeliveryDays: 12,
    },
  ],
  christmas: [
    {
      name: "Deep Red Velvet Dress",
      category: "Dress",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 159",
      brand: "Zara",
      estimatedDeliveryDays: 7,
    },
    {
      name: "Festive Blazer",
      category: "Tops",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 139",
      brand: "ASOS",
      estimatedDeliveryDays: 5,
    },
    {
      name: "Pointed Toe Heels",
      category: "Shoes",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 119",
      brand: "Zara",
      estimatedDeliveryDays: 6,
    },
  ],
  halloween: [
    {
      name: "Sheer Black Blouse",
      category: "Tops",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 69",
      brand: "SHEIN",
      estimatedDeliveryDays: 14,
    },
    {
      name: "Faux Leather Mini Skirt",
      category: "Bottoms",
      image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 79",
      brand: "ASOS",
      estimatedDeliveryDays: 5,
    },
    {
      name: "Platform Ankle Boots",
      category: "Shoes",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 149",
      brand: "Zara",
      estimatedDeliveryDays: 6,
    },
  ],
  easter: [
    {
      name: "Floral Wrap Dress",
      category: "Dress",
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 129",
      brand: "ASOS",
      estimatedDeliveryDays: 7,
    },
    {
      name: "Pastel Linen Blazer",
      category: "Tops",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 149",
      brand: "Zara",
      estimatedDeliveryDays: 6,
    },
    {
      name: "Woven Tote Bag",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 79",
      brand: "ASOS",
      estimatedDeliveryDays: 4,
    },
  ],
  custom: [
    {
      name: "Tailored Trousers",
      category: "Bottoms",
      image: "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 109",
      brand: "Zara",
      estimatedDeliveryDays: 6,
    },
    {
      name: "Silk Camisole",
      category: "Tops",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 89",
      brand: "ASOS",
      estimatedDeliveryDays: 5,
    },
    {
      name: "Leather Loafers",
      category: "Shoes",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      source: "suggestion",
      price: "AUD 139",
      brand: "Zara",
      estimatedDeliveryDays: 6,
    },
  ],
}

export function getSuggestionsForEvent(type: EventType): SuggestionWithDelivery[] {
  const templates = suggestions[type] ?? suggestions.custom
  return templates.map((t) => ({
    ...t,
    id: Math.random().toString(36).slice(2, 10),
    purchaseStatus: "not_purchased",
  }))
}
