import React from 'react';
import { Home, Shirt, Sparkles, History, User } from 'lucide-react';
import './_group.css';

interface BottomNavProps {
  active: 'home' | 'wardrobe' | 'studio' | 'history' | 'profile' | 'none';
}

export function BottomNav({ active }: BottomNavProps) {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'wardrobe', icon: Shirt, label: 'Wardrobe' },
    { id: 'studio', icon: Sparkles, label: 'Studio' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 w-[390px] bg-navy text-ivory border-t border-navy/20 pb-6 pt-3 px-4 z-50 flex justify-between items-center shadow-2xl">
      {items.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button key={item.id} className="flex flex-col items-center gap-1.5 w-14">
            <Icon size={20} className={isActive ? 'text-terracotta' : 'text-ivory/60'} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-terracotta' : 'text-ivory/60'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
