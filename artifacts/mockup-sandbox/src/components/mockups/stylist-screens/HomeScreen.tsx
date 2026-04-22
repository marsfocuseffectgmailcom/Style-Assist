import React from 'react';
import { Settings, Plus, ArrowRight, Shirt } from 'lucide-react';
import './_group.css';
import { BottomNav } from './BottomNav';

export default function HomeScreen() {
  return (
    <div className="mockup-container pb-24">
      {/* Header */}
      <header className="flex justify-between items-center px-6 pt-14 pb-6 bg-ivory">
        <h1 className="font-editorial text-2xl tracking-tight text-navy">The Stylist</h1>
        <button className="text-navy">
          <Settings size={22} strokeWidth={1.5} />
        </button>
      </header>

      <main className="px-6 space-y-10">
        {/* HeroLookCard */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xs uppercase tracking-widest text-navy/60 font-semibold">Latest Look</h2>
            <span className="text-xs text-terracotta font-medium">View All</span>
          </div>
          <div className="texture-bg border border-navy/10 p-8 shadow-sm">
            <div className="mb-8">
              <h3 className="font-editorial text-3xl leading-none text-navy mb-2">Coastal<br/>Linen Ease</h3>
              <p className="text-sm text-navy/70 font-body">Generated 2 days ago for Weekend Brunch</p>
            </div>
            
            <div className="space-y-3 font-body text-sm text-navy">
              <div className="flex justify-between border-b border-navy/10 pb-2">
                <span className="text-navy/60">Top</span>
                <span className="font-medium text-right">Navy Knitted Polo</span>
              </div>
              <div className="flex justify-between border-b border-navy/10 pb-2">
                <span className="text-navy/60">Bottom</span>
                <span className="font-medium text-right">Cream Linen Trousers</span>
              </div>
              <div className="flex justify-between border-b border-navy/10 pb-2">
                <span className="text-navy/60">Shoes</span>
                <span className="font-medium text-right">Brown Suede Loafers</span>
              </div>
              <div className="flex justify-between border-b border-navy/10 pb-2">
                <span className="text-navy/60">Accessory</span>
                <span className="font-medium text-right">Tortoiseshell Sunglasses</span>
              </div>
            </div>

            <button className="mt-8 w-full bg-navy text-ivory py-3.5 text-sm font-medium tracking-wide uppercase flex justify-center items-center gap-2 hover:bg-navy/90 transition-colors">
              Wear This Look
            </button>
          </div>
        </section>

        {/* QuickActionRow */}
        <section className="flex gap-3">
          <button className="flex-1 bg-terracotta text-ivory py-4 px-2 flex flex-col items-center justify-center gap-2">
            <Plus size={20} />
            <span className="text-xs font-medium uppercase tracking-wider">New Look</span>
          </button>
          <button className="flex-1 border border-navy text-navy py-4 px-2 flex flex-col items-center justify-center gap-2">
            <Shirt size={20} strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-wider">Wardrobe</span>
          </button>
          <button className="flex-1 border border-navy text-navy py-4 px-2 flex flex-col items-center justify-center gap-2">
            <ArrowRight size={20} strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-wider">Shop</span>
          </button>
        </section>

        {/* WardrobeInsightCard */}
        <section className="bg-navy text-ivory p-6">
          <div className="mb-4">
            <h2 className="font-editorial text-xl mb-1">Wardrobe Status</h2>
            <p className="text-xs text-ivory/70 uppercase tracking-widest">12 pieces · 5 categories · Spring ready</p>
          </div>
          
          <div className="h-2 w-full bg-ivory/10 flex">
            <div className="h-full bg-terracotta" style={{ width: '40%' }}></div>
            <div className="h-full bg-ivory/80" style={{ width: '30%' }}></div>
            <div className="h-full bg-ivory/40" style={{ width: '20%' }}></div>
            <div className="h-full bg-ivory/20" style={{ width: '10%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-ivory/60 mt-2">
            <span>Tops 40%</span>
            <span>Bottoms 30%</span>
            <span>Shoes 20%</span>
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
