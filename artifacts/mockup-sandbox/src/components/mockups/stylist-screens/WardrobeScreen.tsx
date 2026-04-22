import React from 'react';
import { Plus, Search, Shirt } from 'lucide-react';
import './_group.css';
import { BottomNav } from './BottomNav';

const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear'];

const items = [
  { id: 1, name: 'White Oxford Shirt', category: 'Tops', colour: '#e8e0d5', brand: "Ralph Lauren" },
  { id: 2, name: 'Striped Breton Top', category: 'Tops', colour: '#1a2a4a', brand: 'Saint James' },
  { id: 3, name: 'Grey Cashmere Sweater', category: 'Tops', colour: '#9ca3af', brand: 'Sunspel' },
  { id: 4, name: 'Black Turtleneck', category: 'Tops', colour: '#111', brand: 'Uniqlo' },
  { id: 5, name: 'Navy Tailored Trousers', category: 'Bottoms', colour: '#1e3a5f', brand: 'Cos' },
  { id: 6, name: 'Olive Chinos', category: 'Bottoms', colour: '#4a5240', brand: 'Incotex' },
];

export default function WardrobeScreen() {
  return (
    <div className="mockup-container pb-28" style={{ background: 'var(--bg-base)' }}>
      <div style={{ height: 44 }} />

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 20px' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 3 }}>12 pieces</p>
          <h1 className="font-editorial" style={{ fontSize: 26, color: 'var(--text-primary)' }}>Wardrobe</h1>
        </div>
        <button className="btn-glow" style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: 'none', cursor: 'pointer' }}>
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </button>
      </header>

      {/* Search */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search archive..."
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-xl2)',
              padding: '12px 16px 12px 38px',
              fontSize: 13,
              color: 'var(--text-secondary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {categories.map((cat) => {
          const active = cat === 'Tops';
          return (
            <button
              key={cat}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: 999,
                background: active ? 'linear-gradient(135deg, #FF4D8D, #FF7A5C)' : 'var(--bg-card)',
                border: active ? 'none' : '1px solid rgba(255,255,255,0.07)',
                fontSize: 12,
                fontWeight: 600,
                color: active ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: active ? 'var(--shadow-glow)' : 'none',
                letterSpacing: '0.03em',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
        {items.map((item) => (
          <div key={item.id} className="card-dark" style={{ overflow: 'hidden', cursor: 'pointer' }}>
            {/* Swatch area */}
            <div style={{ aspectRatio: '4/3', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 44, height: 52, background: item.colour, borderRadius: 8, opacity: 0.85, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 7px' }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.category}</span>
              </div>
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 3, lineHeight: 1.3 }}>{item.name}</p>
              <p style={{ fontSize: 11, color: 'var(--brand-gold)', fontWeight: 500 }}>{item.brand}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="wardrobe" />
    </div>
  );
}
