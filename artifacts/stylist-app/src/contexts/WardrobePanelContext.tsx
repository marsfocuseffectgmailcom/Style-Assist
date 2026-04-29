import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type WardrobePanelContextValue = {
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
}

const WardrobePanelContext = createContext<WardrobePanelContextValue>({
  panelOpen: false,
  setPanelOpen: () => {},
})

export function WardrobePanelProvider({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false)
  return (
    <WardrobePanelContext.Provider value={{ panelOpen, setPanelOpen }}>
      {children}
    </WardrobePanelContext.Provider>
  )
}

export function useWardrobePanel() {
  return useContext(WardrobePanelContext)
}
