import type { CapturedItem } from "../hooks/useWardrobeCapture"
import type { WardrobeItem } from "./mockData"
import { extractColorsFromName } from "./stylingEngine"

export function capturedToWardrobeItem(item: CapturedItem): WardrobeItem {
  const styleTags = [
    ...item.styleTags,
    item.aiStyle ? item.aiStyle.toLowerCase() : "",
    item.aiOccasion ? item.aiOccasion.toLowerCase() : "",
  ].filter(Boolean)

  const colors =
    item.colors.length > 0
      ? item.colors.map((c) => c.toLowerCase())
      : item.aiColour
      ? [item.aiColour.toLowerCase()]
      : extractColorsFromName(item.name)

  const seasonTags =
    item.seasonTags.length > 0 ? item.seasonTags.flatMap(s => s.toLowerCase().replace("all season", "all-season").split("/")) : ["all-season"]

  return {
    id:          item.id as unknown as number,
    name:        item.name,
    category:    item.category as WardrobeItem["category"],
    image:       item.image,
    colors,
    styleTags,
    seasonTags,
    wearCount:   item.wearCount,
  }
}

