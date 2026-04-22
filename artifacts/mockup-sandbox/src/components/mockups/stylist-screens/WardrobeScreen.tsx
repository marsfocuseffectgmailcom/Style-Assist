import React from 'react';
import { Plus, Search } from 'lucide-react';
import './_group.css';
import { BottomNav } from './BottomNav';

export default function WardrobeScreen() {
  const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];
  
  const items = [
    { id: 1, name: 'White Oxford Shirt', category: 'Tops', color: '#ffffff', brand: 'Drake\'s' },
    { id: 2, name: 'Striped Breton Top', category: 'Tops', color: '#0f172a', brand: 'Armor Lux' },
    { id: 3, name: 'Grey Cashmere Sweater', category: 'Tops', color: '#9ca3af', brand: 'John Smedley' },
    { id: 4, name: 'Black Turtleneck', category: 'Tops', color: '#000000', brand: 'Sunspel' },
    { id: 5, name: 'Navy Tailored Trousers', category: 'Bottoms', color: '#0f172a', brand: 'Incotex' },
    { id: 6, name: 'Olive Chinos', category: 'Bottoms', color: '#4b5563', brand: 'Officine Generale' },
  ];

  return (
    <div className="mockup-container pb-24 bg-ivory">
      {/* Header */}
      <header className="flex justify-between items-center px-6 pt-14 pb-4">
        <h1 className="font-editorial text-2xl tracking-tight text-navy">Wardrobe Archive</h1>
        <button className="text-navy p-2 border border-navy">
          <Plus size={18} strokeWidth={2} />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/50" />
          <input 
            type="text" 
            placeholder="Search your archive..." 
            className="w-full bg-transparent border border-navy/20 pl-12 pr-4 py-3 text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-navy"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-6 mb-8 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button 
              key={cat}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold whitespace-nowrap transition-colors ${
                cat === 'Tops' 
                  ? 'bg-navy text-ivory border border-navy' 
                  : 'bg-transparent text-navy/60 border border-navy/20 hover:border-navy'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wardrobe Grid */}
      <div className="px-6 grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-navy/10 bg-white group cursor-pointer hover:border-navy/30 transition-colors">
            <div className="aspect-[3/4] bg-navy/5 relative flex items-center justify-center p-4">
              {/* Placeholder for item image */}
              <div className="w-16 h-20 border border-navy/10 bg-white shadow-sm flex items-center justify-center">
                <Shirt size={24} className="text-navy/20" strokeWidth={1} />
              </div>
              <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                <div 
                  className="w-3 h-3 border border-navy/20" 
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-[9px] uppercase tracking-widest font-bold text-navy/50 bg-white px-1.5 py-0.5 border border-navy/10">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-navy/5">
              <h3 className="font-editorial text-sm text-navy font-bold leading-tight mb-1 truncate">{item.name}</h3>
              <p className="text-[10px] text-terracotta uppercase tracking-widest font-semibold">{item.brand}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="wardrobe" />
    </div>
  );
}

// Temporary icon import fallback if Shirt isn't right
import { Shirt } from 'lucide-react';