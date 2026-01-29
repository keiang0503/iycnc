"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarGroup } from "./sidebar-group"
import { useSidebar } from "@/hooks/use-sidebar"
import { sidebarConfig } from "@/lib/navigation-config"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon, SidebarLeft01Icon } from "@hugeicons/core-free-icons"

function SidebarContent() {
  return (
    <ScrollArea className="flex-1 px-2">
      <div className="space-y-1 py-2">
        {sidebarConfig.groups.map((group) => (
          <SidebarGroup key={group.id} group={group} />
        ))}
      </div>
    </ScrollArea>
  )
}

function SidebarLogo() {
  const { isOpen } = useSidebar()

  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-4">
      <Image
        src="/images/biglogo.jpg"
        alt="로고"
        width={isOpen ? 160 : 32}
        height={32}
        className="h-8 w-auto object-contain"
        priority
      />
    </Link>
  )
}

export function Sidebar() {
  const { isOpen, isMobile, toggle, close } = useSidebar()

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SheetHeader className="border-b border-sidebar-border px-2">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarLogo />
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Fixed sidebar (hidden on mobile via CSS)
  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r border-sidebar-border bg-sidebar transition-all duration-300",
        "hidden lg:block",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <div className="flex items-center justify-end px-2 py-2 border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <HugeiconsIcon
              icon={SidebarLeft01Icon}
              strokeWidth={2}
              className={cn("h-4 w-4 transition-transform", !isOpen && "rotate-180")}
            />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>

        {/* Navigation Content */}
        <SidebarContent />
      </div>
    </aside>
  )
}

export function SidebarToggle() {
  const { toggle } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      className="lg:hidden"
    >
      <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="h-5 w-5" />
      <span className="sr-only">Toggle Menu</span>
    </Button>
  )
}
