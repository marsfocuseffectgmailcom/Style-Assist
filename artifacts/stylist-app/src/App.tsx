import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Home from "./pages/Home"
import Stylist from "./pages/Stylist"
import Wardrobe from "./pages/Wardrobe"
import Shop from "./pages/Shop"
import Profile from "./pages/Profile"
import SavedProducts from "./pages/SavedProducts"


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stylist" element={<Stylist />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved" element={<SavedProducts />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
