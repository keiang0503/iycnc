import {
  Home01Icon,
  DashboardSquare01Icon,
  FileIcon,
  Search01Icon,
  ArrowDataTransferHorizontalIcon,
  ClipboardIcon,
  Wrench01Icon,
  CheckmarkSquare01Icon,
  Recycle01Icon,
  SecurityLockIcon,
  Database01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import type { TopNavItem, SidebarConfig } from "@/types/navigation"

export const topNavItems: TopNavItem[] = [
  {
    id: "organization",
    label: "조직도",
    href: "#",
    icon: Home01Icon,
  },
  {
    id: "pages",
    label: "전체메뉴",
    href: "/pages",
    icon: FileIcon,
  },
  {
    id: "apps",
    label: "회사홈페이지",
    href: "/apps",
    icon: DashboardSquare01Icon,
  },
]

export const sidebarConfig: SidebarConfig = {
  groups: [
    {
      id: "main",
      items: [
        {
          id: "dashboard",
          label: "대시보드",
          href: "/",
          icon: DashboardSquare01Icon,
          hasContent: true,
        },
      ],
    },
    {
      id: "asset-base",
      title: "기준정보관리",
      items: [
        {
          id: "asset-base-info",
          label: "자산기준정보",
          icon: Database01Icon,
          children: [
            {
              id: "asset-register",
              label: "자산조회 등록",
              href: "/asset-base/register",
              hasContent: true,
            },
            {
              id: "asset-location-mgmt",
              label: "자산위치관리",
              href: "/asset-base/location",
            },
          ],
        },
      ],
    },
    {
      id: "asset",
      title: "자산관리",
      items: [
        {
          id: "asset-search-group",
          label: "자산조회",
          icon: Search01Icon,
          children: [
            {
              id: "asset-usage-status",
              label: "자산사용현황조회",
              href: "/asset-search/usage",
              hasContent: true,
            },
            {
              id: "asset-inspection-status",
              label: "자산점검현황 조회",
              href: "/asset-search/inspection",
            },
            {
              id: "asset-location-search",
              label: "자산위치조회",
              href: "/asset-search/location",
              hasContent: true,
            },
            {
              id: "asset-status-search",
              label: "자산상태조회",
              href: "/asset-search/status",
              hasContent: true,
            },
          ],
        },
        {
          id: "asset-transfer-group",
          label: "자산이동관리",
          icon: ArrowDataTransferHorizontalIcon,
          children: [
            {
              id: "asset-org-location-move",
              label: "자산조직 및 위치이동",
              href: "/asset-transfer/move",
              hasContent: true,
            },
            {
              id: "asset-receive-release",
              label: "자산수령/불출/대여",
              href: "/asset-transfer/receive-release",
            },
            {
              id: "asset-org-location-status",
              label: "자산조직 및 위치현황 조회",
              href: "/asset-transfer/status",
            },
          ],
        },
        {
          id: "asset-audit-group",
          label: "자산실사",
          icon: ClipboardIcon,
          children: [
            {
              id: "asset-audit-plan",
              label: "자산실사계획등록",
              href: "/asset-audit/plan",
            },
            {
              id: "asset-audit-execute",
              label: "자산실사실행",
              href: "/asset-audit/execute",
            },
            {
              id: "asset-audit-confirm",
              label: "자산실사확정",
              href: "/asset-audit/confirm",
            },
            {
              id: "asset-audit-history",
              label: "자산실사이력조회",
              href: "/asset-audit/history",
            },
          ],
        },
        {
          id: "asset-repair-group",
          label: "자산 수정/수리",
          icon: Wrench01Icon,
          children: [
            {
              id: "asset-repair-status",
              label: "자산수정/수리현황조회",
              href: "/asset-repair/status",
            },
            {
              id: "asset-repair-register",
              label: "자산 수정/수리이력 등록",
              href: "/asset-repair/register",
            },
          ],
        },
        {
          id: "asset-inspection-group",
          label: "자산 점검",
          icon: CheckmarkSquare01Icon,
          children: [
            {
              id: "asset-general-inspection-register",
              label: "자산 일반점검 등록",
              href: "/asset-inspection/general/register",
            },
            {
              id: "asset-general-inspection-history",
              label: "자산일반점검 이력조회",
              href: "/asset-inspection/general/history",
            },
            {
              id: "asset-preventive-inspection-register",
              label: "자산예방점검 등록",
              href: "/asset-inspection/preventive/register",
            },
            {
              id: "asset-preventive-inspection-history",
              label: "자산 예방점검 이력조회",
              href: "/asset-inspection/preventive/history",
            },
          ],
        },
        {
          id: "asset-disposal-group",
          label: "자산폐기",
          icon: Recycle01Icon,
          children: [
            {
              id: "asset-disposal-request",
              label: "자산 폐기요청",
              href: "/asset-disposal/request",
            },
            {
              id: "asset-disposal-execute",
              label: "자산폐기실행",
              href: "/asset-disposal/execute",
            },
            {
              id: "asset-disposal-search",
              label: "자산폐기조회",
              href: "/asset-disposal/search",
            },
          ],
        },
      ],
    },
    {
      id: "system",
      title: "시스템관리",
      items: [
        {
          id: "auth-mgmt",
          label: "권한관리",
          href: "/system/auth",
          icon: SecurityLockIcon,
        },
        {
          id: "system-settings",
          label: "시스템설정",
          href: "/system/settings",
          icon: Settings01Icon,
        },
      ],
    },
  ],
}
