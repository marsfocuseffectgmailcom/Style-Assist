import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { useLocation } from "react-router-dom"
import {
  WardrobeTransitionOverlay,
  type WardrobeVariant,
} from "../components/WardrobeTransitionOverlay"

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const WARDROBE_MICRO_DATE_KEY = "style-assist-micro-date"

// ─── Evening mode ─────────────────────────────────────────────────────────────

function isEveningMode(): boolean {
  const h = new Date().getHours()
  return h >= 18 || h < 6
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface Ctx {
  /** Trigger any wardrobe transition variant */
  trigger: (variant: WardrobeVariant) => void
}

const WardrobeTransitionCtx = createContext<Ctx>({ trigger: () => {} })

export function useWardrobeTransition() {
  return useContext(WardrobeTransitionCtx)
}

// ─── RouteWatcher ─────────────────────────────────────────────────────────────
// Lives inside BrowserRouter so it can call useLocation.
// Auto-fires partial on /wardrobe entry, partial-reverse on exit.

const WARDROBE_PATHS = ["/wardrobe", "/wardrobe/add"]

function RouteWatcher({ trigger }: { trigger: (v: WardrobeVariant) => void }) {
  const location = useLocation()
  const prevPath  = useRef<string | null>(null)

  useEffect(() => {
    const prev = prevPath.current
    const curr = location.pathname
    if (prev === null) { prevPath.current = curr; return }
    if (prev === curr)  return
    prevPath.current = curr

    const enteringWardrobe = WARDROBE_PATHS.some(p => curr === p)
    const leavingWardrobe  = WARDROBE_PATHS.some(p => prev === p)

    if (enteringWardrobe && !WARDROBE_PATHS.some(p => prev === p)) {
      trigger("partial")
    } else if (leavingWardrobe && !enteringWardrobe) {
      trigger("partial-reverse")
    }
  }, [location.pathname, trigger])

  return null
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ProviderProps {
  children: React.ReactNode
  /** Set to true to suppress RouteWatcher (e.g. during onboarding) */
  suppressRoute?: boolean
}

export function WardrobeTransitionProvider({ children, suppressRoute = false }: ProviderProps) {
  const [active,   setActive]   = useState<WardrobeVariant | null>(null)
  const [evening,  setEvening]  = useState(false) // resolved at trigger time

  const trigger = useCallback((variant: WardrobeVariant) => {
    setEvening(isEveningMode())
    setActive(variant)
  }, [])

  const dismiss = useCallback(() => {
    setActive(null)
  }, [])

  return (
    <WardrobeTransitionCtx.Provider value={{ trigger }}>
      {children}

      {/* Route-based auto-trigger */}
      {!suppressRoute && <RouteWatcher trigger={trigger} />}

      {/* Overlay */}
      {active && (
        <WardrobeTransitionOverlay
          key={active}
          variant={active}
          isEvening={evening}
          onDone={dismiss}
        />
      )}
    </WardrobeTransitionCtx.Provider>
  )
}
