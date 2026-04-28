import { useState, useCallback } from "react"
import type { IncomingItem } from "../lib/types"
import { mockIncomingItems } from "../lib/mockIncomingItems"

const STORAGE_KEY = "style-assist-incoming-items"

function load(): IncomingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockIncomingItems))
      return mockIncomingItems
    }
    return JSON.parse(raw) as IncomingItem[]
  } catch {
    return mockIncomingItems
  }
}

export function useIncomingItems() {
  const [items, setItems] = useState<IncomingItem[]>(load)

  const mutate = useCallback((updater: (prev: IncomingItem[]) => IncomingItem[]) => {
    setItems((prev) => {
      const next = updater(prev)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  function addItem(item: Omit<IncomingItem, "id">) {
    const newItem: IncomingItem = {
      ...item,
      id: `inc-${Math.random().toString(36).slice(2, 8)}`,
    }
    mutate((prev) => [...prev, newItem])
    return newItem
  }

  function removeItem(id: string) {
    mutate((prev) => prev.filter((i) => i.id !== id))
  }

  function getItemsAvailableBy(date: string): IncomingItem[] {
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    return items.filter((item) => {
      const delivery = new Date(item.deliveryDate)
      delivery.setHours(0, 0, 0, 0)
      return delivery <= target
    })
  }

  function daysUntilDelivery(item: IncomingItem): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const delivery = new Date(item.deliveryDate)
    delivery.setHours(0, 0, 0, 0)
    return Math.round((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  return { items, addItem, removeItem, getItemsAvailableBy, daysUntilDelivery }
}
