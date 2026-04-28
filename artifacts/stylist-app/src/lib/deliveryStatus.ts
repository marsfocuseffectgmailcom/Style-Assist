import type { DeliveryStatus } from "./types"

export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(dateStr)
  event.setHours(0, 0, 0, 0)
  return Math.round((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDeliveryStatus(dateStr: string): DeliveryStatus {
  const days = daysUntil(dateStr)
  if (days > 14) return "Safe delivery"
  if (days >= 7) return "Risky delivery"
  return "Too late"
}

export function deliveryStatusColor(status: DeliveryStatus): string {
  switch (status) {
    case "Safe delivery":
      return "#4ECFA8"
    case "Risky delivery":
      return "#C8A96A"
    case "Too late":
      return "#FF7A5C"
  }
}

export function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
