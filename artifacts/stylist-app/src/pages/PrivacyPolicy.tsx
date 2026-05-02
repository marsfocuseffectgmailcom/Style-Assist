import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const T = {
  bg:   "#1F2A37",
  card: "#243140",
  teal: "#3F6F73",
  text: "#F2F4F5",
  sub:  "#AABBC0",
  muted:"#6B8490",
}

const SECTIONS = [
  {
    heading: "Overview",
    body: `Drape ("we", "us", or "our") respects your privacy. This policy explains what data we collect, how we use it, and your rights. By using Drape you agree to this policy.`,
  },
  {
    heading: "Data we collect",
    body: `Wardrobe photos and item details you add are stored locally on your device. We do not upload your photos to our servers. Style preference signals and outfit history are stored locally in your browser or device storage. If you create an account, we store your email address and preferences on our secure servers.`,
  },
  {
    heading: "How we use data",
    body: `Your wardrobe and preference data is used solely to generate outfit suggestions and improve the AI stylist experience. We do not sell, rent, or share your personal data with third parties for advertising or marketing purposes.`,
  },
  {
    heading: "AI processing",
    body: `Outfit generation is performed on-device using your wardrobe data. When you use the AI stylist chat, anonymised queries may be processed by a third-party AI provider (Anthropic). No personally identifiable information, photos, or wardrobe item details are sent to AI providers.`,
  },
  {
    heading: "Analytics",
    body: `We collect anonymised, aggregated usage events (e.g. "outfit viewed", "item added") to understand how the app is used. These events contain no personal data. You can opt out of analytics at any time in Settings.`,
  },
  {
    heading: "Data retention",
    body: `All locally stored data stays on your device until you uninstall the app or use the "Reset app" feature. If you delete your account, all server-side data is permanently deleted within 30 days.`,
  },
  {
    heading: "Your rights",
    body: `You have the right to access, correct, or delete any personal data we hold about you. To exercise these rights, contact us at privacy@drape.app. We will respond within 30 days.`,
  },
  {
    heading: "Children",
    body: `Drape is not intended for children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, contact us immediately.`,
  },
  {
    heading: "Changes to this policy",
    body: `We may update this policy from time to time. Significant changes will be communicated via in-app notification. Continued use of Drape after changes constitutes acceptance of the updated policy.`,
  },
  {
    heading: "Contact",
    body: `Questions about this policy? Contact us at privacy@drape.app or write to: Drape Ltd, Privacy Team, [Address].`,
  },
]

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: T.bg,
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 10,
          background: T.bg,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "env(safe-area-inset-top,0) 16px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, height: 56 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{
              width: 36, height: 36, borderRadius: 99,
              background: "rgba(255,255,255,0.05)", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} style={{ color: T.sub }} />
          </button>
          <h1 style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>
            Privacy Policy
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 20px 0", maxWidth: 600, margin: "0 auto" }}>
        {/* Last updated */}
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 28 }}>
          Last updated: May 2026 · Version 1.0
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 style={{
                fontSize: 14, fontWeight: 800, color: T.teal,
                letterSpacing: "0.05em", textTransform: "uppercase",
                marginBottom: 8,
              }}>
                {s.heading}
              </h2>
              <p style={{ fontSize: 15, color: T.sub, lineHeight: 1.7 }}>
                {s.body}
              </p>
            </section>
          ))}
        </div>

        {/* Footer rule */}
        <div style={{
          marginTop: 40, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 12, color: T.muted }}>
            © {new Date().getFullYear()} Drape Ltd · privacy@drape.app
          </p>
        </div>
      </div>
    </div>
  )
}
