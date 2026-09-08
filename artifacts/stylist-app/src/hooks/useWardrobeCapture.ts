import { useState, useCallback, useEffect } from "react"

const STORAGE_KEY = "style-assist-captured-items"

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeatherTag = "All weather" | "Hot" | "Mild" | "Cold"
export type FitType    = "Slim" | "Regular" | "Relaxed" | "Oversized"
export type ItemStatus = "Clean" | "In wash" | "On loan"

export type CapturedItem = {
  id: string
  name: string
  category: "Tops" | "Bottoms" | "Shoes" | "Outerwear" | "Dress" | "Bags" | "Accessories"
  image: string           // compressed front photo data URL
  backPhoto?: string
  tagPhoto?: string
  colors: string[]
  styleTags: string[]
  seasonTags: string[]
  wearCount: number
  // AI-detected (editable)
  aiCategory: string
  aiColour: string
  aiPattern: string
  aiStyle: string
  aiMaterialGuess: string // clearly labelled guess
  aiSeason: string
  aiOccasion: string
  materialSource?: "label" | "user" | "unknown"
  recognitionReviewed?: boolean
  // Manual
  brand?: string
  size?: string
  fit?: FitType
  material?: string       // user-confirmed material
  weatherSuitability: WeatherTag[]
  status: ItemStatus
  addedAt: string
  price?: number        // what the user paid (for cost-per-wear)
}

// ─── Image compression ────────────────────────────────────────────────────────

export async function compressImage(file: File, maxDim = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read photo"))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error("Unsupported photo. Try JPEG or PNG."))
      img.onload = () => {
        try {
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
        const canvas = document.createElement("canvas")
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
        } catch (error) { reject(error) }
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function load(): CapturedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(items: CapturedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useWardrobeCapture() {
  const [items, setItems] = useState<CapturedItem[]>(load)

  useEffect(() => {
    const sync = () => setItems(load())
    window.addEventListener("style-assist-wardrobe-changed", sync)
    window.addEventListener("storage", sync)
    return () => { window.removeEventListener("style-assist-wardrobe-changed", sync); window.removeEventListener("storage", sync) }
  }, [])

  const addItem = useCallback((item: CapturedItem) => {
    const next = [item, ...load().filter(i => i.id !== item.id)]
    save(next) // Throw before success UI when browser storage is full.
    setItems(next)
    window.dispatchEvent(new Event("style-assist-wardrobe-changed"))
  }, [])
  const removeItem = useCallback((id: string) => {
    const next = load().filter(i => i.id !== id)
    save(next)
    setItems(next)
    window.dispatchEvent(new Event("style-assist-wardrobe-changed"))
  }, [])
  return { items, addItem, removeItem }
}
