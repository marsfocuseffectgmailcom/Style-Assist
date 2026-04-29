import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, CalendarDays, Package, Sparkles, Check, Trash2 } from "lucide-react"
import { useNotifications } from "../hooks/useNotifications"
import type { AppNotification } from "../hooks/useNotifications"

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const iconMap = {
  calendar: CalendarDays,
  package: Package,
  sparkles: Sparkles,
  check: Check,
}

const iconColor = {
  calendar: "#3F6F73",
  package: "#C8A96A",
  sparkles: "#5F8F7F",
  check: "#5F8F7F",
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification
  onRead: () => void
}) {
  const Icon = iconMap[notification.icon]
  const color = iconColor[notification.icon]

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onRead}
      className={`flex w-full items-start gap-3 rounded-[18px] border p-3.5 text-left transition ${
        notification.read
          ? "border-white/6 bg-transparent opacity-60"
          : "border-white/10 bg-[#243140]"
      }`}
    >
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={16} style={{ color }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="flex-1 text-[13px] font-semibold text-[#F2F4F5]">
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#3F6F73]" />
          )}
        </div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B8490]">
          {notification.body}
        </p>
        <p className="mt-1 text-[11px] text-[#4D6A78]">{relativeTime(notification.createdAt)}</p>
      </div>
    </motion.button>
  )
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#F2F4F5] transition hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#3F6F73] px-1 text-[10px] font-bold text-white"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 340 }}
              className="relative max-h-[80vh] overflow-y-auto rounded-t-[28px] bg-[#2A3645] px-5 pb-10 pt-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#F2F4F5]">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-[12px] text-[#6B8490]">{unreadCount} unread</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="rounded-full bg-white/5 px-3 py-1.5 text-[12px] text-[#AABBC0] transition hover:bg-white/10"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={clearAll}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#6B8490] transition hover:bg-white/10 hover:text-[#7FA9A3]"
                        aria-label="Clear all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#6B8490] transition hover:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} className="mx-auto mb-3 text-[#2E4055]" />
                  <p className="text-sm text-[#6B8490]">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={() => markRead(n.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
