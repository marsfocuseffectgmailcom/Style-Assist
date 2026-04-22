import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Home from "./pages/home"
import Stylist from "./pages/stylist"
import Wardrobe from "./pages/wardrobe"

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#0F1115] px-6 pt-10 text-[#F6F3EE]">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-[#A8AFBE]">Coming soon</p>
    </div>
  )
}

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
          <Route path="/shop" element={<PlaceholderPage title="Shop" />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
