import { useEffect, useRef } from "react";
import { useGetProfile, useUpsertProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { User, Ruler, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  gender: z.string().min(1, "Required"),
  height: z.string().min(1, "Required"),
  topSize: z.string().min(1, "Required"),
  bottomSize: z.string().min(1, "Required"),
  shoeSize: z.string().min(1, "Required"),
  preferredFabrics: z.string().optional(),
  avoidItems: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Profile() {
  const { data: profile, isLoading, isError } = useGetProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const upsertMutation = useUpsertProfile({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Profile updated successfully." });
        queryClient.setQueryData(getGetProfileQueryKey(), data);
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "",
      height: "",
      topSize: "",
      bottomSize: "",
      shoeSize: "",
      preferredFabrics: "",
      avoidItems: "",
    }
  });

  const isInitRef = useRef(false);

  useEffect(() => {
    if (profile && !isInitRef.current) {
      form.reset({
        gender: profile.gender || "",
        height: profile.height || "",
        topSize: profile.topSize || "",
        bottomSize: profile.bottomSize || "",
        shoeSize: profile.shoeSize || "",
        preferredFabrics: profile.preferredFabrics || "",
        avoidItems: profile.avoidItems || "",
      });
      isInitRef.current = true;
    }
  }, [profile, form]);

  const onSubmit = (data: FormValues) => {
    upsertMutation.mutate({ data });
  };

  const isPending = upsertMutation.isPending;

  if (isLoading) {
    return <div className="p-10"><Skeleton className="h-[600px] rounded-none" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="space-y-4 pb-6 border-b border-border text-center sm:text-left">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground">Style Profile</h1>
        <p className="text-xl text-muted-foreground font-serif italic">
          The foundation of your editorial look.
        </p>
      </header>

      <div className="bg-card/20 border border-border p-8 md:p-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-border/50 pb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Demographics & Sizing
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender/Style Presentation</FormLabel>
                      <FormControl>
                        <Input className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" placeholder="e.g. Womenswear, Menswear, Unisex" {...field} data-testid="input-profile-gender" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <FormControl>
                        <Input className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" placeholder="e.g. 5'10, 178cm" {...field} data-testid="input-profile-height" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="topSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top Size</FormLabel>
                      <FormControl>
                        <Input className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" placeholder="e.g. M, UK 10, US 6" {...field} data-testid="input-profile-topsize" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bottomSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bottom Size</FormLabel>
                      <FormControl>
                        <Input className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" placeholder="e.g. 32, W30 L32, UK 12" {...field} data-testid="input-profile-bottomsize" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shoeSize"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Shoe Size</FormLabel>
                      <FormControl>
                        <Input className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 px-0 rounded-none focus-visible:border-primary" placeholder="e.g. EU 42, UK 8" {...field} data-testid="input-profile-shoesize" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-6 pt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-border/50 pb-2 flex items-center gap-2">
                <Shirt className="w-4 h-4" /> Preferences & Restrictions
              </h2>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="preferredFabrics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Fabrics</FormLabel>
                      <FormControl>
                        <Textarea className="rounded-none border border-border bg-transparent focus-visible:ring-0 resize-none min-h-[100px]" placeholder="e.g. Linen, Silk, Heavy cotton, Cashmere" {...field} data-testid="input-profile-fabrics" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avoidItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items to Avoid</FormLabel>
                      <FormControl>
                        <Textarea className="rounded-none border border-border bg-transparent focus-visible:ring-0 resize-none min-h-[100px]" placeholder="e.g. Synthetics, Neon colours, Skinny jeans" {...field} data-testid="input-profile-avoid" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <div className="pt-8 flex justify-center sm:justify-end">
              <Button 
                type="submit" 
                disabled={isPending} 
                className="rounded-none h-14 px-12 text-md font-serif w-full sm:w-auto"
                data-testid="btn-save-profile"
              >
                {isPending ? "Updating Profile..." : "Save Profile"}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}