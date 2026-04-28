import type { IncomingItem } from "./types"

function daysFromToday(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const mockIncomingItems: IncomingItem[] = [
  {
    id: "inc-1",
    name: "Cream Linen Blazer",
    category: "outerwear",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    color: "cream",
    styleTags: ["smart casual", "tailored", "neutral"],
    deliveryDate: daysFromToday(3),
    storeName: "Zara",
  },
  {
    id: "inc-2",
    name: "Satin Slip Dress",
    category: "dress",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    color: "champagne",
    styleTags: ["evening", "elegant", "minimal"],
    deliveryDate: daysFromToday(6),
    storeName: "ASOS",
  },
  {
    id: "inc-3",
    name: "White Chunky Trainers",
    category: "shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    color: "white",
    styleTags: ["casual", "sporty", "everyday"],
    deliveryDate: daysFromToday(9),
    storeName: "ASOS",
  },
  {
    id: "inc-4",
    name: "Ribbed Midi Skirt",
    category: "bottom",
    image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=800&q=80",
    color: "chocolate",
    styleTags: ["minimal", "tonal", "chic"],
    deliveryDate: daysFromToday(14),
    storeName: "Zara",
  },
]
