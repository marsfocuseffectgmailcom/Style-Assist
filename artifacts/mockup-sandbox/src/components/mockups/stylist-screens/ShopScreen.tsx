import React from 'react';
import './_group.css';
import { BottomNav } from './BottomNav';

export default function ShopScreen() {
  const shopItems = [
    { id: 1, name: 'Linen Blazer', brand: 'Cos', price: '£195' },
    { id: 2, name: 'White Derby Shoes', brand: 'Common Projects', price: '£340' },
    { id: 3, name: 'Tailored Shorts', brand: 'Incotex', price: '£165' },
    { id: 4, name: 'Cotton Crewneck', brand: 'Sunspel', price: '£95' },
  ];

  return (
    <div className="mockup-container pb-24 bg-ivory">
      {/* Header */}
      <header className="px-6 pt-14 pb-6 border-b border-navy/10">
        <h1 className="font-editorial text-3xl tracking-tight text-navy mb-2">The Edit</h1>
        <p className="text-xs uppercase tracking-widest text-terracotta font-semibold leading-relaxed">
          Based on your wardrobe gaps and recent looks
        </p>
      </header>

      {/* Intro Text */}
      <div className="px-6 py-6 font-editorial text-navy/80 italic text-sm text-center">
        "We noticed a lack of unstructured tailoring in your archive. These pieces will effortlessly bridge the gap between casual and formal."
      </div>

      {/* Shop Grid */}
      <div className="px-6 grid grid-cols-2 gap-4">
        {shopItems.map((item) => (
          <div key={item.id} className="border border-navy bg-white flex flex-col group">
            <div className="aspect-square bg-navy/5 border-b border-navy/10 flex items-center justify-center p-4">
              <div className="w-full h-full border border-navy/10 bg-[#f8f5f0] flex items-center justify-center">
                <span className="font-editorial text-navy/20 italic">Image</span>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-editorial text-sm font-bold text-navy mb-1">{item.name}</h3>
              <p className="text-[10px] uppercase tracking-widest text-navy/60 mb-3">{item.brand}</p>
              <div className="mt-auto">
                <p className="text-sm font-body text-navy font-semibold mb-4">{item.price}</p>
                <button className="w-full py-2.5 border border-navy text-xs uppercase tracking-widest font-bold text-navy hover:bg-navy hover:text-ivory transition-colors">
                  Add to Wardrobe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 mt-8">
        <button className="w-full py-4 bg-terracotta text-ivory text-sm font-bold uppercase tracking-widest">
          View All Recommendations
        </button>
      </div>

      <BottomNav active="none" />
    </div>
  );
}
