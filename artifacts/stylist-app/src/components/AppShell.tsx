import type { ReactNode } from "react"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#1F2A37] text-[#F5F5F5]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-28 pt-6">
        {children}
      </div>
    </div>
  )
}
