import React from 'react';
import './_group.css';
import { BottomNav } from './BottomNav';

const shopItems = [
  { id: 1, name: 'Linen Blazer', brand: 'Cos', price: '£195', tag: 'Gap Fill', colour: '#c4b89a' },
  { id: 2, name: 'White Derby Shoes', brand: 'Common Projects', price: '£340', tag: 'Trending', colour: '#e8e0d5' },
  { id: 3, name: 'Tailored Shorts', brand: 'Incotex', price: '£165', tag: 'Seasonal', colour: '#5c6b50' },
  { id: 4, name: 'Cotton Crewneck', brand: 'Sunspel', price: '£95', tag: 'Versatile', colour: '#8c8c8c' },
];

const tagColor: Record<string, string> = {
  'Gap Fill': '#FF4D8D',
  'Trending': '#FF7A5C',
  'Seasonal': '#C8A96A',
  'Versatile': '#A8AFBE',
};

export default function ShopScreen() {
  return (
    <div className="mockup-container pb-28" style={{ background: 'var(--bg-base)' }}>
      <div style={{ height: 44 }} />

      {/* Header */}
      <header style={{ padding: '0 24px 6px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 3 }}>Curated for you</p>
        <h1 className="font-editorial" style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 6 }}>The Edit</h1>
      </header>

      {/* Insight banner */}
      <div style={{ margin: '12px 20px 20px', borderRadius: 'var(--radius-xl2)', background: 'linear-gradient(135deg, rgba(255,77,141,0.12), rgba(255,122,92,0.08))', border: '1px solid rgba(255,77,141,0.2)', padding: '12px 16px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
          "Your wardrobe lacks unstructured tailoring. These pieces bridge casual and formal without effort."
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
        {shopItems.map((item) => (
          <div key={item.id} className="card-dark" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Swatch */}
            <div style={{ aspectRatio: '1', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 56, height: 64, background: item.colour, borderRadius: 10, boxShadow: '0 6px 16px rgba(0,0,0,0.4)' }} />
              <div style={{ position: 'absolute', top: 10, left: 10, borderRadius: 999, padding: '3px 9px', background: tagColor[item.tag] + '22', border: `1px solid ${tagColor[item.tag]}55` }}>
                <span style={{ fontSize: 9, color: tagColor[item.tag], fontWeight: 700, letterSpacing: '0.04em' }}>{item.tag}</span>
              </div>
            </div>
            {/* Info */}
            <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{item.name}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 10 }}>{item.brand}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: 14, color: 'var(--brand-gold)', fontWeight: 700 }}>{item.price}</span>
                <button style={{ fontSize: 10, color: 'var(--brand-pink)', fontWeight: 700, letterSpacing: '0.04em', background: 'rgba(255,77,141,0.1)', border: '1px solid rgba(255,77,141,0.3)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <button className="btn-glow" style={{ width: '100%', padding: '15px 0', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
          View All Recommendations
        </button>
      </div>

      <BottomNav active="none" />
    </div>
  );
}
