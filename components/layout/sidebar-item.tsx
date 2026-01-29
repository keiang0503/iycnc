"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { NavItem } from "@/types/navigation"
import { useSidebar } from "@/hooks/use-sidebar"

interface SidebarItemProps {
  item: NavItem
  depth?: number
}

export function SidebarItem({ item, depth = 0 }: SidebarItemProps) {
  const pathname = usePathname()
  const { isOpen: sidebarOpen } = useSidebar()
  const [isExpanded, setIsExpanded] = React.useState(true)

  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href ? pathname === item.href : false
  const isChildActive = item.children?.some(
    (child) => child.href && pathname === child.href
  )

  React.useEffect(() => {
    if (isChildActive) {
      setIsExpanded(true)
    }
  }, [isChildActive])

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const content = (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        isChildActive && !isActive && "text-sidebar-accent-foreground",
        item.disabled && "pointer-events-none opacity-50",
        depth > 0 && "ml-4 pl-4 border-l border-sidebar-border"
      )}
    >
      {item.icon && (
        <HugeiconsIcon
          icon={item.icon}
          strokeWidth={2}
          className={cn(
            "h-5 w-5 shrink-0",
            isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70"
          )}
        />
      )}
      {sidebarOpen && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.hasContent && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
          )}
          {item.badge !== undefined && (
            <Badge
              variant={item.badgeVariant || "default"}
              className="ml-auto h-5 px-1.5 text-xs"
            >
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <HugeiconsIcon
              icon={isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
              strokeWidth={2}
              className="h-4 w-4 shrink-0 text-sidebar-foreground/50"
            />
          )}
        </>
      )}
    </div>
  )

  const wrappedContent = !sidebarOpen && item.icon ? (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        <p>{item.label}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    content
  )

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={handleToggle}
          className="w-full text-left"
          disabled={item.disabled}
        >
          {wrappedContent}
        </button>
        {isExpanded && sidebarOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <SidebarItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {wrappedContent}
      </Link>
    )
  }

  return wrappedContent
}
