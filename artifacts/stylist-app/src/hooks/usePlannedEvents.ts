import { useCallback, useState } from "react"
import type { PlannedEvent, PlannedOutfit, PlannedOutfitItem, PurchaseStatus } from "../lib/types"

const EVENTS_KEY = "style-assist-planned-events"
const OUTFITS_KEY = "style-assist-planned-outfits"

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function usePlannedEvents() {
  const [events, setEvents] = useState<PlannedEvent[]>(() =>
    readJSON<PlannedEvent[]>(EVENTS_KEY, [])
  )
  const [outfits, setOutfits] = useState<PlannedOutfit[]>(() =>
    readJSON<PlannedOutfit[]>(OUTFITS_KEY, [])
  )

  const addEvent = useCallback((event: Omit<PlannedEvent, "id" | "createdAt">) => {
    const next: PlannedEvent = {
      ...event,
      id: uid(),
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => {
      const updated = [next, ...prev]
      writeJSON(EVENTS_KEY, updated)
      return updated
    })
    return next
  }, [])

  const removeEvent = useCallback((eventId: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId)
      writeJSON(EVENTS_KEY, updated)
      return updated
    })
    setOutfits((prev) => {
      const updated = prev.filter((o) => o.eventId !== eventId)
      writeJSON(OUTFITS_KEY, updated)
      return updated
    })
  }, [])

  const getEvent = useCallback(
    (eventId: string) => events.find((e) => e.id === eventId) ?? null,
    [events]
  )

  const saveOutfit = useCallback(
    (eventId: string, items: PlannedOutfitItem[], notes?: string) => {
      setOutfits((prev) => {
        const existing = prev.find((o) => o.eventId === eventId)
        let updated: PlannedOutfit[]
        if (existing) {
          updated = prev.map((o) =>
            o.eventId === eventId ? { ...o, items, notes } : o
          )
        } else {
          const newOutfit: PlannedOutfit = {
            id: uid(),
            eventId,
            items,
            notes,
            createdAt: new Date().toISOString(),
          }
          updated = [newOutfit, ...prev]
        }
        writeJSON(OUTFITS_KEY, updated)
        return updated
      })
    },
    []
  )

  const getOutfit = useCallback(
    (eventId: string) => outfits.find((o) => o.eventId === eventId) ?? null,
    [outfits]
  )

  const updateItemStatus = useCallback(
    (eventId: string, itemId: string, status: PurchaseStatus) => {
      setOutfits((prev) => {
        const updated = prev.map((o) => {
          if (o.eventId !== eventId) return o
          return {
            ...o,
            items: o.items.map((item) =>
              item.id === itemId ? { ...item, purchaseStatus: status } : item
            ),
          }
        })
        writeJSON(OUTFITS_KEY, updated)
        return updated
      })
    },
    []
  )

  return {
    events,
    addEvent,
    removeEvent,
    getEvent,
    saveOutfit,
    getOutfit,
    updateItemStatus,
  }
}
