import React from 'react';
import { Share2, RefreshCw } from 'lucide-react';
import './_group.css';
import { BottomNav } from './BottomNav';

export default function Preview3DScreen() {
  return (
    <div className="mockup-container pb-28" style={{ background: 'var(--bg-base)' }}>
      <div style={{ height: 44 }} />

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 20px' }}>
        <h1 className="font-editorial" style={{ fontSize: 26, color: 'var(--text-primary)' }}>Preview</h1>
        <button style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Share2 size={17} strokeWidth={1.5} color="var(--text-secondary)" />
        </button>
      </header>

      {/* Stage */}
      <div style={{ margin: '0 20px 20px', borderRadius: 'var(--radius-xl3)', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', aspectRatio: '3/4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,141,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Abstract figure */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Head */}
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(246,243,238,0.15)', border: '1px solid rgba(246,243,238,0.12)', marginBottom: 6 }} />
          {/* Neck */}
          <div style={{ width: 14, height: 10, background: 'rgba(246,243,238,0.1)', marginBottom: 0 }} />
          {/* Shirt */}
          <div style={{ width: 100, height: 90, borderRadius: '14px 14px 0 0', background: '#e8e0d5', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <span style={{ fontSize: 9, color: 'rgba(30,30,30,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Oxford</span>
            {/* Collar detail */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 14, borderLeft: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)' }} />
          </div>
          {/* Trousers */}
          <div style={{ width: 96, height: 110, background: '#1e3a5f', position: 'relative', display: 'flex', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '50%', height: '100%', borderRight: '1px solid rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tailored</span>
            </div>
          </div>
          {/* Shoes */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            {[0, 1].map(i => (
              <div key={i} style={{ width: 36, height: 14, borderRadius: '0 8px 8px 0', background: '#8b5e3c', boxShadow: '0 3px 8px rgba(0,0,0,0.4)' }} />
            ))}
          </div>
        </div>

        {/* Labels */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Front View</span>
          <span style={{ fontSize: 9, color: 'var(--brand-pink)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>1:1 Scale</span>
        </div>
      </div>

      {/* Outfit info */}
      <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
        <h2 className="font-editorial" style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 12 }}>Coastal Linen Ease</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {['White Oxford Shirt', 'Navy Tailored Trousers', 'Tan Leather Loafers'].map(item => (
            <span key={item} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '5px 12px', fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-glow" style={{ width: '100%', padding: '15px 0', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
          Save to History
        </button>
        <button className="btn-gold-outline" style={{ width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Generate New Looks
        </button>
      </div>

      <BottomNav active="none" />
    </div>
  );
}
