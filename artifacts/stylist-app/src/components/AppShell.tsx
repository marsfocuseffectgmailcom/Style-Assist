import React from 'react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen px-6 pb-28 pt-4">
        {children}
      </div>
    </div>
  );
}
