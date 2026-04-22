import React from 'react';
import { Settings, Plus, Shirt, ShoppingBag, ArrowRight } from 'lucide-react';
import './_group.css';
import { BottomNav } from './BottomNav';

export default function HomeScreen() {
  return (
    <div className="mockup-container pb-28" style={{ background: 'var(--bg-base)' }}>
      {/* Status bar area */}
      <div style={{ height: 44 }} />

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 20px' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Good morning</p>
          <h1 className="font-editorial" style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1.1 }}>The Stylist</h1>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={18} strokeWidth={1.5} color="var(--text-secondary)" />
        </button>
      </header>

      <main style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* HeroLookCard */}
        <div className="card-dark" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          {/* Background glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,141,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Latest Look</span>
              <h2 className="font-editorial" style={{ fontSize: 28, color: 'var(--text-primary)', lineHeight: 1.1, marginTop: 4 }}>Coastal<br/>Linen Ease</h2>
            </div>
            <span className="gradient-pill" style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', letterSpacing: '0.04em' }}>Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[['Top', 'White Oxford Shirt'], ['Bottom', 'Navy Tailored Trousers'], ['Shoes', 'Tan Leather Loafers']].map(([role, item]) => (
              <div key={role} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{role}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>

          <button className="btn-glow" style={{ width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Wear This Look <ArrowRight size={15} />
          </button>
        </div>

        {/* QuickActionRow */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { icon: Plus, label: 'New Look', primary: true },
            { icon: Shirt, label: 'Wardrobe', primary: false },
            { icon: ShoppingBag, label: 'Shop', primary: false },
          ].map(({ icon: Icon, label, primary }) => (
            <button
              key={label}
              style={{
                flex: 1,
                background: primary ? 'linear-gradient(135deg, #FF4D8D, #FF7A5C)' : 'var(--bg-card)',
                border: primary ? 'none' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-xl2)',
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                boxShadow: primary ? 'var(--shadow-glow)' : 'none',
                cursor: 'pointer',
              }}
            >
              <Icon size={20} color={primary ? '#fff' : 'var(--text-secondary)'} strokeWidth={primary ? 2.5 : 1.5} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: primary ? '#fff' : 'var(--text-secondary)' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* WardrobeInsightCard */}
        <div className="card-dark" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 className="font-editorial" style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>Wardrobe Status</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>12 pieces · 5 categories · Spring ready</p>
            </div>
            <span style={{ fontSize: 11, color: 'var(--brand-gold)', fontWeight: 600 }}>View All</span>
          </div>

          <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.07)', display: 'flex', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: '40%', background: 'var(--brand-pink)' }} />
            <div style={{ width: '25%', background: 'var(--brand-coral)' }} />
            <div style={{ width: '20%', background: 'var(--brand-gold)' }} />
            <div style={{ width: '15%', background: 'rgba(168,175,190,0.4)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {[['Tops', '#FF4D8D'], ['Bottoms', '#FF7A5C'], ['Shoes', '#C8A96A'], ['Other', '#6F7788']].map(([cat, col]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: col }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <BottomNav active="home" />
    </div>
  );
}
