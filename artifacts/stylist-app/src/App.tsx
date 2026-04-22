import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Stylist from "@/pages/stylist";
import Wardrobe from "@/pages/wardrobe";

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
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/stylist" component={Stylist} />
            <Route path="/wardrobe" component={Wardrobe} />
            <Route path="/shop">
              <PlaceholderPage title="Shop" />
            </Route>
            <Route path="/profile">
              <PlaceholderPage title="Profile" />
            </Route>
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
