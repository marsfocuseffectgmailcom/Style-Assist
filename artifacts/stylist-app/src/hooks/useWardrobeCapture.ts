import { useState, useCallback } from "react"

const STORAGE_KEY = "style-assist-captured-items"

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeatherTag = "All weather" | "Hot" | "Mild" | "Cold"
export type FitType    = "Slim" | "Regular" | "Relaxed" | "Oversized"
export type ItemStatus = "Clean" | "In wash" | "On loan"

export type CapturedItem = {
  id: string
  name: string
  category: "Tops" | "Bottoms" | "Shoes" | "Outerwear" | "Dress"
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
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
        const canvas = document.createElement("canvas")
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.75))
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

  const addItem = useCallback((item: CapturedItem) => {
    setItems((prev) => {
      const next = [item, ...prev]
      save(next)
      return next
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      save(next)
      return next
    })
  }, [])

  return { items, addItem, removeItem }
}
