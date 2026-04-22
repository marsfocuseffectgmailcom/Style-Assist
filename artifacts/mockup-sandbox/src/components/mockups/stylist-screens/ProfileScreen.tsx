import React from 'react';
import './_group.css';
import { BottomNav } from './BottomNav';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 13,
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--brand-pink)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 700,
  marginBottom: 7,
  display: 'block',
};

export default function ProfileScreen() {
  return (
    <div className="mockup-container pb-28" style={{ background: 'var(--bg-base)' }}>
      <div style={{ height: 44 }} />

      {/* Header */}
      <header style={{ padding: '0 24px 24px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 3 }}>Measurements &amp; Preferences</p>
        <h1 className="font-editorial" style={{ fontSize: 28, color: 'var(--text-primary)' }}>Your Profile</h1>
      </header>

      <form style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Styling for / Height */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Styling For</label>
            <select defaultValue="Men" style={{ ...fieldStyle, appearance: 'none' }}>
              <option>Men</option>
              <option>Women</option>
              <option>Non-binary</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Height</label>
            <input type="text" defaultValue="185 cm" style={fieldStyle} />
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label style={labelStyle}>Standard Sizing</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['Top', 'M / 40'], ['Bottom', '32/32'], ['Shoe', 'UK 10']].map(([lbl, val]) => (
              <div key={lbl} style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px' }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, display: 'block', marginBottom: 6 }}>{lbl}</span>
                <input type="text" defaultValue={val} style={{ background: 'transparent', border: 'none', width: '100%', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Fabrics */}
        <div>
          <label style={labelStyle}>Preferred Fabrics</label>
          <textarea
            defaultValue="Linen, heavy cotton, merino wool. Matte textures over anything shiny."
            rows={3}
            style={{ ...fieldStyle, resize: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* Avoid */}
        <div>
          <label style={labelStyle}>What to Avoid</label>
          <textarea
            defaultValue="Polyester, loud logos, skinny fit jeans. No bright reds or yellows."
            rows={3}
            style={{ ...fieldStyle, resize: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* Save */}
        <div>
          <button type="button" className="btn-glow" style={{ width: '100%', padding: '16px 0', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
            Save Profile
          </button>
        </div>

      </form>

      <BottomNav active="profile" />
    </div>
  );
}
