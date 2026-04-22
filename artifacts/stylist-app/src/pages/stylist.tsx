import { useState } from "react";
import { useGenerateOutfits, useGetProfile } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OutfitSuggestions } from "@workspace/api-client-react";

const formSchema = z.object({
  occasion: z.string().min(2, "Occasion is required"),
  season: z.string().min(2, "Season is required"),
  location: z.string().min(2, "Location is required"),
  trendingStyles: z.string().optional(),
  colourPalette: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Stylist() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const [result, setResult] = useState<OutfitSuggestions | null>(null);
  
  const generateMutation = useGenerateOutfits({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      occasion: "",
      season: "",
      location: "",
      trendingStyles: "",
      colourPalette: "",
    }
  });

  const onSubmit = (data: FormValues) => {
    generateMutation.mutate({ data });
  };

  const isPending = generateMutation.isPending;

  if (profileLoading) {
    return <div className="p-20"><Skeleton className="h-[600px] rounded-none" /></div>;
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in">
        <h1 className="text-4xl font-serif">The Studio is Closed</h1>
        <p className="text-muted-foreground max-w-md">
          To provide bespoke styling advice, the Stylist needs to understand your physical profile and preferences.
        </p>
        <Button asChild className="rounded-none mt-4 px-8">
          <Link href="/profile" data-testid="link-setup-profile">
            Complete Style Profile
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="space-y-4 pb-8 border-b border-border">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground">The Studio</h1>
        <p className="text-xl text-muted-foreground font-serif italic">
          Consult the AI for editorial direction.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-card/30 border border-border p-6 sm:p-8">
            <h2 className="font-serif text-2xl mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              The Brief
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="occasion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-[10px]">Occasion</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Gallery opening, Business dinner" className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" {...field} data-testid="input-stylist-occasion" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-widest text-[10px]">Season</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Late Autumn" className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" {...field} data-testid="input-stylist-season" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-widest text-[10px]">Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. London, Tokyo" className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" {...field} data-testid="input-stylist-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="colourPalette"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-[10px]">Palette Direction (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Monochromatic, Jewel tones" className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" {...field} data-testid="input-stylist-palette" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trendingStyles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-[10px]">Style Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. Minimalist, Avant-garde, Classic tailoring" className="rounded-none border border-border bg-transparent focus-visible:ring-0 resize-none" {...field} data-testid="input-stylist-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isPending} 
                  className="w-full rounded-none h-12 text-md font-serif mt-4"
                  data-testid="btn-generate-outfits"
                >
                  {isPending ? "Consulting..." : "Generate Looks"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="lg:col-span-8 min-h-[500px]">
          {isPending ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse text-muted-foreground p-12 bg-secondary/10 border border-border/50">
              <Sparkles className="w-8 h-8 opacity-50 animate-bounce" />
              <div className="space-y-3 text-center">
                <p className="font-serif text-2xl">The Stylist is curating your looks...</p>
                <p className="italic text-sm">Analyzing wardrobe, occasion, and profile.</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
              
              <div className="bg-primary/5 border border-primary/20 p-8 space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold">The Stylist's Verdict</h3>
                <p className="font-serif text-2xl leading-relaxed text-foreground">
                  "{result.stylistsPick}"
                </p>
              </div>

              <div className="space-y-12">
                {result.outfits.map((outfit, index) => (
                  <div key={index} className="border-t border-border pt-12 relative">
                    <div className="absolute top-12 right-0 opacity-10 text-9xl font-serif leading-none select-none pointer-events-none">
                      0{index + 1}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h3 className="text-3xl font-serif">{outfit.name}</h3>
                        <p className="text-muted-foreground italic leading-relaxed">{outfit.description}</p>
                        
                        <div className="pt-4 border-t border-border/30">
                          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">The Pieces</h4>
                          <ul className="space-y-3">
                            {Object.entries(outfit.items).map(([key, value]) => (
                              <li key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                                <span className="font-medium text-sm min-w-[80px]">{key}</span>
                                <span className="text-muted-foreground">{value as string}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/20 p-6 md:p-8 space-y-4 self-start">
                        <h4 className="text-[10px] uppercase tracking-widest text-foreground font-bold">Why This Works</h4>
                        <p className="text-sm leading-loose text-muted-foreground">
                          {outfit.whyThisWorks}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border text-muted-foreground">
              <p className="font-serif text-xl">Awaiting your brief.</p>
              <p className="text-sm mt-2">Fill out the occasion details to generate bespoke looks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}