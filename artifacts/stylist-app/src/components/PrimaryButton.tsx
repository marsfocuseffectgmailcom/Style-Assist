import React from 'react';

type Props = {
  children: React.ReactNode
}

export function PrimaryButton({ children }: Props) {
  return (
    <button
      className="h-12 w-full rounded-[18px] bg-gradient-to-r from-brand-pink to-brand-coral text-white font-medium shadow-glow active:scale-[0.98] transition"
    >
      {children}
    </button>
  )
}
