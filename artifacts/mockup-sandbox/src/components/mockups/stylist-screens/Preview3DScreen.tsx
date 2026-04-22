import React from 'react';
import { Share, RefreshCw } from 'lucide-react';
import './_group.css';
import { BottomNav } from './BottomNav';

export default function Preview3DScreen() {
  return (
    <div className="mockup-container pb-24 bg-ivory">
      {/* Header */}
      <header className="flex justify-between items-center px-6 pt-14 pb-4">
        <h1 className="font-editorial text-2xl tracking-tight text-navy">Preview</h1>
        <button className="text-navy p-2 hover:bg-navy/5 transition-colors">
          <Share size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* Preview Stage */}
      <div className="mx-6 mt-4 mb-8 bg-[#e8e4db] aspect-[3/4] border border-navy/10 relative flex items-center justify-center overflow-hidden">
        {/* Abstract Mannequin / Fashion Sketch Silhouette */}
        <div className="relative w-40 h-[300px] flex flex-col items-center opacity-90">
          {/* Head/Neck */}
          <div className="w-10 h-14 bg-navy/20 mb-1"></div>
          {/* Torso/Shirt */}
          <div className="w-32 h-36 bg-white border border-navy/20 shadow-sm flex items-center justify-center relative">
            <div className="absolute top-0 w-8 h-6 border-b border-navy/10 flex justify-center">
              <div className="w-0.5 h-full bg-navy/10"></div>
            </div>
            <span className="text-[10px] text-navy/30 uppercase tracking-widest rotate-90">White Shirt</span>
          </div>
          {/* Legs/Trousers */}
          <div className="w-28 h-40 bg-navy mt-1 flex relative">
            <div className="w-1/2 h-full border-r border-ivory/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] text-ivory/50 uppercase tracking-widest -rotate-90">Navy Trouser</span>
            </div>
          </div>
          {/* Feet/Shoes */}
          <div className="w-32 flex justify-between mt-1 px-1">
            <div className="w-10 h-6 bg-[#8b5a2b]"></div>
            <div className="w-10 h-6 bg-[#8b5a2b]"></div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-navy/40 font-bold">
          Scale: 1:10
        </div>
        <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-navy/40 font-bold">
          Front View
        </div>
      </div>

      {/* Outfit Details */}
      <div className="px-6 mb-8 text-center">
        <h2 className="font-editorial text-3xl text-navy mb-4">Coastal Linen Ease</h2>
        
        <div className="inline-flex flex-wrap justify-center gap-2 max-w-[280px]">
          <span className="text-xs uppercase tracking-widest text-navy/70 border border-navy/20 px-3 py-1">White Oxford</span>
          <span className="text-xs uppercase tracking-widest text-navy/70 border border-navy/20 px-3 py-1">Navy Tailored Trouser</span>
          <span className="text-xs uppercase tracking-widest text-navy/70 border border-navy/20 px-3 py-1">Tan Loafer</span>
        </div>
      </div>

      <div className="px-6 space-y-3">
        <button className="w-full bg-navy text-ivory py-4 text-sm font-bold uppercase tracking-widest flex justify-center items-center gap-2">
          Save to History
        </button>
        <button className="w-full bg-transparent border border-navy text-navy py-4 text-sm font-bold uppercase tracking-widest flex justify-center items-center gap-2">
          <RefreshCw size={16} /> Generate New Looks
        </button>
      </div>

      <BottomNav active="none" />
    </div>
  );
}
