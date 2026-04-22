import React from 'react';
import './_group.css';
import { BottomNav } from './BottomNav';

export default function ProfileScreen() {
  return (
    <div className="mockup-container pb-24 bg-ivory">
      {/* Header */}
      <header className="px-6 pt-14 pb-8 border-b border-navy/10">
        <h1 className="font-editorial text-3xl tracking-tight text-navy">Your Profile</h1>
        <p className="text-xs uppercase tracking-widest text-navy/50 mt-2 font-bold">Measurements & Preferences</p>
      </header>

      <form className="px-6 pt-8 space-y-8">
        {/* Gender & Height */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-terracotta font-bold">Styling For</label>
            <select className="w-full bg-transparent border-b border-navy/20 py-2 text-sm text-navy font-body font-semibold rounded-none focus:outline-none focus:border-navy appearance-none">
              <option>Men</option>
              <option>Women</option>
              <option>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-terracotta font-bold">Height</label>
            <input 
              type="text" 
              defaultValue="185 cm"
              className="w-full bg-transparent border-b border-navy/20 py-2 text-sm text-navy font-body font-semibold rounded-none focus:outline-none focus:border-navy"
            />
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-terracotta font-bold">Standard Sizing</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-navy/20 p-3 bg-white focus-within:border-navy">
              <label className="text-[9px] uppercase tracking-widest text-navy/50 block mb-1">Top</label>
              <input type="text" defaultValue="M / 40" className="w-full bg-transparent text-sm font-semibold text-navy focus:outline-none" />
            </div>
            <div className="border border-navy/20 p-3 bg-white focus-within:border-navy">
              <label className="text-[9px] uppercase tracking-widest text-navy/50 block mb-1">Bottom</label>
              <input type="text" defaultValue="32 / 32" className="w-full bg-transparent text-sm font-semibold text-navy focus:outline-none" />
            </div>
            <div className="border border-navy/20 p-3 bg-white focus-within:border-navy">
              <label className="text-[9px] uppercase tracking-widest text-navy/50 block mb-1">Shoe</label>
              <input type="text" defaultValue="UK 10" className="w-full bg-transparent text-sm font-semibold text-navy focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Textareas */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-terracotta font-bold">Preferred Fabrics</label>
          <textarea 
            className="w-full bg-white border border-navy/20 p-4 text-sm text-navy font-body h-24 focus:outline-none focus:border-navy resize-none"
            defaultValue="Linen, heavy cotton, merino wool. Prefer matte textures over anything shiny."
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-terracotta font-bold">What to avoid</label>
          <textarea 
            className="w-full bg-white border border-navy/20 p-4 text-sm text-navy font-body h-24 focus:outline-none focus:border-navy resize-none"
            defaultValue="Polyester, loud logos, skinny fit jeans. No bright reds or yellows."
          ></textarea>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button type="button" className="w-full bg-terracotta text-ivory py-4 text-sm font-bold uppercase tracking-widest hover:bg-terracotta/90 transition-colors">
            Save Profile
          </button>
        </div>
      </form>

      <BottomNav active="profile" />
    </div>
  );
}
