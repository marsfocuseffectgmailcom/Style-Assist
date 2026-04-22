import { Link, useLocation } from "wouter";
import { Scissors, LayoutGrid, Layers, Clock, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/wardrobe", label: "Wardrobe", icon: Layers },
  { href: "/stylist", label: "Studio", icon: Scissors },
  { href: "/history", label: "History", icon: Clock },
  { href: "/profile", label: "Profile", icon: User },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col text-sidebar-foreground">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-sidebar-primary rounded-sm flex items-center justify-center text-sidebar-primary-foreground group-hover:bg-opacity-90 transition-colors">
              <Scissors className="w-4 h-4" />
            </div>
            <span className="font-serif text-xl tracking-wide">The Stylist</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                data-testid={`link-sidebar-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border/50 text-xs text-sidebar-foreground/50">
          Editorial Edition
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-10 lg:p-12 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}