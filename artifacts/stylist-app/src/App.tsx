import { useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Stylist from "./pages/Stylist"
import Wardrobe from "./pages/Wardrobe"
import Shop from "./pages/Shop"
import Profile from "./pages/Profile"
import SavedProducts from "./pages/SavedProducts"
import Timeline from "./pages/Timeline"
import GenerateOutfitScreen from "./pages/GenerateOutfitScreen"
import IncomingItemsScreen from "./pages/IncomingItemsScreen"
import OnboardingFlow from "./pages/OnboardingFlow"
import PlanAheadScreen from "./pages/plan-ahead/PlanAheadScreen"
import EventSetupScreen from "./pages/plan-ahead/EventSetupScreen"
import OutfitTimelineScreen from "./pages/plan-ahead/OutfitTimelineScreen"
import FutureOutfitBuilderScreen from "./pages/plan-ahead/FutureOutfitBuilderScreen"
import ProductSuggestionsScreen from "./pages/plan-ahead/ProductSuggestionsScreen"
import SavedFutureOutfitScreen from "./pages/plan-ahead/SavedFutureOutfitScreen"

const ONBOARDING_KEY = "style-assist-onboarded"

function AppContent() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === "true"
  )

  function handleOnboardingComplete() {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setOnboarded(true)
  }

  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stylist" element={<Stylist />} />
      <Route path="/wardrobe" element={<Wardrobe />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/saved-products" element={<SavedProducts />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/timeline/generate/:date" element={<GenerateOutfitScreen />} />
      <Route path="/incoming-items" element={<IncomingItemsScreen />} />
      <Route path="/plan-ahead" element={<PlanAheadScreen />} />
      <Route path="/plan-ahead/new" element={<EventSetupScreen />} />
      <Route path="/plan-ahead/:eventId" element={<OutfitTimelineScreen />} />
      <Route path="/plan-ahead/:eventId/builder" element={<FutureOutfitBuilderScreen />} />
      <Route path="/plan-ahead/:eventId/suggestions" element={<ProductSuggestionsScreen />} />
      <Route path="/plan-ahead/:eventId/complete" element={<SavedFutureOutfitScreen />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContent />
    </BrowserRouter>
  )
}
