import type { ReactNode } from "react"
import { BottomNav } from "./BottomNav"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#1F2A37] text-[#F2F4F5]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-28 pt-4">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
