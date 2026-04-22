import { useGetStylistHistory } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Clock, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Outfit } from "@workspace/api-client-react";

export default function History() {
  const { data: history, isLoading } = useGetStylistHistory();

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="space-y-4 pb-6 border-b border-border">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground">Archive</h1>
        <p className="text-xl text-muted-foreground font-serif italic">
          Past sessions and styling directions.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-none" />
          ))}
        </div>
      ) : history?.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-border">
          <p className="font-serif text-2xl text-muted-foreground mb-4">No sessions found.</p>
          <Link href="/stylist" className="text-primary hover:underline underline-offset-4 flex items-center gap-2">
            Start your first consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {history?.map((session) => {
            let outfits: Outfit[] = [];
            try {
              outfits = JSON.parse(session.outfitsJson);
            } catch (e) {
              console.error("Failed to parse outfits JSON", e);
            }

            return (
              <div key={session.id} className="border border-border bg-card/10 overflow-hidden group">
                <div className="border-b border-border bg-secondary/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 sm:gap-8 text-sm">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {new Date(session.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {session.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {session.season}
                    </div>
                  </div>
                  <div className="font-serif text-lg">
                    {session.occasion}
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                  <div className="space-y-2 max-w-3xl">
                    <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold">The Stylist's Verdict</h3>
                    <p className="font-serif text-xl italic text-muted-foreground leading-relaxed">
                      "{session.stylistsPick}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {outfits.map((outfit, index) => (
                      <div key={index} className="space-y-4 border-l border-border pl-6 relative">
                        <div className="absolute top-0 -left-[17px] bg-background text-xs font-serif text-muted-foreground w-8 text-center bg-card">
                          0{index + 1}
                        </div>
                        <h4 className="font-serif text-lg line-clamp-1" title={outfit.name}>{outfit.name}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {Object.entries(outfit.items).slice(0, 4).map(([key, value]) => (
                            <li key={key} className="truncate">
                              <span className="font-medium text-foreground">{key}:</span> {value as string}
                            </li>
                          ))}
                          {Object.keys(outfit.items).length > 4 && (
                            <li className="text-xs italic">+ {Object.keys(outfit.items).length - 4} more pieces</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}