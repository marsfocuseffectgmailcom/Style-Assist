import { useState } from "react";
import { 
  useListWardrobeItems, 
  useCreateWardrobeItem, 
  useUpdateWardrobeItem, 
  useDeleteWardrobeItem,
  getListWardrobeItemsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { WardrobeItem } from "@workspace/api-client-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(2, "Category is required"),
  colour: z.string().min(2, "Colour is required"),
  season: z.string().min(2, "Season is required"),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Wardrobe() {
  const { data: items, isLoading } = useListWardrobeItems();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  
  const categories = ["All", ...Array.from(new Set(items?.map(i => i.category) || []))];
  
  const filteredItems = items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.brand?.toLowerCase().includes(search.toLowerCase()) ||
                          item.colour.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-foreground">Archive</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-sm">Your Wardrobe Collection</p>
        </div>
        
        <ItemDialog mode="create" />
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, brand, or colour..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-none bg-transparent border-border focus-visible:ring-1"
            data-testid="input-wardrobe-search"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filterCategory === cat ? "default" : "outline"}
              className="rounded-none whitespace-nowrap"
              onClick={() => setFilterCategory(cat)}
              data-testid={`btn-filter-${cat.toLowerCase()}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-none" />
          ))}
        </div>
      ) : filteredItems?.length === 0 ? (
        <div className="py-20 text-center space-y-4 border border-dashed border-border">
          <p className="text-xl font-serif text-muted-foreground">The archive is empty.</p>
          <p className="text-sm text-muted-foreground">No pieces match your current selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems?.map((item) => (
            <div key={item.id} className="group relative border border-border bg-card/20 p-6 flex flex-col transition-colors hover:bg-card/50">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ItemMenu item={item} />
              </div>
              
              <div className="mb-8">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">
                  {item.category} • {item.season}
                </span>
                <h3 className="font-serif text-xl line-clamp-2">{item.name}</h3>
                {item.brand && (
                  <p className="text-sm text-muted-foreground mt-1">{item.brand}</p>
                )}
              </div>
              
              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: item.colour.toLowerCase() }} />
                  <span className="text-sm capitalize">{item.colour}</span>
                </div>
                {item.notes && (
                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                    "{item.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemDialog({ mode, item }: { mode: "create" | "edit", item?: WardrobeItem }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateWardrobeItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWardrobeItemsQueryKey() });
        setOpen(false);
        toast({ title: "Piece added to archive." });
        form.reset();
      }
    }
  });

  const updateMutation = useUpdateWardrobeItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWardrobeItemsQueryKey() });
        setOpen(false);
        toast({ title: "Piece updated." });
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      category: item?.category || "",
      colour: item?.colour || "",
      season: item?.season || "",
      brand: item?.brand || "",
      notes: item?.notes || "",
    }
  });

  const onSubmit = (data: FormValues) => {
    if (mode === "create") {
      createMutation.mutate({ data });
    } else if (item) {
      updateMutation.mutate({ id: item.id, data });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="rounded-none gap-2 font-serif" data-testid="btn-add-item">
            <Plus className="w-4 h-4" /> Add Piece
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start rounded-none px-2 h-8" data-testid={`btn-edit-item-${item?.id}`}>
            <Pencil className="w-3 h-3 mr-2" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-[600px] border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{mode === "create" ? "Add to Archive" : "Edit Piece"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Catalog a new piece in your wardrobe." : "Update the details of this piece."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Navy Linen Blazer" className="rounded-none" {...field} data-testid="input-item-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Loro Piana" className="rounded-none" {...field} data-testid="input-item-brand" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Outerwear, Top, Bottom" className="rounded-none" {...field} data-testid="input-item-category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colour</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Navy, Olive, Cream" className="rounded-none" {...field} data-testid="input-item-colour" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Summer, All-season" className="rounded-none" {...field} data-testid="input-item-season" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Styling Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tailored fit, pairs well with cream trousers" className="rounded-none" {...field} data-testid="input-item-notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending} className="rounded-none px-8" data-testid="btn-submit-item">
                {isPending ? "Saving..." : mode === "create" ? "Add Piece" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ItemMenu({ item }: { item: WardrobeItem }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const deleteMutation = useDeleteWardrobeItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWardrobeItemsQueryKey() });
        setDeleteOpen(false);
        toast({ title: "Piece removed from archive." });
      }
    }
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none bg-background/80 backdrop-blur-sm" data-testid={`btn-menu-item-${item.id}`}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-none min-w-[160px]">
          <ItemDialog mode="edit" item={item} />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive rounded-none px-2 h-8 cursor-pointer" 
            onSelect={(e) => { e.preventDefault(); setDeleteOpen(true); }}
            data-testid={`btn-delete-item-${item.id}`}
          >
            <Trash2 className="w-3 h-3 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Remove from Archive?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{item.name}" from your wardrobe. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate({ id: item.id });
              }}
              disabled={deleteMutation.isPending}
              data-testid={`btn-confirm-delete-${item.id}`}
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}