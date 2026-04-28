import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type NotificationIcon = "calendar" | "package" | "sparkles" | "check"

export type AppNotification = {
  id: string
  type: "tomorrow-outfit" | "delivery-unlocks" | "week-ready" | "custom"
  icon: NotificationIcon
  title: string
  body: string
  createdAt: string
  read: boolean
}

const STORAGE_KEY = "style-assist-notifications"

function load(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as AppNotification[]
  } catch {
    return []
  }
}

function persist(items: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

type NotificationsContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (partial: Omit<AppNotification, "id" | "createdAt" | "read">) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
  requestPermission: () => Promise<NotificationPermission>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(load)

  const mutate = useCallback(
    (updater: (prev: AppNotification[]) => AppNotification[]) => {
      setNotifications((prev) => {
        const next = updater(prev)
        persist(next)
        return next
      })
    },
    []
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = useCallback(
    (partial: Omit<AppNotification, "id" | "createdAt" | "read">) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.type === partial.type)
        if (exists) return prev
        const n: AppNotification = {
          ...partial,
          id: Math.random().toString(36).slice(2, 10),
          createdAt: new Date().toISOString(),
          read: false,
        }
        const next = [n, ...prev]
        persist(next)

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(n.title, { body: n.body, silent: false })
        }

        return next
      })
    },
    []
  )

  const markRead = useCallback((id: string) => {
    mutate((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [mutate])

  const markAllRead = useCallback(() => {
    mutate((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [mutate])

  const clearAll = useCallback(() => {
    mutate(() => [])
  }, [mutate])

  async function requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) return "denied"
    if (Notification.permission === "granted") return "granted"
    return Notification.requestPermission()
  }

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll, requestPermission }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotificationsContext must be used inside NotificationsProvider")
  return ctx
}
