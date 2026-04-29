import { useState, useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { NotificationsProvider } from "./contexts/NotificationsContext"
import { WardrobePanelProvider } from "./contexts/WardrobePanelContext"
import { BottomNav } from "./components/BottomNav"
import {
  WardrobeTransitionProvider,
  useWardrobeTransition,
  WARDROBE_MICRO_DATE_KEY,
} from "./contexts/WardrobeTransitionContext"
import Home from "./pages/Home"
import Stylist from "./pages/Stylist"
import Wardrobe from "./pages/Wardrobe"
import Shop from "./pages/Shop"
import Profile from "./pages/Profile"
import SavedProducts from "./pages/SavedProducts"
import Timeline from "./pages/Timeline"
import GenerateOutfitScreen from "./pages/GenerateOutfitScreen"
import OutfitResultScreen from "./pages/OutfitResultScreen"
import IncomingItemsScreen from "./pages/IncomingItemsScreen"
import OnboardingFlow from "./pages/OnboardingFlow"
import AddItemFlow from "./pages/AddItemFlow"
import FirstOutfitReveal from "./pages/FirstOutfitReveal"
import RemovedItemsScreen from "./pages/RemovedItemsScreen"
import PlanAheadScreen from "./pages/plan-ahead/PlanAheadScreen"
import EventSetupScreen from "./pages/plan-ahead/EventSetupScreen"
import OutfitTimelineScreen from "./pages/plan-ahead/OutfitTimelineScreen"
import FutureOutfitBuilderScreen from "./pages/plan-ahead/FutureOutfitBuilderScreen"
import ProductSuggestionsScreen from "./pages/plan-ahead/ProductSuggestionsScreen"
import SavedFutureOutfitScreen from "./pages/plan-ahead/SavedFutureOutfitScreen"
import Analytics from "./pages/Analytics"
import { track } from "./hooks/useAnalytics"

const ONBOARDING_KEY = "style-assist-onboarded"

// ── Micro trigger — fires once per calendar day after UI settles ──────────────
function MicroTrigger() {
  const { trigger } = useWardrobeTransition()
  useEffect(() => {
    const today = new Date().toDateString()
    const last  = localStorage.getItem(WARDROBE_MICRO_DATE_KEY)
    if (last === today) return
    localStorage.setItem(WARDROBE_MICRO_DATE_KEY, today)
    const t = setTimeout(() => trigger("micro"), 600)
    return () => clearTimeout(t)
  }, [trigger])
  return null
}

function AppContent() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === "true"
  )

  // Track app_open once per session on mount
  useEffect(() => {
    track("app_open")
  }, [])

  function handleOnboardingComplete() {
    localStorage.setItem(ONBOARDING_KEY, "true")
    // Mark today so the micro doesn't fire immediately after onboarding
    localStorage.setItem(WARDROBE_MICRO_DATE_KEY, new Date().toDateString())
    setOnboarded(true)
  }

  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <WardrobeTransitionProvider>
      <MicroTrigger />
      <Routes>
        <Route path="/"                               element={<Home />} />
        <Route path="/stylist"                        element={<Stylist />} />
        <Route path="/wardrobe"                       element={<Wardrobe />} />
        <Route path="/wardrobe/add"                   element={<AddItemFlow />} />
        <Route path="/shop"                           element={<Shop />} />
        <Route path="/profile"                        element={<Profile />} />
        <Route path="/profile/analytics"              element={<Analytics />} />
        <Route path="/saved-products"                 element={<SavedProducts />} />
        <Route path="/timeline"                       element={<Timeline />} />
        <Route path="/timeline/generate/:date"        element={<GenerateOutfitScreen />} />
        <Route path="/timeline/outfit-result"         element={<OutfitResultScreen />} />
        <Route path="/incoming-items"                 element={<IncomingItemsScreen />} />
        <Route path="/profile/removed-items"          element={<RemovedItemsScreen />} />
        <Route path="/first-outfit"                   element={<FirstOutfitReveal />} />
        <Route path="/plan-ahead"                     element={<PlanAheadScreen />} />
        <Route path="/plan-ahead/new"                 element={<EventSetupScreen />} />
        <Route path="/plan-ahead/:eventId"            element={<OutfitTimelineScreen />} />
        <Route path="/plan-ahead/:eventId/builder"    element={<FutureOutfitBuilderScreen />} />
        <Route path="/plan-ahead/:eventId/suggestions" element={<ProductSuggestionsScreen />} />
        <Route path="/plan-ahead/:eventId/complete"   element={<SavedFutureOutfitScreen />} />
      </Routes>
      <BottomNav />
    </WardrobeTransitionProvider>
  )
}

export default function App() {
  return (
    <NotificationsProvider>
      <WardrobePanelProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppContent />
        </BrowserRouter>
      </WardrobePanelProvider>
    </NotificationsProvider>
  )
}
