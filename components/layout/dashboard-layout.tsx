"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SidebarProvider } from "@/hooks/use-sidebar"
import { TopNavigation } from "./top-navigation"
import { Sidebar } from "./sidebar"
import { useSidebar } from "@/hooks/use-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar()

  return (
    <div
      className={cn(
        "min-h-screen pt-16 transition-all duration-300",
        !isMobile && (isOpen ? "pl-64" : "pl-16")
      )}
    >
      <main className="p-6">{children}</main>
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-background">
        <TopNavigation />
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  )
}
