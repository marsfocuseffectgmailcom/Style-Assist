import React from 'react';
import { motion } from "framer-motion"

export function HeroLookCard() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-bg-card to-[#12161F] p-4 shadow-soft">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-[18px] font-semibold">Today&apos;s Look</h2>
          <p className="text-sm text-text-secondary">Smart casual</p>
        </div>
        <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-text-secondary">
          23°C
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="mb-4 flex h-[170px] items-center justify-center rounded-[20px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_60%)]"
      >
        <img
          src="/mannequin-look.png"
          alt="Today look"
          className="h-[160px] object-contain"
        />
      </motion.div>

      <div className="space-y-2">
        <button className="h-12 w-full rounded-[18px] bg-gradient-to-r from-brand-pink to-brand-coral font-medium text-white shadow-glow">
          View Look
        </button>
        <button className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 text-sm text-text-primary">
          Regenerate
        </button>
      </div>
    </div>
  )
}
