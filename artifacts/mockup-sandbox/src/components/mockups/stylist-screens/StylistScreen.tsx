import React from 'react';
import './_group.css';
import { BottomNav } from './BottomNav';

export default function StylistScreen() {
  return (
    <div className="mockup-container pb-24 bg-ivory">
      {/* Header */}
      <header className="px-6 pt-14 pb-6 text-center border-b border-navy/10">
        <h1 className="font-editorial text-2xl tracking-tight text-navy">The Studio</h1>
      </header>

      {/* Styled Form Summary */}
      <div className="px-6 py-4 flex flex-wrap gap-x-6 gap-y-2 border-b border-navy/10 text-xs font-body text-navy uppercase tracking-widest">
        <div><span className="text-navy/50 mr-2">For</span>Dinner in Paris</div>
        <div><span className="text-navy/50 mr-2">Season</span>Spring</div>
        <div><span className="text-navy/50 mr-2">Loc</span>Paris</div>
      </div>

      {/* Outfit Carousel */}
      <div className="mt-8 mb-8 overflow-x-auto flex gap-4 px-6 snap-x snap-mandatory hide-scrollbar">
        {/* Card 1 - Selected */}
        <div className="snap-center shrink-0 w-[85%] border border-navy bg-navy text-ivory p-6 shadow-xl relative">
          <div className="absolute top-4 right-4 bg-terracotta text-ivory text-[10px] font-bold uppercase tracking-widest px-2 py-1">
            Selected
          </div>
          <h2 className="font-editorial text-4xl leading-none mb-6 mt-4">Riviera<br/>Dusk</h2>
          
          <div className="space-y-4 text-sm font-body text-ivory/90 mb-8">
            <div className="flex justify-between border-b border-ivory/20 pb-2">
              <span className="text-ivory/50">Outerwear</span>
              <span className="text-right">Navy Linen Blazer</span>
            </div>
            <div className="flex justify-between border-b border-ivory/20 pb-2">
              <span className="text-ivory/50">Top</span>
              <span className="text-right">White Silk Shirt</span>
            </div>
            <div className="flex justify-between border-b border-ivory/20 pb-2">
              <span className="text-ivory/50">Bottom</span>
              <span className="text-right">Ivory Tailored Trousers</span>
            </div>
            <div className="flex justify-between border-b border-ivory/20 pb-2">
              <span className="text-ivory/50">Shoes</span>
              <span className="text-right">Black Horsebit Loafers</span>
            </div>
          </div>
          
          <p className="text-xs italic text-terracotta font-editorial">
            "A seamless transition from day to evening elegance."
          </p>
        </div>

        {/* Card 2 */}
        <div className="snap-center shrink-0 w-[85%] border border-navy/20 bg-ivory text-navy p-6 opacity-60 transition-opacity">
          <h2 className="font-editorial text-4xl leading-none mb-6 mt-4">Parisian<br/>Ease</h2>
          
          <div className="space-y-4 text-sm font-body text-navy mb-8">
            <div className="flex justify-between border-b border-navy/10 pb-2">
              <span className="text-navy/50">Outerwear</span>
              <span className="text-right">Beige Mac Coat</span>
            </div>
            <div className="flex justify-between border-b border-navy/10 pb-2">
              <span className="text-navy/50">Top</span>
              <span className="text-right">Black Turtleneck</span>
            </div>
            <div className="flex justify-between border-b border-navy/10 pb-2">
              <span className="text-navy/50">Bottom</span>
              <span className="text-right">Charcoal Wool Trousers</span>
            </div>
            <div className="flex justify-between border-b border-navy/10 pb-2">
              <span className="text-navy/50">Shoes</span>
              <span className="text-right">Black Chelsea Boots</span>
            </div>
          </div>
          
          <p className="text-xs italic text-terracotta font-editorial">
            "Understated monochrome with a dramatic silhouette."
          </p>
        </div>
      </div>

      {/* Why It Works Card */}
      <div className="px-6 mb-8">
        <div className="border border-navy/10 p-6 bg-white">
          <h3 className="font-editorial text-xl mb-4 text-navy">Why This Works</h3>
          <p className="text-sm font-body text-navy/80 leading-relaxed mb-6">
            The navy linen blazer provides structure without stiffness, ideal for a Parisian dinner. Pairing it with a silk shirt elevates the texture, while the ivory trousers create a stark, elegant contrast. It respects traditional tailoring but feels effortlessly modern.
          </p>
          
          <div className="bg-terracotta/10 border-l-2 border-terracotta p-4">
            <h4 className="text-xs uppercase tracking-widest text-terracotta font-bold mb-1">Stylist's Pick</h4>
            <p className="text-sm font-editorial italic text-navy">
              "The stark contrast between navy and ivory is a timeless hallmark of Riviera style."
            </p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <button className="w-full bg-navy text-ivory py-4 text-sm font-bold uppercase tracking-widest">
          Save Look & View in 3D
        </button>
      </div>

      <BottomNav active="studio" />
    </div>
  );
}
