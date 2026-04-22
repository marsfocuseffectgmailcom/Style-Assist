import React from 'react';
import './_group.css';
import { BottomNav } from './BottomNav';

const outfits = [
  {
    name: 'Riviera\nDusk',
    items: [['Outerwear', 'Navy Linen Blazer'], ['Top', 'White Oxford Shirt'], ['Bottom', 'Ivory Trousers'], ['Shoes', 'Tan Leather Loafers']],
    teaser: 'Seamless transition from day to evening elegance.',
    selected: true,
  },
  {
    name: 'Parisian\nEase',
    items: [['Outerwear', 'Camel Wool Coat'], ['Top', 'Black Turtleneck'], ['Bottom', 'Olive Chinos'], ['Shoes', 'Chelsea Boots']],
    teaser: 'Understated monochrome with a dramatic silhouette.',
    selected: false,
  },
  {
    name: 'Midnight\nAccord',
    items: [['Top', 'Grey Cashmere Sweater'], ['Bottom', 'Black Slim Jeans'], ['Shoes', 'Dark Brown Chelsea Boots']],
    teaser: 'Tonal harmony anchored by rich texture contrast.',
    selected: false,
  },
];

export default function StylistScreen() {
  return (
    <div className="mockup-container pb-28" style={{ background: 'var(--bg-base)' }}>
      <div style={{ height: 44 }} />

      {/* Header */}
      <header style={{ padding: '0 24px 16px', textAlign: 'center' }}>
        <h1 className="font-editorial" style={{ fontSize: 26, color: 'var(--text-primary)' }}>The Studio</h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Dinner in Paris · Spring · Paris, FR</p>
      </header>

      {/* Outfit Carousel */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          padding: '4px 20px 16px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
        }}
      >
        {outfits.map((outfit) => (
          <div
            key={outfit.name}
            style={{
              flexShrink: 0,
              width: '78%',
              scrollSnapAlign: 'center',
              borderRadius: 'var(--radius-xl3)',
              background: outfit.selected
                ? 'linear-gradient(155deg, #1e2235 0%, #151922 100%)'
                : 'var(--bg-card)',
              border: outfit.selected
                ? '1px solid rgba(255,77,141,0.35)'
                : '1px solid rgba(255,255,255,0.06)',
              padding: 20,
              boxShadow: outfit.selected ? 'var(--shadow-glow)' : 'var(--shadow-soft)',
              opacity: outfit.selected ? 1 : 0.55,
              transition: 'opacity 0.2s',
              position: 'relative',
            }}
          >
            {outfit.selected && (
              <div className="gradient-pill" style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, fontWeight: 700, padding: '3px 10px', letterSpacing: '0.06em' }}>
                PICK
              </div>
            )}
            <h2
              className="font-editorial"
              style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 16, whiteSpace: 'pre-line' }}
            >
              {outfit.name}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
              {outfit.items.map(([role, item]) => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 9 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{role}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{item}</span>
                </div>
              ))}
            </div>
            <p
              className="font-editorial"
              style={{ fontSize: 12, color: outfit.selected ? 'var(--brand-gold)' : 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}
            >
              "{outfit.teaser}"
            </p>
          </div>
        ))}
      </div>

      {/* Carousel dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
        {outfits.map((o, i) => (
          <div key={i} style={{ width: i === 0 ? 20 : 6, height: 6, borderRadius: 999, background: i === 0 ? 'var(--brand-pink)' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>

      {/* Why It Works */}
      <div style={{ margin: '0 20px' }}>
        <div className="card-dark" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--brand-pink)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>Why This Works</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
            The navy linen blazer adds structure without weight — perfect for a warm Parisian evening. Pairing it with the ivory trousers creates a stark tonal contrast, while the tan loafers ground the look with warmth.
          </p>
          <div style={{ borderRadius: 14, background: 'rgba(200,169,106,0.1)', border: '1px solid rgba(200,169,106,0.25)', padding: '14px 16px' }}>
            <p style={{ fontSize: 10, color: 'var(--brand-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Stylist's Verdict</p>
            <p className="font-editorial" style={{ fontSize: 13, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>
              "Riviera Dusk wins — it's the only look that holds its own in candlelight and afternoon sun. The other two are good. This one is memorable."
            </p>
          </div>
        </div>

        <button className="btn-glow" style={{ width: '100%', marginTop: 14, padding: '16px 0', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textAlign: 'center' }}>
          Save Look · View in Preview
        </button>
      </div>

      <BottomNav active="studio" />
    </div>
  );
}
