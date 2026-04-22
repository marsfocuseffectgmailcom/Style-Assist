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
  category: "Tops" | "Bottoms" | "Shoes" | "Outerwear"
  image: string
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
    wearCount: 1,
  },
  {
    id: 2,
    name: "Cream Knit",
    category: "Tops",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    wearCount: 3,
  },
  {
    id: 3,
    name: "Black Coat",
    category: "Outerwear",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    wearCount: 2,
  },
  {
    id: 4,
    name: "Blue Denim",
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    wearCount: 2,
  },
  {
    id: 5,
    name: "Beige Trousers",
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=800&q=80",
    wearCount: 1,
  },
  {
    id: 6,
    name: "Black Trousers",
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=800&q=80",
    wearCount: 4,
  },
  {
    id: 7,
    name: "White Sneakers",
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    wearCount: 5,
  },
  {
    id: 8,
    name: "Black Loafers",
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    wearCount: 2,
  },
  {
    id: 9,
    name: "Black Heels",
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    wearCount: 1,
  },
]
