"use client"

import { PageHeader } from "@/components/layout/page-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Database01Icon,
  ArrowDataTransferHorizontalIcon,
  CheckmarkSquare01Icon,
  Wrench01Icon,
  Recycle01Icon,
  Calendar01Icon,
  ClipboardIcon,
  UserIcon,
  Factory02Icon,
  TruckDeliveryIcon,
  ChartLineData02Icon,
  Package01Icon,
  Shield02Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts"

// 자산 상태 분포 데이터
const assetStatusData = [
  { name: "사용중", value: 450, color: "#22c55e" },
  { name: "유휴", value: 120, color: "#eab308" },
  { name: "수리중", value: 35, color: "#f97316" },
  { name: "폐기대기", value: 28, color: "#ef4444" },
  { name: "이동중", value: 15, color: "#3b82f6" },
]

// 위치별 자산 현황 데이터
const locationData = [
  { name: "본사", 자산수: 280 },
  { name: "공장1", 자산수: 185 },
  { name: "공장2", 자산수: 142 },
  { name: "물류센터", 자산수: 68 },
  { name: "연구소", 자산수: 45 },
]

// 최근 자산이동 이력
const recentTransfers = [
  { id: "TR-001", asset: "노트북 A-1234", from: "본사 3층", to: "공장1 사무실", date: "2024-01-15", status: "완료" },
  { id: "TR-002", asset: "프린터 B-567", from: "물류센터", to: "본사 2층", date: "2024-01-14", status: "진행중" },
  { id: "TR-003", asset: "모니터 C-890", from: "연구소", to: "공장2", date: "2024-01-14", status: "승인대기" },
  { id: "TR-004", asset: "서버장비 D-012", from: "본사 IDC", to: "공장1 IDC", date: "2024-01-13", status: "완료" },
  { id: "TR-005", asset: "측정장비 E-345", from: "공장2", to: "연구소", date: "2024-01-12", status: "완료" },
]

// 나의 결재 대기함
const pendingApprovals = [
  { id: 1, title: "자산이동 승인요청 - 노트북 3대", requester: "김철수", date: "2024-01-15" },
  { id: 2, title: "폐기처리 승인요청 - 프린터 2대", requester: "이영희", date: "2024-01-14" },
  { id: 3, title: "자산실사 결과 승인", requester: "박지훈", date: "2024-01-13" },
]

// 금일 점검 일정
const todayInspections = [
  { id: 1, asset: "서버장비 S-001", location: "본사 IDC", time: "10:00" },
  { id: 2, asset: "공조설비 A-102", location: "공장1", time: "14:00" },
  { id: 3, asset: "소화설비 F-055", location: "물류센터", time: "16:00" },
]

// 실사 진행현황
const auditProgress = {
  total: 648,
  completed: 520,
  inProgress: 85,
  pending: 43,
}

// 금형 수명 관리 데이터 (Shot 수 기준)
const moldLifeData = [
  { id: "M-001", name: "범퍼 금형 A", currentShot: 85000, maxShot: 100000, status: "주의", partner: "삼성정밀" },
  { id: "M-002", name: "도어패널 금형 B", currentShot: 45000, maxShot: 80000, status: "정상", partner: "현대부품" },
  { id: "M-003", name: "대시보드 금형 C", currentShot: 72000, maxShot: 75000, status: "경고", partner: "대한금형" },
  { id: "M-004", name: "휀더 금형 D", currentShot: 30000, maxShot: 120000, status: "정상", partner: "우리정공" },
  { id: "M-005", name: "루프 금형 E", currentShot: 95000, maxShot: 100000, status: "교체필요", partner: "삼성정밀" },
]

// 협력사별 자산 현황
const partnerAssetData = [
  { name: "삼성정밀", 금형: 45, 설비: 32, 공구: 128 },
  { name: "현대부품", 금형: 38, 설비: 28, 공구: 95 },
  { name: "대한금형", 금형: 52, 설비: 15, 공구: 67 },
  { name: "우리정공", 금형: 28, 설비: 42, 공구: 112 },
  { name: "한국프레스", 금형: 35, 설비: 25, 공구: 88 },
]

// 월별 자산 증감 추이
const monthlyAssetTrend = [
  { month: "8월", 신규: 25, 폐기: 8, 순증감: 17 },
  { month: "9월", 신규: 32, 폐기: 12, 순증감: 20 },
  { month: "10월", 신규: 18, 폐기: 15, 순증감: 3 },
  { month: "11월", 신규: 28, 폐기: 5, 순증감: 23 },
  { month: "12월", 신규: 35, 폐기: 10, 순증감: 25 },
  { month: "1월", 신규: 22, 폐기: 7, 순증감: 15 },
]

// 수령/불출/대여 현황
const transferStats = {
  receive: { count: 45, pending: 8 },
  release: { count: 32, pending: 5 },
  rental: { count: 18, overdue: 3 },
}

// 점검 유형별 현황
const inspectionTypeData = [
  { name: "일반점검", 완료: 120, 예정: 35 },
  { name: "예방점검", 완료: 85, 예정: 42 },
  { name: "정기점검", 완료: 65, 예정: 28 },
  { name: "특별점검", 완료: 25, 예정: 12 },
]

export default function DashboardPage() {
  const totalAssets = assetStatusData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="자산관리 현황을 한눈에 확인하세요."
      />

      {/* ========== 섹션 1: 핵심 KPI 요약 (5컬럼) ========== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 총 자산 현황 */}
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>총 자산 현황</CardDescription>
            <CardTitle className="text-2xl font-bold">{totalAssets.toLocaleString()}건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Database01Icon} strokeWidth={2} className="h-4 w-4 text-blue-500" />
              <span>전월 대비 +12건</span>
            </div>
          </CardContent>
        </Card>

        {/* 이동 대기 */}
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>이동 대기</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">15건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} strokeWidth={2} className="h-4 w-4 text-blue-500" />
              <span>승인대기 3건</span>
            </div>
          </CardContent>
        </Card>

        {/* 점검 예정 */}
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>금일 점검 예정</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">8건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={CheckmarkSquare01Icon} strokeWidth={2} className="h-4 w-4 text-green-500" />
              <span>완료 5건 / 미완료 3건</span>
            </div>
          </CardContent>
        </Card>

        {/* 수리 진행중 */}
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>수리 진행중</CardDescription>
            <CardTitle className="text-2xl font-bold text-orange-600">35건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Wrench01Icon} strokeWidth={2} className="h-4 w-4 text-orange-500" />
              <span>외부수리 12건</span>
            </div>
          </CardContent>
        </Card>

        {/* 폐기 대기 */}
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>폐기 대기</CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600">28건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Recycle01Icon} strokeWidth={2} className="h-4 w-4 text-red-500" />
              <span>승인대기 8건</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========== 섹션 2: 나의 결재 대기함 (단독) ========== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="h-5 w-5" />
            나의 결재 대기함
          </CardTitle>
          <CardDescription>{pendingApprovals.length}건의 결재가 대기 중입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
              >
                <span className="text-sm font-medium line-clamp-1">{item.title}</span>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>요청자: {item.requester}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========== 섹션 3: 자산 현황 (2컬럼) ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 자산 상태 분포 도넛 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>자산 상태 분포</CardTitle>
            <CardDescription>현재 자산의 상태별 분포 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={assetStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {assetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}건`, "수량"]} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 위치별 자산 현황 막대 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>위치별 자산 현황</CardTitle>
            <CardDescription>각 위치별 자산 보유 수량</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}건`, "자산수"]} />
                <Bar dataKey="자산수" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ========== 섹션 4: 자산 이동/물류 ========== */}
      <Card>
        <CardHeader>
          <CardTitle>최근 자산이동 이력</CardTitle>
          <CardDescription>최근 진행된 자산 이동 내역입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">이동번호</th>
                  <th className="text-left py-3 px-2 font-medium">자산명</th>
                  <th className="text-left py-3 px-2 font-medium">이동전</th>
                  <th className="text-left py-3 px-2 font-medium">이동후</th>
                  <th className="text-left py-3 px-2 font-medium">일자</th>
                  <th className="text-left py-3 px-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {recentTransfers.map((transfer) => (
                  <tr key={transfer.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-2 font-mono text-xs">{transfer.id}</td>
                    <td className="py-3 px-2">{transfer.asset}</td>
                    <td className="py-3 px-2 text-muted-foreground">{transfer.from}</td>
                    <td className="py-3 px-2">{transfer.to}</td>
                    <td className="py-3 px-2 text-muted-foreground">{transfer.date}</td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={
                          transfer.status === "완료"
                            ? "default"
                            : transfer.status === "진행중"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {transfer.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 수령/불출/대여 요약 카드 (3컬럼) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <HugeiconsIcon icon={Package01Icon} strokeWidth={2} className="h-4 w-4 text-green-500" />
              자산 수령 현황
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">{transferStats.receive.count}건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-xs text-muted-foreground">승인대기 {transferStats.receive.pending}건</span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <HugeiconsIcon icon={TruckDeliveryIcon} strokeWidth={2} className="h-4 w-4 text-blue-500" />
              자산 불출 현황
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">{transferStats.release.count}건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-xs text-muted-foreground">승인대기 {transferStats.release.pending}건</span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} strokeWidth={2} className="h-4 w-4 text-purple-500" />
              자산 대여 현황
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600">{transferStats.rental.count}건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-xs text-red-500 font-medium">연체 {transferStats.rental.overdue}건</span>
          </CardContent>
        </Card>
      </div>

      {/* ========== 섹션 5: 점검/관리 (3컬럼) ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 금일 점검 일정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="h-5 w-5" />
              금일 점검 일정
            </CardTitle>
            <CardDescription>오늘 예정된 점검 일정</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayInspections.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.asset}</span>
                    <span className="text-xs text-muted-foreground">{item.location}</span>
                  </div>
                  <Badge variant="outline">{item.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 점검 유형별 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} className="h-5 w-5" />
              점검 유형별 현황
            </CardTitle>
            <CardDescription>유형별 완료/예정 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={inspectionTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={55} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="완료" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="예정" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 실사 진행현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ClipboardIcon} strokeWidth={2} className="h-5 w-5" />
              실사 진행현황
            </CardTitle>
            <CardDescription>자산실사 진행 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 진행률 바 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>전체 진행률</span>
                  <span className="font-medium">
                    {Math.round((auditProgress.completed / auditProgress.total) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${(auditProgress.completed / auditProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 상세 현황 */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-green-50">
                  <div className="text-lg font-bold text-green-600">{auditProgress.completed}</div>
                  <div className="text-xs text-muted-foreground">완료</div>
                </div>
                <div className="p-2 rounded-lg bg-blue-50">
                  <div className="text-lg font-bold text-blue-600">{auditProgress.inProgress}</div>
                  <div className="text-xs text-muted-foreground">진행중</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <div className="text-lg font-bold text-gray-600">{auditProgress.pending}</div>
                  <div className="text-xs text-muted-foreground">대기</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========== 섹션 6: 추이/수명/협력사 (3컬럼) ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 월별 자산 증감 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ChartLineData02Icon} strokeWidth={2} className="h-5 w-5" />
              월별 자산 증감 추이
            </CardTitle>
            <CardDescription>최근 6개월 변동</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyAssetTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="신규" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="폐기" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="순증감" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 협력사별 자산 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Factory02Icon} strokeWidth={2} className="h-5 w-5" />
              협력사별 자산 현황
            </CardTitle>
            <CardDescription>협력사별 자산 유형</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={partnerAssetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="금형" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="설비" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="공구" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 금형 수명 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} className="h-5 w-5" />
              금형 수명 관리
            </CardTitle>
            <CardDescription>Shot 수 기준 잔여 수명</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moldLifeData.slice(0, 4).map((mold) => {
                const percentage = Math.round((mold.currentShot / mold.maxShot) * 100)
                const remaining = mold.maxShot - mold.currentShot
                const statusColor =
                  mold.status === "정상" ? "bg-green-500" :
                  mold.status === "주의" ? "bg-yellow-500" :
                  mold.status === "경고" ? "bg-orange-500" : "bg-red-500"
                const statusTextColor =
                  mold.status === "정상" ? "text-green-600" :
                  mold.status === "주의" ? "text-yellow-600" :
                  mold.status === "경고" ? "text-orange-600" : "text-red-600"

                return (
                  <div key={mold.id} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate">{mold.name}</span>
                      <span className={`font-medium ${statusTextColor} text-xs`}>{mold.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statusColor} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
