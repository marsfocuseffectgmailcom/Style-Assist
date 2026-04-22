import React from 'react';
import { Home, Shirt, Sparkles, Clock, User } from 'lucide-react';
import './_group.css';

interface BottomNavProps {
  active: 'home' | 'wardrobe' | 'studio' | 'history' | 'profile' | 'none';
}

export function BottomNav({ active }: BottomNavProps) {
  const items = [
    { id: 'home',     icon: Home,     label: 'Home' },
    { id: 'wardrobe', icon: Shirt,    label: 'Wardrobe' },
    { id: 'studio',   icon: Sparkles, label: 'Studio' },
    { id: 'history',  icon: Clock,    label: 'History' },
    { id: 'profile',  icon: User,     label: 'Profile' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        width: 390,
        background: 'rgba(21,25,34,0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 20,
        paddingTop: 12,
        paddingLeft: 8,
        paddingRight: 8,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {items.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              width: 56,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.5}
              style={{ color: isActive ? '#FF4D8D' : '#6F7788' }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: isActive ? '#FF4D8D' : '#6F7788',
              }}
            >
              {label}
            </span>
            {isActive && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#FF4D8D',
                  boxShadow: '0 0 6px rgba(255,77,141,0.7)',
                  marginTop: 1,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
