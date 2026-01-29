"use client"

import { useState, useMemo, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, RowSelectionOptions } from "ag-grid-community"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FileExportIcon,
  PrinterIcon,
  SentIcon,
} from "@hugeicons/core-free-icons"

ModuleRegistry.registerModules([AllCommunityModule])

// 금형코드 리스트 (멀티셀렉트용)
const moldCodeList = [
  "IM10081A",
  "IM10588A",
  "IM10588B",
  "IM10824A",
  "IM11286A",
  "IM11302A",
]

// 더미 데이터
const dummyData = [
  {
    id: 1,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM10081A",
    moldName: "BASE CAB",
    factory: "1130",
    moldStatus: "양산",
    modelName: "FR-S580CG",
    partCode: "3010326000",
    partName: "",
    assetCode: "111060003030",
    buyer: "대희정밀\n(0000010207)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
  {
    id: 2,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM10588A",
    moldName: "BASE CAB",
    factory: "1130",
    moldStatus: "REPEAT",
    modelName: "FRS-571B",
    partCode: "3010339300",
    partName: "REF",
    assetCode: "111060003309",
    buyer: "대희정밀\n(0000010207)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
  {
    id: 3,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM10588B",
    moldName: "BASE CAB",
    factory: "1130",
    moldStatus: "양산",
    modelName: "FRS-571B",
    partCode: "3010339300",
    partName: "REF",
    assetCode: "111060003742",
    buyer: "대희정밀\n(0000010207)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
  {
    id: 4,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM10824A",
    moldName: "BASE CAB",
    factory: "1130",
    moldStatus: "양산",
    modelName: "FR-B512FH",
    partCode: "3010345100",
    partName: "",
    assetCode: "111060003523",
    buyer: "대희정밀\n(0000010207)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
  {
    id: 5,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM11286A",
    moldName: "BASE CAB",
    factory: "1130",
    moldStatus: "양산",
    modelName: "FR-\nQ323HGR",
    partCode: "3010356300",
    partName: "",
    assetCode: "111060005474",
    buyer: "대희정밀\n(0000010207)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
  {
    id: 6,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM11302A",
    moldName: "CASE\nVAPORI",
    factory: "1130",
    moldStatus: "양산",
    modelName: "FR-\nQ323HGR",
    partCode: "3011197400",
    partName: "",
    assetCode: "111060005503",
    buyer: "아이앤테크(주)\n(0000010034)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
  {
    id: 7,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM10081A",
    moldName: "BASE CAB",
    factory: "1130",
    moldStatus: "양산",
    modelName: "FR-S580CG",
    partCode: "3010326000",
    partName: "",
    assetCode: "111060003031",
    buyer: "대희정밀\n(0000010207)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
  {
    id: 8,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM10588A",
    moldName: "BASE CAB",
    factory: "1130",
    moldStatus: "양산",
    modelName: "FRS-571B",
    partCode: "3010339300",
    partName: "REF",
    assetCode: "111060003310",
    buyer: "대희정밀\n(0000010207)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
  {
    id: 9,
    companyCode: "10250((주)신성화학)",
    moldCode: "IM10824A",
    moldName: "BASE CAB",
    factory: "1130",
    moldStatus: "양산",
    modelName: "FR-B512FH",
    partCode: "3010345100",
    partName: "",
    assetCode: "111060003524",
    buyer: "대희정밀\n(0000010207)",
    manufacturer: "",
    shotPerformance: 0,
    actualStorage: "냉장고 장고 2",
    usageStatus: "양산",
    progressStage: "속성등록/\n변경완료",
    receivingCompany: "",
    changeDate: "2018-02-13\n17:09:58",
    confirmationDate: "",
    purchaseManager: "",
  },
]

export default function AssetStatusSearchPage() {
  // 검색 필터 상태
  const [factory, setFactory] = useState("all")
  const [usageStatus, setUsageStatus] = useState("all")
  const [companyCode, setCompanyCode] = useState("")
  const [selectedMoldCodes, setSelectedMoldCodes] = useState<string[]>([])
  const [partCode, setPartCode] = useState("")
  const [assetCode, setAssetCode] = useState("")
  const [buyerCode, setBuyerCode] = useState("")
  const [moldStatus, setMoldStatus] = useState("all")
  const [transferStatus, setTransferStatus] = useState("exclude")
  const [progressStage, setProgressStage] = useState("all")

  // 그리드 데이터
  const [rowData, setRowData] = useState(dummyData)

  // 페이징 상태
  const [displayCount, setDisplayCount] = useState(30)

  // 페이징 처리
  const displayedData = rowData.slice(0, displayCount)
  const hasMore = displayCount < rowData.length
  const remainingCount = rowData.length - displayCount

  // 더보기 핸들러
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 30)
  }

  // 행 선택 설정
  const rowSelection = useMemo<RowSelectionOptions>(
    () => ({
      mode: "multiRow",
      checkboxes: false,
      headerCheckbox: false,
      enableClickSelection: true,
    }),
    []
  )

  // 컬럼 정의
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "업체코드",
        field: "companyCode",
        width: 160,
        cellClass: "text-left",
      },
      {
        headerName: "금형코드",
        field: "moldCode",
        width: 100,
        cellClass: "text-center",
      },
      {
        headerName: "금형명",
        field: "moldName",
        width: 100,
        cellClass: "text-center",
        cellStyle: { whiteSpace: "pre-wrap", lineHeight: "1.3" },
      },
      {
        headerName: "공장",
        field: "factory",
        width: 70,
        cellClass: "text-center",
      },
      {
        headerName: "금형상태",
        field: "moldStatus",
        width: 80,
        cellClass: "text-center",
      },
      {
        headerName: "모델명",
        field: "modelName",
        width: 100,
        cellClass: "text-center",
        cellStyle: { whiteSpace: "pre-wrap", lineHeight: "1.3" },
      },
      {
        headerName: "부품코드",
        field: "partCode",
        width: 110,
        cellClass: "text-center",
      },
      {
        headerName: "부품명",
        field: "partName",
        width: 80,
        cellClass: "text-center",
      },
      {
        headerName: "자산코드",
        field: "assetCode",
        width: 130,
        cellClass: "text-center",
      },
      {
        headerName: "BUYER",
        field: "buyer",
        width: 120,
        cellStyle: { whiteSpace: "pre-wrap", lineHeight: "1.3" },
      },
      {
        headerName: "제작업체",
        field: "manufacturer",
        width: 80,
        cellClass: "text-center",
      },
      {
        headerName: "SHOT실적",
        field: "shotPerformance",
        width: 90,
        cellClass: "text-right",
      },
      {
        headerName: "실보관처",
        field: "actualStorage",
        width: 110,
        cellClass: "text-center",
      },
      {
        headerName: "사용상태",
        field: "usageStatus",
        width: 80,
        cellClass: "text-center",
      },
      {
        headerName: "진행단계",
        field: "progressStage",
        width: 90,
        cellStyle: { whiteSpace: "pre-wrap", lineHeight: "1.3" },
      },
      {
        headerName: "인수업체",
        field: "receivingCompany",
        width: 80,
        cellClass: "text-center",
      },
      {
        headerName: "변경일자",
        field: "changeDate",
        width: 100,
        cellStyle: { whiteSpace: "pre-wrap", lineHeight: "1.3" },
      },
      {
        headerName: "확인일자(구매담당자)",
        field: "confirmationDate",
        width: 140,
        cellClass: "text-center",
      },
      {
        headerName: "구매담당자",
        field: "purchaseManager",
        width: 100,
        cellClass: "text-center",
      },
    ],
    []
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  )

  // 금형코드 선택/해제 핸들러
  const handleMoldCodeToggle = (code: string) => {
    setSelectedMoldCodes((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    )
  }

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    let filtered = [...dummyData]

    if (factory !== "all") {
      filtered = filtered.filter((row) => row.factory === factory)
    }
    if (usageStatus !== "all") {
      filtered = filtered.filter((row) => row.usageStatus === usageStatus)
    }
    if (companyCode) {
      filtered = filtered.filter((row) =>
        row.companyCode.toLowerCase().includes(companyCode.toLowerCase())
      )
    }
    if (selectedMoldCodes.length > 0) {
      filtered = filtered.filter((row) =>
        selectedMoldCodes.includes(row.moldCode)
      )
    }
    if (partCode) {
      filtered = filtered.filter((row) =>
        row.partCode.toLowerCase().includes(partCode.toLowerCase())
      )
    }
    if (assetCode) {
      filtered = filtered.filter((row) =>
        row.assetCode.toLowerCase().includes(assetCode.toLowerCase())
      )
    }
    if (buyerCode) {
      filtered = filtered.filter((row) =>
        row.buyer.toLowerCase().includes(buyerCode.toLowerCase())
      )
    }
    if (moldStatus !== "all") {
      filtered = filtered.filter((row) => row.moldStatus === moldStatus)
    }
    if (progressStage !== "all") {
      filtered = filtered.filter((row) =>
        row.progressStage.includes(progressStage)
      )
    }

    setRowData(filtered)
    setDisplayCount(30) // 검색 시 페이징 초기화
  }, [
    factory,
    usageStatus,
    companyCode,
    selectedMoldCodes,
    partCode,
    assetCode,
    buyerCode,
    moldStatus,
    progressStage,
  ])

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 검색 필터 영역 */}
      <div className="flex flex-wrap items-start gap-3 rounded-md border bg-card p-3">
        {/* 공장 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">공장</label>
          <Select value={factory} onValueChange={(v) => v && setFactory(v)}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="1130">1130</SelectItem>
              <SelectItem value="1140">1140</SelectItem>
              <SelectItem value="1150">1150</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 사용상태 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">사용상태</label>
          <Select value={usageStatus} onValueChange={(v) => v && setUsageStatus(v)}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="양산">양산</SelectItem>
              <SelectItem value="개발">개발</SelectItem>
              <SelectItem value="폐기">폐기</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 업체코드 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">업체코드</label>
          <Input
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value)}
            placeholder="업체코드"
            className="h-8 w-24"
          />
        </div>

        {/* 금형코드 (멀티셀렉트 리스트) */}
        <div className="flex items-start gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap pt-1">금형코드</label>
          <div className="border rounded-md h-[72px] w-28 overflow-y-auto bg-background">
            {moldCodeList.map((code) => (
              <div
                key={code}
                className={`px-2 py-0.5 cursor-pointer text-sm hover:bg-muted ${
                  selectedMoldCodes.includes(code) ? "bg-blue-100" : ""
                }`}
                onClick={() => handleMoldCodeToggle(code)}
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        {/* 부품코드 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">부품코드</label>
          <Input
            value={partCode}
            onChange={(e) => setPartCode(e.target.value)}
            placeholder="부품코드"
            className="h-8 w-28"
          />
        </div>

        {/* 자산코드 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">자산코드</label>
          <Input
            value={assetCode}
            onChange={(e) => setAssetCode(e.target.value)}
            placeholder="자산코드"
            className="h-8 w-32"
          />
        </div>

        {/* 바이어코드 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">바이어코드</label>
          <Input
            value={buyerCode}
            onChange={(e) => setBuyerCode(e.target.value)}
            placeholder="바이어코드"
            className="h-8 w-24"
          />
        </div>

        {/* 금형상태 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">금형상태</label>
          <Select value={moldStatus} onValueChange={(v) => v && setMoldStatus(v)}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="양산">양산</SelectItem>
              <SelectItem value="REPEAT">REPEAT</SelectItem>
              <SelectItem value="개발">개발</SelectItem>
              <SelectItem value="폐기">폐기</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 이동반납여부 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">이동반납</label>
          <Select value={transferStatus} onValueChange={(v) => v && setTransferStatus(v)}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue placeholder="제외" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exclude">제외</SelectItem>
              <SelectItem value="include">포함</SelectItem>
              <SelectItem value="only">이동반납만</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 진행단계 */}
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">진행단계</label>
          <Select value={progressStage} onValueChange={(v) => v && setProgressStage(v)}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="속성등록">속성등록/변경완료</SelectItem>
              <SelectItem value="승인대기">승인대기</SelectItem>
              <SelectItem value="승인완료">승인완료</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* 툴바 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleSearch}
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="h-4 w-4" />
            조회
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => {}}
          >
            <HugeiconsIcon icon={FileExportIcon} strokeWidth={2} className="h-4 w-4" />
            엑셀
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => {}}
          >
            <HugeiconsIcon icon={PrinterIcon} strokeWidth={2} className="h-4 w-4" />
            인쇄
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => {}}
          >
            <HugeiconsIcon icon={SentIcon} strokeWidth={2} className="h-4 w-4" />
            내보내기
          </Button>
        </div>
      </div>

      {/* AG Grid */}
      <div className="ag-theme-alpine flex-1 w-full min-h-[400px]">
        <AgGridReact
          rowData={displayedData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          rowHeight={48}
          headerHeight={36}
          domLayout="autoHeight"
          suppressCellFocus={false}
        />
      </div>

      {/* 더보기 영역 */}
      <div className="flex items-center justify-between rounded-md border bg-card px-4 py-2.5">
        <span className="text-sm text-muted-foreground">
          {displayedData.length}건 / 전체 {rowData.length}건
        </span>
        {hasMore && (
          <Button variant="outline" size="sm" onClick={handleLoadMore}>
            더보기 ({remainingCount}건 남음)
          </Button>
        )}
      </div>
    </div>
  )
}
