"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SidebarItem } from "./sidebar-item"
import { useSidebar } from "@/hooks/use-sidebar"
import type { NavGroup } from "@/types/navigation"

interface SidebarGroupProps {
  group: NavGroup
}

export function SidebarGroup({ group }: SidebarGroupProps) {
  const { isOpen: sidebarOpen } = useSidebar()

  return (
    <div className="py-2">
      {group.title && sidebarOpen && (
        <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          {group.title}
        </h4>
      )}
      {!sidebarOpen && group.title && (
        <div className="mx-3 mb-2 border-t border-sidebar-border" />
      )}
      <nav className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </nav>
    </div>
  )
}
