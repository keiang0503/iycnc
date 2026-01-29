import type { IconSvgElement } from "@hugeicons/react"

export interface NavItem {
  id: string
  label: string
  href?: string
  icon?: IconSvgElement
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  children?: NavItem[]
  disabled?: boolean
  hasContent?: boolean // 페이지 내용이 있는 메뉴 표시용
}

export interface NavGroup {
  id: string
  title?: string
  items: NavItem[]
}

export interface SidebarConfig {
  groups: NavGroup[]
}

export interface TopNavItem {
  id: string
  label: string
  href: string
  icon?: IconSvgElement
}
