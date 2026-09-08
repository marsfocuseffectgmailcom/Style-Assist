import { compressImage } from "../hooks/useWardrobeCapture"

export type Detection = {
  category: string; garmentType: string; colour: string; pattern: string; style: string;
  materialGuess: string; materialFromLabel: string; labelText: string;
  season: string; occasion: string; brand: string; size: string;
  needsReview: boolean; notes: string; isClothing: boolean;
}
export const emptyDetection: Detection = {
  category: "", garmentType: "", colour: "", pattern: "", style: "", materialGuess: "",
  materialFromLabel: "", labelText: "", season: "All season", occasion: "", brand: "", size: "",
  needsReview: true, notes: "Enter the details you know. Material can be left blank.", isClothing: true,
}
export async function recognizeClothing(files: { front: File; back?: File; tag?: File }, signal: AbortSignal): Promise<Detection> {
  const photos: Record<string, string> = {}
  await Promise.all(Object.entries(files).map(async ([key, file]) => {
    if (file) photos[key] = await compressImage(file, 1400)
  }))
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/wardrobe/recognize`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(photos), signal,
  })
  if (!response.ok) throw new Error(response.status === 429 ? "Recognition is busy. Try again in a minute, or enter details yourself." : "We couldn't analyse this photo. Try again or enter details yourself.")
  const result = await response.json()
  if (!result || typeof result.isClothing !== "boolean" || typeof result.needsReview !== "boolean" ||
    ![null, "Tops", "Bottoms", "Dress", "Shoes", "Outerwear", "Bags", "Accessories"].includes(result.category) ||
    ["garmentType", "colour", "pattern", "style", "materialGuess", "materialFromLabel", "labelText", "season", "occasion", "brand", "size", "notes"].some(k => typeof result[k] !== "string")) {
    throw new Error("We couldn't read the recognition result. Please try again.")
  }
  return { ...result, category: result.category ?? "" }
}
export function seasonTags(season: string): string[] {
  const normal = season.toLowerCase()
  if (normal === "all season" || normal === "all-season") return ["all-season"]
  return normal.split("/").filter(s => ["summer", "autumn", "winter", "spring"].includes(s))
}
