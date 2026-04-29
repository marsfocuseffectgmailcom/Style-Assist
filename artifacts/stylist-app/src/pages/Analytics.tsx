import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Users, TrendingUp, Heart, ShoppingBag, RefreshCw, Shirt, Package, Sparkles, Activity } from "lucide-react"

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg:     "#1F2A37",
  card:   "#243140",
  raised: "#2A3645",
  border: "rgba(255,255,255,0.08)",
  teal:   "#3F6F73",
  coral:  "#7FA9A3",
  gold:   "#C8A96A",
  text:   "#F2F4F5",
  sub:    "#AABBC0",
  muted:  "#6B8490",
}

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardData = {
  day1Retention:       number
  day7Retention:       number
  dau:                 number
  outfitAcceptanceRate:number
  cohortSizes:         { d1: number; d7: number }
  dauHistory:          Array<{ date: string; dau: number }>
  eventCounts:         Array<{ event: string; n: number }>
  recentEvents:        Array<{ event: string; user_id: string; created_at: string }>
  totalEvents:         number
}

// ─── Event icons + labels ─────────────────────────────────────────────────────

const EVENT_META: Record<string, { label: string; color: string }> = {
  app_open:                  { label: "App opened",          color: T.teal  },
  outfit_viewed:             { label: "Outfit viewed",       color: T.coral },
  outfit_accepted:           { label: "Outfit accepted",     color: "#5FA87A" },
  reshuffle_used:            { label: "Reshuffled",          color: T.gold  },
  item_added:                { label: "Item added",          color: T.teal  },
  item_removed:              { label: "Item removed",        color: "#B07070" },
  purchase_suggestion_shown: { label: "Suggestion shown",    color: T.gold  },
  purchase_clicked:          { label: "Suggestion clicked",  color: "#C8A96A" },
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  label, value, unit = "", sub, color, icon: Icon, delay = 0,
}: {
  label: string; value: number | string; unit?: string; sub?: string;
  color: string; icon: typeof Users; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38, ease: "easeOut" }}
      style={{
        padding: "16px 16px 14px",
        borderRadius: 20,
        background: T.card,
        border: `1px solid ${T.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: sub ? 6 : 0 }}>
        <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", color: T.text }}>{value}</span>
        {unit && <span style={{ fontSize: 16, fontWeight: 700, color: T.sub }}>{unit}</span>}
      </div>
      {sub && <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>{sub}</p>}
    </motion.div>
  )
}

// ─── Bar chart (DAU over 14 days) ─────────────────────────────────────────────

function DauChart({ data }: { data: Array<{ date: string; dau: number }> }) {
  const max = Math.max(...data.map((d) => d.dau), 1)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
      {data.map((d, i) => {
        const pct = (d.dau / max) * 100
        const isToday = d.date === today
        return (
          <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 6)}%` }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
              style={{
                width: "100%", borderRadius: "4px 4px 0 0", minHeight: 4,
                background: isToday ? T.teal : `${T.coral}60`,
                boxShadow: isToday ? `0 0 8px ${T.teal}60` : "none",
              }}
            />
            {isToday && (
              <span style={{ fontSize: 8, color: T.teal, fontWeight: 700 }}>today</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Retention ring ───────────────────────────────────────────────────────────

function RetentionRing({ pct, label, color, size = 72 }: { pct: number; label: string; color: string; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.raised} strokeWidth={8} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div style={{ textAlign: "center", marginTop: -size - 8, height: size, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>{pct}%</span>
      </div>
      <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, textAlign: "center" }}>{label}</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const navigate = useNavigate()
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")
    fetch(`${base}/api/analytics/dashboard`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setError("Could not load analytics data."); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 20px 100px", paddingTop: 0 }}>

        {/* ── Header ── */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: T.bg, paddingTop: 20, paddingBottom: 14, marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ width: 38, height: 38, borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            >
              <ArrowLeft size={17} style={{ color: T.sub }} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: T.muted, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Internal</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: T.text }}>Retention Dashboard</h1>
            </div>
            <button
              onClick={load}
              style={{ width: 38, height: 38, borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <RefreshCw size={15} style={{ color: T.sub }} />
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, gap: 14 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
              <RefreshCw size={22} style={{ color: T.teal }} />
            </motion.div>
            <p style={{ fontSize: 14, color: T.muted }}>Loading analytics…</p>
          </div>
        )}

        {error && (
          <div style={{ padding: 20, borderRadius: 18, background: "rgba(180,80,80,0.1)", border: "1px solid rgba(180,80,80,0.2)", marginTop: 20 }}>
            <p style={{ fontSize: 14, color: "#C87070" }}>{error}</p>
            <button onClick={load} style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: T.teal, background: "none", border: "none", cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── Retention rings ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ padding: "20px 20px 18px", borderRadius: 22, background: T.card, border: `1px solid ${T.border}`, marginBottom: 14 }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>User Retention</p>
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start" }}>
                <RetentionRing pct={data.day1Retention} label={`Day 1 · ${data.cohortSizes.d1} users`} color={T.teal}  />
                <div style={{ width: 1, height: 80, background: T.border, alignSelf: "center" }} />
                <RetentionRing pct={data.day7Retention} label={`Day 7 · ${data.cohortSizes.d7} users`} color={T.coral} />
              </div>
              <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
                Day 1 measures users who open the app the following day.{"\n"}Day 7 measures return on day 7 or 8.
              </p>
            </motion.div>

            {/* ── 4 metric cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <MetricCard label="Daily Active"  value={data.dau}  unit="users" sub="Active in last 24h"    color={T.teal}  icon={Users}       delay={0.05} />
              <MetricCard label="Acceptance"    value={data.outfitAcceptanceRate} unit="%" sub="Outfits worn vs viewed" color="#5FA87A" icon={Heart}       delay={0.1} />
              <MetricCard label="Events logged" value={data.totalEvents}          sub="Across all users"       color={T.gold}  icon={Activity}    delay={0.15} />
              <MetricCard label="Suggestions"   value={(data.eventCounts.find((e) => e.event === "purchase_suggestion_shown")?.n ?? 0)} sub="Times shown" color={T.coral} icon={Sparkles} delay={0.2} />
            </div>

            {/* ── DAU history chart ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{ padding: "16px 16px 18px", borderRadius: 20, background: T.card, border: `1px solid ${T.border}`, marginBottom: 14 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Daily Active Users</p>
                <span style={{ fontSize: 11, color: T.muted }}>Last 14 days</span>
              </div>
              {data.dauHistory.length > 0 ? (
                <DauChart data={data.dauHistory} />
              ) : (
                <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "24px 0" }}>No data yet</p>
              )}
            </motion.div>

            {/* ── Event breakdown ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              style={{ padding: "16px 16px 12px", borderRadius: 20, background: T.card, border: `1px solid ${T.border}`, marginBottom: 14 }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14 }}>Event breakdown</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.eventCounts.map((ev) => {
                  const meta = EVENT_META[ev.event]
                  const max  = data.eventCounts[0]?.n ?? 1
                  const pct  = Math.round((ev.n / max) * 100)
                  return (
                    <div key={ev.event}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: meta?.color ?? T.sub }}>
                          {meta?.label ?? ev.event}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{ev.n.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: T.raised, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ height: "100%", borderRadius: 99, background: meta?.color ?? T.coral }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* ── Recent events ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{ padding: "16px 16px 4px", borderRadius: 20, background: T.card, border: `1px solid ${T.border}` }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Recent events</p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {data.recentEvents.map((ev, i) => {
                  const meta = EVENT_META[ev.event]
                  const ts   = new Date(ev.created_at)
                  const timeStr = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  const dateStr = ts.toLocaleDateString([], { month: "short", day: "numeric" })
                  return (
                    <div
                      key={`${ev.event}-${i}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 0",
                        borderBottom: i < data.recentEvents.length - 1 ? `1px solid ${T.border}` : "none",
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: 99, flexShrink: 0,
                        background: meta?.color ?? T.sub,
                      }} />
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: meta?.color ?? T.sub }}>
                        {meta?.label ?? ev.event}
                      </span>
                      <span style={{ fontSize: 11, color: T.muted }}>
                        {ev.user_id.startsWith("demo_") ? ev.user_id : `${ev.user_id.slice(0, 8)}…`}
                      </span>
                      <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>
                        {dateStr} {timeStr}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}

      </div>
    </div>
  )
}
