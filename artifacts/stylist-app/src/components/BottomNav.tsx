import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Shirt, Sparkles, Clock, User } from 'lucide-react';

const items = [
  { href: '/',          icon: Home,     label: 'Home'     },
  { href: '/wardrobe',  icon: Shirt,    label: 'Wardrobe' },
  { href: '/stylist',   icon: Sparkles, label: 'Studio'   },
  { href: '/history',   icon: Clock,    label: 'History'  },
  { href: '/profile',   icon: User,     label: 'Profile'  },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <nav className="w-full max-w-[430px] border-t border-white/[0.07] bg-bg-elevated/90 backdrop-blur-xl pb-5 pt-3 px-2 flex justify-around items-center">
        {items.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? location === '/' : location.startsWith(href);
          return (
            <Link key={href} href={href}>
              <button className="flex flex-col items-center gap-1 w-14 group">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={active ? 'text-brand-pink' : 'text-text-muted group-hover:text-text-secondary transition-colors'}
                />
                <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-brand-pink' : 'text-text-muted group-hover:text-text-secondary transition-colors'}`}>
                  {label}
                </span>
                {active && (
                  <span className="block h-1 w-1 rounded-full bg-brand-pink shadow-glow" />
                )}
              </button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
