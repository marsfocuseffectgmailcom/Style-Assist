import type { ReactNode } from "react"
import { BottomNav } from "./BottomNav"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F6F3EE]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-28 pt-4">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
