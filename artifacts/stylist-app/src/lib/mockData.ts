export type { RecommendedProduct, WardrobeGap, Merchant, GenderProfile, WardrobeGapPriority, AffiliateClickEvent, ShoppingRecommendationResponse } from "./types"

export type OutfitCard = {
  id: number
  title: string
  subtitle: string
  image: string
  selected?: boolean
}

export type WardrobeItem = {
  id: number
  name: string
  category: "Tops" | "Bottoms" | "Shoes" | "Outerwear" | "Bags" | "Accessories"
  image: string
  color?: string
  colors: string[]
  styleTags: string[]
  seasonTags: string[]
  wearCount?: number
}

export const quickActions = [
  { id: 1, label: "Work" },
  { id: 2, label: "Date Night" },
  { id: 3, label: "Weekend" },
  { id: 4, label: "Event" },
]

export const outfitCards: OutfitCard[] = [
  {
    id: 1,
    title: "Outfit 1",
    subtitle: "Clean neutrals",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Outfit 2",
    subtitle: "Lunch meeting",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    selected: true,
  },
  {
    id: 3,
    title: "Outfit 3",
    subtitle: "Soft tailoring",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  },
]

export const wardrobeItems: WardrobeItem[] = [
  {
    id: 1,
    name: "Brown Blazer",
    category: "Outerwear",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    color: "brown",
    colors: ["brown", "tan"],
    styleTags: ["smart casual", "polished", "professional", "tailored"],
    seasonTags: ["autumn", "winter", "spring"],
    wearCount: 1,
  },
  {
    id: 2,
    name: "Cream Knit",
    category: "Tops",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    color: "cream",
    colors: ["cream"],
    styleTags: ["minimal", "casual", "cozy", "relaxed", "clean"],
    seasonTags: ["autumn", "winter"],
    wearCount: 3,
  },
  {
    id: 3,
    name: "Black Coat",
    category: "Outerwear",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["clean", "minimal", "elegant", "classic", "polished"],
    seasonTags: ["winter", "autumn"],
    wearCount: 2,
  },
  {
    id: 4,
    name: "Blue Denim",
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    color: "blue",
    colors: ["blue", "denim"],
    styleTags: ["casual", "relaxed", "everyday", "weekend"],
    seasonTags: ["all-season"],
    wearCount: 2,
  },
  {
    id: 5,
    name: "Beige Trousers",
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=800&q=80",
    color: "beige",
    colors: ["beige"],
    styleTags: ["minimal", "clean", "professional", "polished", "tailored"],
    seasonTags: ["spring", "summer", "autumn"],
    wearCount: 1,
  },
  {
    id: 6,
    name: "Black Trousers",
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["professional", "clean", "polished", "tailored", "elegant"],
    seasonTags: ["all-season"],
    wearCount: 4,
  },
  {
    id: 7,
    name: "White Sneakers",
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    color: "white",
    colors: ["white"],
    styleTags: ["casual", "relaxed", "clean", "minimal", "sporty"],
    seasonTags: ["spring", "summer"],
    wearCount: 5,
  },
  {
    id: 8,
    name: "Black Loafers",
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["smart casual", "polished", "minimal", "professional", "clean"],
    seasonTags: ["all-season"],
    wearCount: 2,
  },
  {
    id: 9,
    name: "Black Heels",
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["elegant", "dressy", "polished", "formal", "feminine"],
    seasonTags: ["all-season"],
    wearCount: 1,
  },
  {
    id: 10,
    name: "Black T-Shirt",
    category: "Tops",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["minimal", "casual", "clean", "everyday"],
    seasonTags: ["all-season"],
  },
  {
    id: 11,
    name: "Blue Jeans",
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    color: "blue",
    colors: ["blue", "denim"],
    styleTags: ["casual", "relaxed", "everyday", "weekend"],
    seasonTags: ["all-season"],
  },
  // ── Bags ──────────────────────────────────────────────────────────────────
  {
    id: 12,
    name: "Black Structured Tote",
    category: "Bags",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["professional", "polished", "clean", "minimal", "tailored"],
    seasonTags: ["all-season"],
    wearCount: 3,
  },
  {
    id: 13,
    name: "Tan Leather Crossbody",
    category: "Bags",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    color: "tan",
    colors: ["tan", "camel"],
    styleTags: ["casual", "smart casual", "relaxed", "minimal", "everyday"],
    seasonTags: ["all-season"],
    wearCount: 4,
  },
  {
    id: 14,
    name: "Black Clutch",
    category: "Bags",
    image:
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["elegant", "formal", "dressy", "feminine", "polished"],
    seasonTags: ["all-season"],
    wearCount: 1,
  },
  // ── Accessories ───────────────────────────────────────────────────────────
  {
    id: 15,
    name: "Black Leather Belt",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["tailored", "professional", "polished", "clean", "structured"],
    seasonTags: ["all-season"],
    wearCount: 2,
  },
  {
    id: 16,
    name: "Ivory Silk Scarf",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
    color: "ivory",
    colors: ["ivory", "cream"],
    styleTags: ["elegant", "polished", "feminine", "smart casual", "chic"],
    seasonTags: ["autumn", "spring", "winter"],
    wearCount: 1,
  },
  {
    id: 17,
    name: "Gold Minimal Necklace",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
    color: "gold",
    colors: ["gold"],
    styleTags: ["elegant", "minimal", "feminine", "clean", "polished"],
    seasonTags: ["all-season"],
    wearCount: 2,
  },
  {
    id: 18,
    name: "Classic Sunglasses",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    color: "black",
    colors: ["black"],
    styleTags: ["casual", "minimal", "relaxed", "everyday", "clean"],
    seasonTags: ["spring", "summer"],
    wearCount: 3,
  },
]
