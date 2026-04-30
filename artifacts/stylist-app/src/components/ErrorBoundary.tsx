import { Component, type ReactNode, type ErrorInfo } from "react"
import { RefreshCw } from "lucide-react"

const T = {
  bg:    "#1F2A37",
  card:  "#243140",
  teal:  "#3F6F73",
  coral: "#7FA9A3",
  text:  "#F2F4F5",
  sub:   "#AABBC0",
  muted: "#6B8490",
  border:"rgba(255,255,255,0.08)",
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 20,
          background: `${T.teal}14`,
          border: `1px solid ${T.teal}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <RefreshCw size={24} style={{ color: T.teal }} />
      </div>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: T.text,
          marginBottom: 10,
        }}
      >
        Something didn't load properly.
      </h1>

      <p
        style={{
          fontSize: 15,
          color: T.sub,
          lineHeight: 1.55,
          maxWidth: 300,
          marginBottom: 32,
        }}
      >
        Your wardrobe is safe. Please try again.
      </p>

      <button
        onClick={onRetry}
        style={{
          height: 52,
          padding: "0 32px",
          borderRadius: 16,
          background: `linear-gradient(to right, ${T.teal}, ${T.coral})`,
          border: "none",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          boxShadow: "0 4px 18px rgba(63,111,115,0.30)",
        }}
      >
        Try again
      </button>
    </div>
  )
}

interface Props  { children: ReactNode }
interface State  { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
      )
    }
    return this.props.children
  }
}
