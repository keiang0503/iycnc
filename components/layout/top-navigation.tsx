"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  Notification01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarToggle } from "./sidebar"
import { topNavItems } from "@/lib/navigation-config"
import { useSidebar } from "@/hooks/use-sidebar"

export function TopNavigation() {
  const pathname = usePathname()
  const { isOpen, isMobile } = useSidebar()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border bg-background">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Logo & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <SidebarToggle />
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/biglogo.jpg"
              alt="로고"
              width={160}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center: Main Navigation (hidden on mobile) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.icon && (
                  <HugeiconsIcon
                    icon={item.icon}
                    strokeWidth={2}
                    className="h-4 w-4"
                  />
                )}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon
              icon={Notification01Icon}
              strokeWidth={2}
              className="h-5 w-5"
            />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden text-muted-foreground hover:text-foreground sm:flex"
          >
            <HugeiconsIcon
              icon={Settings01Icon}
              strokeWidth={2}
              className="h-5 w-5"
            />
            <span className="sr-only">Settings</span>
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar size="sm">
                  <AvatarImage src="/avatars/user.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
