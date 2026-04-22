import { useGetWardrobeStats, useGetStylistHistory } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetWardrobeStats();
  const { data: history, isLoading: historyLoading } = useGetStylistHistory();

  const recentSession = history?.[0];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl text-foreground">Welcome to The Stylist</h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-serif italic">
          Your personal wardrobe strategist. Precision meets personal expression.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Wardrobe Intelligence</h2>
            <Link href="/wardrobe" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors" data-testid="link-home-wardrobe">
              Manage Wardrobe <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {statsLoading ? (
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-none" />
              <Skeleton className="h-32 rounded-none" />
            </div>
          ) : statsError ? (
            <Alert variant="destructive" className="rounded-none border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Could not load wardrobe statistics.</AlertDescription>
            </Alert>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-none border-border bg-card/50 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-4xl font-serif">{stats.totalItems}</CardTitle>
                  <CardDescription className="text-sm uppercase tracking-wider text-muted-foreground">Total Pieces</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="rounded-none border-border bg-card/50 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-4xl font-serif">{Object.keys(stats.byCategory || {}).length}</CardTitle>
                  <CardDescription className="text-sm uppercase tracking-wider text-muted-foreground">Categories</CardDescription>
                </CardHeader>
              </Card>
              
              {/* Could show top categories here */}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Studio</h2>
            <Link href="/stylist" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors" data-testid="link-home-stylist">
              Enter Studio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <Card className="rounded-none border-border bg-primary text-primary-foreground shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary-foreground">
                <Sparkles className="w-5 h-5" /> Consult the Stylist
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Generate bespoke editorial looks based on your profile and occasions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stylist" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground hover:bg-background/90 h-10 px-8 rounded-none w-full sm:w-auto" data-testid="btn-home-consult">
                Start Session
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {historyLoading ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif">Recent Session</h2>
          <Skeleton className="h-64 rounded-none" />
        </div>
      ) : recentSession ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Recent Session</h2>
            <Link href="/history" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors" data-testid="link-home-history">
              View Archive <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <Card className="rounded-none border-border shadow-none bg-secondary/30">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground">Occasion</p>
                    <p className="font-serif text-lg">{recentSession.occasion}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground">Location</p>
                    <p className="font-serif text-lg">{recentSession.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground">Season</p>
                    <p className="font-serif text-lg">{recentSession.season}</p>
                  </div>
                  <div className="pt-4">
                    <span className="text-xs text-muted-foreground">
                      {new Date(recentSession.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-border/50 pt-8 md:pt-0 md:pl-8 flex flex-col justify-center">
                  <h3 className="font-serif text-xl mb-4">The Stylist's Pick</h3>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{recentSession.stylistsPick}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}