/**
 * Store screenshot compositions for Play Store / App Store listing.
 * Navigate to /store-assets to view all 5 screenshots stacked.
 * Each frame is 400×711px (approximately 9:16), ready for cropping.
 */

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

const W = 400
const H = 711

function Frame({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <div
      id={id}
      style={{
        width: W, height: H, flexShrink: 0,
        background: T.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      }}
    >
      {children}
    </div>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 0", marginBottom: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <div style={{ width: 14, height: 8, border: `1.5px solid ${T.muted}`, borderRadius: 2, position: "relative" }}>
          <div style={{ position: "absolute", left: 1, top: 1, bottom: 1, right: 4, background: T.teal, borderRadius: 1 }} />
          <div style={{ position: "absolute", right: -4, top: 2.5, width: 2.5, height: 3, background: T.muted, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  )
}

function PromoText({ headline, sub, accent = T.teal }: { headline: string; sub: string; accent?: string }) {
  return (
    <div style={{ padding: "0 24px", marginBottom: 24 }}>
      <p style={{ fontSize: 26, fontWeight: 900, color: T.text, letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 8 }}>
        {headline}
      </p>
      <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.55, fontWeight: 500 }}>
        {sub}
      </p>
      <div style={{ marginTop: 12, width: 32, height: 3, borderRadius: 99, background: accent }} />
    </div>
  )
}

// ─── Screenshot 1 — Daily outfit ─────────────────────────────────────────────

function Screen1() {
  const items = [
    { label: "White Oxford Shirt",  cat: "Top",    color: "#E8E0D4" },
    { label: "Charcoal Trousers",   cat: "Bottom", color: "#4A5568" },
    { label: "Tan Derby Shoes",     cat: "Shoes",  color: "#8B6F47" },
  ]
  return (
    <Frame id="ss1">
      <StatusBar />
      {/* Header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 2 }}>Good morning,</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: "-0.04em", lineHeight: 1.1 }}>Style Assist</h1>
      </div>

      {/* Outfit card */}
      <div style={{ margin: "0 20px", borderRadius: 20, background: T.card, border: `1px solid ${T.border}`, overflow: "hidden" }}>
        {/* Label */}
        <div style={{ padding: "14px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: T.gold }}>✦</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.08em" }}>TODAY'S OUTFIT</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.teal, background: `${T.teal}15`, padding: "3px 10px", borderRadius: 99 }}>Work</span>
        </div>
        <div style={{ padding: "0 16px 10px" }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>Midweek Polish</p>
          <p style={{ fontSize: 12, color: T.muted }}>Considered · Refined</p>
        </div>
        {/* Item strips */}
        <div style={{ display: "flex", gap: 2, height: 130 }}>
          {items.map((item, i) => (
            <div key={i} style={{ flex: 1, background: item.color, position: "relative", display: "flex", alignItems: "flex-end", padding: 8 }}>
              <div style={{ background: "rgba(0,0,0,0.45)", borderRadius: 8, padding: "4px 7px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{item.cat}</p>
                <p style={{ fontSize: 8, color: "rgba(255,255,255,0.75)", lineHeight: 1.2 }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        {/* CTA */}
        <div style={{ padding: 14 }}>
          <div style={{ height: 46, borderRadius: 14, background: `linear-gradient(to right, ${T.teal}, ${T.coral})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>✓  Wear this</span>
          </div>
        </div>
      </div>

      {/* Divider + promo */}
      <div style={{ flex: 1 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 0 32px", background: `linear-gradient(to top, ${T.bg} 60%, transparent)` }}>
        <PromoText
          headline={"Stop guessing\nwhat to wear."}
          sub="Your AI stylist picks the perfect outfit every morning."
        />
      </div>
    </Frame>
  )
}

// ─── Screenshot 2 — Wardrobe grid ────────────────────────────────────────────

function Screen2() {
  const colours = [
    "#E8E0D4","#2D3748","#8B6F47","#4A5568","#D4C4A8",
    "#1A202C","#C4A882","#6B7280","#E2D9C5","#374151",
  ]
  return (
    <Frame id="ss2">
      <StatusBar />
      <div style={{ padding: "20px 24px 14px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: "-0.04em", marginBottom: 2 }}>Wardrobe</h1>
        <p style={{ fontSize: 13, color: T.muted }}>24 items · 68 outfit combinations</p>
      </div>
      {/* Grid */}
      <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {colours.map((c, i) => (
          <div key={i} style={{ aspectRatio: "3/4", borderRadius: 14, background: c, position: "relative", overflow: "hidden" }}>
            {i === 0 && (
              <div style={{ position: "absolute", bottom: 5, left: 5, background: `${T.teal}CC`, borderRadius: 6, padding: "2px 6px" }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>★ Go-to</span>
              </div>
            )}
            {i === 4 && (
              <div style={{ position: "absolute", bottom: 5, left: 5, background: `${T.gold}CC`, borderRadius: 6, padding: "2px 6px" }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>Neglected</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Promo */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 0 28px", background: `linear-gradient(to top, ${T.bg} 55%, transparent)` }}>
        <PromoText
          headline={"Photograph.\nOrganise. Done."}
          sub="AI reads your clothes and builds combinations instantly."
          accent={T.gold}
        />
      </div>
    </Frame>
  )
}

// ─── Screenshot 3 — Generate / score ─────────────────────────────────────────

function Screen3() {
  const score = 91
  const circumference = 2 * Math.PI * 22
  const dash = (score / 100) * circumference

  return (
    <Frame id="ss3">
      <StatusBar />
      <div style={{ padding: "20px 24px 16px" }}>
        <p style={{ fontSize: 12, color: T.muted, letterSpacing: "0.07em", fontWeight: 700, marginBottom: 4 }}>AI STYLIST</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: "-0.04em" }}>Your outfits, ranked.</h1>
      </div>

      {/* Outfit score card */}
      <div style={{ margin: "0 20px", borderRadius: 20, background: T.card, border: `1px solid ${T.border}`, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          {/* Score ring */}
          <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
            <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
              <circle cx="26" cy="26" r="22" fill="none" stroke={T.teal}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - dash}
              />
            </svg>
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: T.teal }}>{score}</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.teal, background: `${T.teal}18`, padding: "2px 8px", borderRadius: 99 }}>High match</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>The Monday Brief</p>
            <p style={{ fontSize: 11, color: T.muted }}>Sharp & minimal</p>
          </div>
        </div>
        {/* Breakdown bars */}
        {[
          { label: "Colour harmony",   pct: 92 },
          { label: "Style consistency",pct: 86 },
          { label: "Season fit",       pct: 78 },
          { label: "Your taste",       pct: 95 },
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 110, fontSize: 10, color: T.muted, flexShrink: 0 }}>{row.label}</span>
            <div style={{ flex: 1, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
              <div style={{ width: `${row.pct}%`, height: "100%", borderRadius: 99, background: `${T.teal}80` }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.sub, width: 26, textAlign: "right" }}>{row.pct}</span>
          </div>
        ))}
      </div>

      {/* Why this works snippet */}
      <div style={{ margin: "12px 20px 0", borderRadius: 16, background: `${T.teal}0C`, border: `1px solid ${T.teal}20`, padding: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.teal, letterSpacing: "0.07em", marginBottom: 5 }}>WHY THIS WORKS</p>
        <p style={{ fontSize: 12, color: T.sub, lineHeight: 1.55 }}>The tonal palette reads as intentional. A blazer shifts the register without overcomplicating the look.</p>
      </div>

      {/* Promo */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 0 26px", background: `linear-gradient(to top, ${T.bg} 55%, transparent)` }}>
        <PromoText
          headline={"Every outfit,\nscored and explained."}
          sub="See why it works — colour harmony, season fit, your taste."
          accent={T.coral}
        />
      </div>
    </Frame>
  )
}

// ─── Screenshot 4 — Plan ahead ───────────────────────────────────────────────

function Screen4() {
  const events = [
    { name: "Job Interview",    date: "Mon 12 May",  tag: "Work",    tagColor: T.teal  },
    { name: "Summer Wedding",   date: "Sat 17 May",  tag: "Formal",  tagColor: T.gold  },
    { name: "Weekend Getaway",  date: "Fri 23 May",  tag: "Casual",  tagColor: T.coral },
  ]
  return (
    <Frame id="ss4">
      <StatusBar />
      <div style={{ padding: "20px 24px 16px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: "-0.04em", marginBottom: 2 }}>Plan Ahead</h1>
        <p style={{ fontSize: 13, color: T.muted }}>Never scramble last minute again.</p>
      </div>

      {/* Event cards */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {events.map((ev) => (
          <div key={ev.name} style={{ borderRadius: 18, background: T.card, border: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ev.tagColor}18`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 14 }}>📅</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{ev.name}</p>
              <p style={{ fontSize: 11, color: T.muted }}>{ev.date}</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: ev.tagColor, background: `${ev.tagColor}15`, padding: "3px 10px", borderRadius: 99 }}>{ev.tag}</span>
          </div>
        ))}
      </div>

      {/* Outfit preview strip */}
      <div style={{ margin: "12px 20px 0", borderRadius: 18, background: T.card, border: `1px solid ${T.gold}22`, padding: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.gold, letterSpacing: "0.07em", marginBottom: 10 }}>AI OUTFIT READY · JOB INTERVIEW</p>
        <div style={{ display: "flex", gap: 8 }}>
          {["#E8E0D4","#2D3748","#1A1A2E","#8B6F47"].map((c, i) => (
            <div key={i} style={{ flex: 1, height: 70, borderRadius: 12, background: c }} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: T.sub, marginTop: 10, lineHeight: 1.45 }}>Navy suit, white shirt, charcoal tie, oxford shoes — the strongest version of this look.</p>
      </div>

      {/* Promo */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 0 26px", background: `linear-gradient(to top, ${T.bg} 55%, transparent)` }}>
        <PromoText
          headline={"Dress perfectly\nfor any occasion."}
          sub="Plan outfits for events weeks ahead. Never scramble again."
          accent={T.gold}
        />
      </div>
    </Frame>
  )
}

// ─── Screenshot 5 — Insights / cost per wear ─────────────────────────────────

function Screen5() {
  const items = [
    { name: "White Oxford Shirt", cpw: 0.42, wears: 38, bar: 95 },
    { name: "Charcoal Blazer",    cpw: 1.20, wears: 24, bar: 65 },
    { name: "Tan Derby Shoes",    cpw: 0.88, wears: 14, bar: 40 },
    { name: "Navy Chinos",        cpw: 0.56, wears: 29, bar: 78 },
  ]
  return (
    <Frame id="ss5">
      <StatusBar />
      <div style={{ padding: "20px 24px 14px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: "-0.04em", marginBottom: 2 }}>Wardrobe Insights</h1>
        <p style={{ fontSize: 13, color: T.muted }}>Know what earns its place.</p>
      </div>

      {/* Neglected alert */}
      <div style={{ margin: "0 20px 12px", borderRadius: 18, background: `${T.gold}0D`, border: `1px solid ${T.gold}28`, padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13 }}>💤</span>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>Sleeping in your wardrobe</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["#5C4A3A","#8B7355","#3D4A52"].map((c, i) => (
            <div key={i} style={{ width: 52, height: 52, borderRadius: 10, background: c, flexShrink: 0 }} />
          ))}
          <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.45 }}>3 items you haven't worn in 90+ days.</p>
        </div>
      </div>

      {/* Cost-per-wear list */}
      <div style={{ margin: "0 20px", borderRadius: 18, background: T.card, border: `1px solid ${T.border}`, padding: "14px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", marginBottom: 12 }}>COST PER WEAR</p>
        {items.map((item) => (
          <div key={item.name} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{item.name}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontSize: 11, color: T.muted }}>{item.wears}×</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>${item.cpw.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.07)" }}>
              <div style={{ width: `${item.bar}%`, height: "100%", borderRadius: 99, background: `${T.teal}70` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Promo */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 0 26px", background: `linear-gradient(to top, ${T.bg} 55%, transparent)` }}>
        <PromoText
          headline={"Know the value\nof what you own."}
          sub="Cost-per-wear tracking. Neglected item alerts. Smart insights."
          accent={T.teal}
        />
      </div>
    </Frame>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

import React from "react"

export default function StoreScreenshots() {
  return (
    <div style={{ background: "#0D1117", minHeight: "100dvh", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#F2F4F5", letterSpacing: "-0.03em" }}>Style Assist — Store Screenshots</h1>
        <p style={{ fontSize: 13, color: "#6B8490", marginTop: 4 }}>5 screenshots · 400×711px each (9:16) · Screenshot and crop individually</p>
      </div>
      <Screen1 />
      <Screen2 />
      <Screen3 />
      <Screen4 />
      <Screen5 />
      <div style={{ height: 40 }} />
    </div>
  )
}
