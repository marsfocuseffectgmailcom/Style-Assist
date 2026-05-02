// ─── Anonymous analytics tracker ───────────────────────────────────────────
// User IDs are random UUIDs persisted in localStorage — no PII collected.
// Events are sent fire-and-forget; failures are silently swallowed.

const USER_ID_KEY = "sa_analytics_uid"
const API_BASE    = `${import.meta.env.BASE_URL ?? "/"}`.replace(/\/$/, "")

// Retrieve or create a persistent anonymous user ID
function getOrCreateUserId(): string {
  let uid = localStorage.getItem(USER_ID_KEY)
  if (!uid) {
    uid = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, uid)
  }
  return uid
}

// Session ID — fresh every page load
const SESSION_ID = crypto.randomUUID()

export const analyticsUserId = getOrCreateUserId()

export type TrackableEvent =
  | "app_open"
  | "onboarding_completed"
  | "outfit_viewed"
  | "outfit_accepted"
  | "reshuffle_used"
  | "item_added"
  | "item_removed"
  | "purchase_suggestion_shown"
  | "purchase_clicked"
  | "fit_photo_added"
  | "upgrade_shown"
  | "upgrade_tapped"
  | "review_shown"
  | "review_submitted"

export function track(event: TrackableEvent, metadata?: Record<string, unknown>): void {
  const body = JSON.stringify({
    event,
    userId:    analyticsUserId,
    sessionId: SESSION_ID,
    metadata:  metadata ?? null,
  })

  // Use sendBeacon where available (survives page unload), fall back to fetch
  const url = `${API_BASE}/api/analytics/event`
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))
  } else {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true })
      .catch(() => {})
  }
}
