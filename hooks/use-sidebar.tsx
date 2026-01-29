"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"

interface SidebarContextType {
  isOpen: boolean
  isMobile: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const MOBILE_BREAKPOINT = 1024

interface SidebarProviderProps {
  children: ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: SidebarProviderProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(() => {
    // SSR에서는 true로 시작 (데스크톱 기본값)
    if (typeof window === "undefined") return true
    // 모바일이면 닫힌 상태로 시작
    if (window.innerWidth < MOBILE_BREAKPOINT) return false
    // 데스크톱이면 항상 열린 상태로 시작
    return true
  })

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      // 모바일로 전환되면 사이드바 닫기, 데스크톱으로 전환되면 열기
      setIsOpen(!mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
