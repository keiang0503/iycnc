"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, GridApi } from "ag-grid-community"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FileExportIcon,
  PrinterIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

ModuleRegistry.registerModules([AllCommunityModule])

// 더미 데이터 - 자산 위치/반출입 이력
const dummyData = [
  { assetNo: "MD2024001", moldCode: "M001", moldName: "프론트범퍼 금형", sequence: 1, category: "사출금형", transferCode: "TRF001", transferDate: "2024-01-15", partner: "(주)삼성협력", transferLocation: "A창고-1층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-01-15", approver: "김철수", approvalComment: "정상 입고 확인" },
  { assetNo: "MD2024002", moldCode: "M002", moldName: "리어범퍼 금형", sequence: 1, category: "사출금형", transferCode: "TRF002", transferDate: "2024-01-20", partner: "(주)현대협력", transferLocation: "B창고-2층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인완료", approvalDate: "2024-01-20", approver: "박영희", approvalComment: "품질검사 완료" },
  { assetNo: "MD2024001", moldCode: "M001", moldName: "프론트범퍼 금형", sequence: 2, category: "사출금형", transferCode: "TRF003", transferDate: "2024-02-10", partner: "(주)삼성협력", transferLocation: "외부-협력사", transferType: "반출", transferReason: "수리 의뢰", approvalStatus: "승인완료", approvalDate: "2024-02-10", approver: "김철수", approvalComment: "수리 후 반입 예정" },
  { assetNo: "MD2024003", moldCode: "M003", moldName: "사이드미러 금형", sequence: 1, category: "다이캐스팅", transferCode: "TRF004", transferDate: "2024-02-15", partner: "(주)LG협력", transferLocation: "A창고-2층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-02-15", approver: "이민수", approvalComment: "정상 입고" },
  { assetNo: "MD2024004", moldCode: "M004", moldName: "도어패널 금형", sequence: 1, category: "프레스금형", transferCode: "TRF005", transferDate: "2024-02-20", partner: "(주)기아협력", transferLocation: "C창고-1층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인대기", approvalDate: "", approver: "", approvalComment: "" },
  { assetNo: "MD2024005", moldCode: "M005", moldName: "헤드라이트 금형", sequence: 1, category: "사출금형", transferCode: "TRF006", transferDate: "2024-02-25", partner: "(주)삼성협력", transferLocation: "A창고-1층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인완료", approvalDate: "2024-02-25", approver: "김철수", approvalComment: "품질검사 완료" },
  { assetNo: "MD2024002", moldCode: "M002", moldName: "리어범퍼 금형", sequence: 2, category: "사출금형", transferCode: "TRF007", transferDate: "2024-03-01", partner: "(주)현대협력", transferLocation: "외부-협력사", transferType: "반출", transferReason: "금형 개선", approvalStatus: "승인완료", approvalDate: "2024-03-01", approver: "박영희", approvalComment: "개선 완료 후 반입" },
  { assetNo: "MD2024006", moldCode: "M006", moldName: "테일램프 금형", sequence: 1, category: "사출금형", transferCode: "TRF008", transferDate: "2024-03-05", partner: "(주)LG협력", transferLocation: "B창고-1층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-03-05", approver: "이민수", approvalComment: "정상 입고 확인" },
  { assetNo: "MD2024007", moldCode: "M007", moldName: "후드 금형", sequence: 1, category: "프레스금형", transferCode: "TRF009", transferDate: "2024-03-10", partner: "(주)기아협력", transferLocation: "D창고-1층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인거절", approvalDate: "2024-03-10", approver: "정우성", approvalComment: "품질 불량으로 반려" },
  { assetNo: "MD2024001", moldCode: "M001", moldName: "프론트범퍼 금형", sequence: 3, category: "사출금형", transferCode: "TRF010", transferDate: "2024-03-15", partner: "(주)삼성협력", transferLocation: "A창고-1층", transferType: "반입", transferReason: "수리 완료 입고", approvalStatus: "승인완료", approvalDate: "2024-03-15", approver: "김철수", approvalComment: "수리 후 정상 입고" },
  { assetNo: "MD2024008", moldCode: "M008", moldName: "펜더 금형", sequence: 1, category: "프레스금형", transferCode: "TRF011", transferDate: "2024-03-20", partner: "(주)현대협력", transferLocation: "C창고-2층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-03-20", approver: "박영희", approvalComment: "정상 입고" },
  { assetNo: "MD2024009", moldCode: "M009", moldName: "그릴 금형", sequence: 1, category: "사출금형", transferCode: "TRF012", transferDate: "2024-03-25", partner: "(주)삼성협력", transferLocation: "A창고-2층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인완료", approvalDate: "2024-03-25", approver: "김철수", approvalComment: "품질검사 완료" },
  { assetNo: "MD2024005", moldCode: "M005", moldName: "헤드라이트 금형", sequence: 2, category: "사출금형", transferCode: "TRF013", transferDate: "2024-04-01", partner: "(주)삼성협력", transferLocation: "외부-협력사", transferType: "반출", transferReason: "금형 수정", approvalStatus: "승인대기", approvalDate: "", approver: "", approvalComment: "" },
  { assetNo: "MD2024010", moldCode: "M010", moldName: "트렁크 금형", sequence: 1, category: "프레스금형", transferCode: "TRF014", transferDate: "2024-04-05", partner: "(주)기아협력", transferLocation: "D창고-2층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-04-05", approver: "정우성", approvalComment: "정상 입고 확인" },
  { assetNo: "MD2024011", moldCode: "M011", moldName: "대시보드 금형", sequence: 1, category: "사출금형", transferCode: "TRF015", transferDate: "2024-04-10", partner: "(주)LG협력", transferLocation: "B창고-2층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인완료", approvalDate: "2024-04-10", approver: "이민수", approvalComment: "품질검사 완료" },
  { assetNo: "MD2024003", moldCode: "M003", moldName: "사이드미러 금형", sequence: 2, category: "다이캐스팅", transferCode: "TRF016", transferDate: "2024-04-15", partner: "(주)LG협력", transferLocation: "외부-협력사", transferType: "반출", transferReason: "정기 점검", approvalStatus: "승인완료", approvalDate: "2024-04-15", approver: "이민수", approvalComment: "점검 후 반입 예정" },
  { assetNo: "MD2024012", moldCode: "M012", moldName: "콘솔박스 금형", sequence: 1, category: "사출금형", transferCode: "TRF017", transferDate: "2024-04-20", partner: "(주)삼성협력", transferLocation: "A창고-1층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-04-20", approver: "김철수", approvalComment: "정상 입고" },
  { assetNo: "MD2024013", moldCode: "M013", moldName: "시트프레임 금형", sequence: 1, category: "프레스금형", transferCode: "TRF018", transferDate: "2024-04-25", partner: "(주)현대협력", transferLocation: "C창고-1층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인완료", approvalDate: "2024-04-25", approver: "박영희", approvalComment: "품질검사 완료" },
  { assetNo: "MD2024014", moldCode: "M014", moldName: "도어핸들 금형", sequence: 1, category: "다이캐스팅", transferCode: "TRF019", transferDate: "2024-05-01", partner: "(주)기아협력", transferLocation: "D창고-1층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인대기", approvalDate: "", approver: "", approvalComment: "" },
  { assetNo: "MD2024002", moldCode: "M002", moldName: "리어범퍼 금형", sequence: 3, category: "사출금형", transferCode: "TRF020", transferDate: "2024-05-05", partner: "(주)현대협력", transferLocation: "B창고-2층", transferType: "반입", transferReason: "금형 개선 완료", approvalStatus: "승인완료", approvalDate: "2024-05-05", approver: "박영희", approvalComment: "개선 확인 완료" },
  { assetNo: "MD2024015", moldCode: "M015", moldName: "와이퍼암 금형", sequence: 1, category: "다이캐스팅", transferCode: "TRF021", transferDate: "2024-05-10", partner: "(주)LG협력", transferLocation: "B창고-1층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인완료", approvalDate: "2024-05-10", approver: "이민수", approvalComment: "정상 입고 확인" },
  { assetNo: "MD2024016", moldCode: "M016", moldName: "엔진커버 금형", sequence: 1, category: "사출금형", transferCode: "TRF022", transferDate: "2024-05-15", partner: "(주)삼성협력", transferLocation: "A창고-2층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-05-15", approver: "김철수", approvalComment: "품질검사 완료" },
  { assetNo: "MD2024006", moldCode: "M006", moldName: "테일램프 금형", sequence: 2, category: "사출금형", transferCode: "TRF023", transferDate: "2024-05-20", partner: "(주)LG협력", transferLocation: "외부-협력사", transferType: "반출", transferReason: "금형 보수", approvalStatus: "승인완료", approvalDate: "2024-05-20", approver: "이민수", approvalComment: "보수 완료 후 반입" },
  { assetNo: "MD2024017", moldCode: "M017", moldName: "에어덕트 금형", sequence: 1, category: "사출금형", transferCode: "TRF024", transferDate: "2024-05-25", partner: "(주)기아협력", transferLocation: "D창고-2층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인완료", approvalDate: "2024-05-25", approver: "정우성", approvalComment: "정상 입고" },
  { assetNo: "MD2024018", moldCode: "M018", moldName: "범퍼브라켓 금형", sequence: 1, category: "프레스금형", transferCode: "TRF025", transferDate: "2024-06-01", partner: "(주)현대협력", transferLocation: "C창고-2층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-06-01", approver: "박영희", approvalComment: "품질검사 완료" },
  { assetNo: "MD2024019", moldCode: "M019", moldName: "휠커버 금형", sequence: 1, category: "사출금형", transferCode: "TRF026", transferDate: "2024-06-05", partner: "(주)삼성협력", transferLocation: "A창고-1층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인거절", approvalDate: "2024-06-05", approver: "김철수", approvalComment: "도면 불일치로 반려" },
  { assetNo: "MD2024003", moldCode: "M003", moldName: "사이드미러 금형", sequence: 3, category: "다이캐스팅", transferCode: "TRF027", transferDate: "2024-06-10", partner: "(주)LG협력", transferLocation: "A창고-2층", transferType: "반입", transferReason: "정기 점검 완료", approvalStatus: "승인완료", approvalDate: "2024-06-10", approver: "이민수", approvalComment: "점검 확인 완료" },
  { assetNo: "MD2024020", moldCode: "M020", moldName: "도어트림 금형", sequence: 1, category: "사출금형", transferCode: "TRF028", transferDate: "2024-06-15", partner: "(주)기아협력", transferLocation: "D창고-1층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-06-15", approver: "정우성", approvalComment: "정상 입고 확인" },
  { assetNo: "MD2024021", moldCode: "M021", moldName: "센터콘솔 금형", sequence: 1, category: "사출금형", transferCode: "TRF029", transferDate: "2024-06-20", partner: "(주)LG협력", transferLocation: "B창고-2층", transferType: "반입", transferReason: "제품 생산용", approvalStatus: "승인대기", approvalDate: "", approver: "", approvalComment: "" },
  { assetNo: "MD2024022", moldCode: "M022", moldName: "루프레일 금형", sequence: 1, category: "프레스금형", transferCode: "TRF030", transferDate: "2024-06-25", partner: "(주)현대협력", transferLocation: "C창고-1층", transferType: "반입", transferReason: "신규 금형 입고", approvalStatus: "승인완료", approvalDate: "2024-06-25", approver: "박영희", approvalComment: "품질검사 완료" },
]

// 자산 상세 정보 팝업용 더미 데이터
const assetDetailData = [
  { id: 1, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "프론트범퍼 금형 A-Type", acquisitionDate: "2024-01-15", usefulYears: 5, manageDept: "생산1팀", operationLocation: "A창고-1층", acquisitionType: "구매", acquisitionCost: 150000000, offBalanceSheet: "N" },
  { id: 2, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "프론트범퍼 금형 B-Type", acquisitionDate: "2024-01-20", usefulYears: 5, manageDept: "생산1팀", operationLocation: "A창고-1층", acquisitionType: "구매", acquisitionCost: 145000000, offBalanceSheet: "N" },
  { id: 3, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "리어범퍼 금형 A-Type", acquisitionDate: "2024-01-20", usefulYears: 5, manageDept: "생산1팀", operationLocation: "B창고-2층", acquisitionType: "구매", acquisitionCost: 160000000, offBalanceSheet: "N" },
  { id: 4, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "리어범퍼 금형 B-Type", acquisitionDate: "2024-02-01", usefulYears: 5, manageDept: "생산1팀", operationLocation: "B창고-2층", acquisitionType: "구매", acquisitionCost: 155000000, offBalanceSheet: "N" },
  { id: 5, majorCategory: "생산설비", midCategory: "금형", minorCategory: "다이캐스팅", assetName: "사이드미러 금형 L", acquisitionDate: "2024-02-15", usefulYears: 7, manageDept: "생산2팀", operationLocation: "A창고-2층", acquisitionType: "구매", acquisitionCost: 85000000, offBalanceSheet: "N" },
  { id: 6, majorCategory: "생산설비", midCategory: "금형", minorCategory: "다이캐스팅", assetName: "사이드미러 금형 R", acquisitionDate: "2024-02-15", usefulYears: 7, manageDept: "생산2팀", operationLocation: "A창고-2층", acquisitionType: "구매", acquisitionCost: 85000000, offBalanceSheet: "N" },
  { id: 7, majorCategory: "생산설비", midCategory: "금형", minorCategory: "프레스금형", assetName: "도어패널 금형 LH", acquisitionDate: "2024-02-20", usefulYears: 10, manageDept: "생산3팀", operationLocation: "C창고-1층", acquisitionType: "임대", acquisitionCost: 200000000, offBalanceSheet: "Y" },
  { id: 8, majorCategory: "생산설비", midCategory: "금형", minorCategory: "프레스금형", assetName: "도어패널 금형 RH", acquisitionDate: "2024-02-20", usefulYears: 10, manageDept: "생산3팀", operationLocation: "C창고-1층", acquisitionType: "임대", acquisitionCost: 200000000, offBalanceSheet: "Y" },
  { id: 9, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "헤드라이트 금형 L", acquisitionDate: "2024-02-25", usefulYears: 5, manageDept: "생산1팀", operationLocation: "A창고-1층", acquisitionType: "구매", acquisitionCost: 120000000, offBalanceSheet: "N" },
  { id: 10, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "헤드라이트 금형 R", acquisitionDate: "2024-02-25", usefulYears: 5, manageDept: "생산1팀", operationLocation: "A창고-1층", acquisitionType: "구매", acquisitionCost: 120000000, offBalanceSheet: "N" },
  { id: 11, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "테일램프 금형 L", acquisitionDate: "2024-03-05", usefulYears: 5, manageDept: "생산2팀", operationLocation: "B창고-1층", acquisitionType: "구매", acquisitionCost: 95000000, offBalanceSheet: "N" },
  { id: 12, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "테일램프 금형 R", acquisitionDate: "2024-03-05", usefulYears: 5, manageDept: "생산2팀", operationLocation: "B창고-1층", acquisitionType: "구매", acquisitionCost: 95000000, offBalanceSheet: "N" },
  { id: 13, majorCategory: "생산설비", midCategory: "금형", minorCategory: "프레스금형", assetName: "후드 금형 Main", acquisitionDate: "2024-03-10", usefulYears: 10, manageDept: "생산3팀", operationLocation: "D창고-1층", acquisitionType: "구매", acquisitionCost: 280000000, offBalanceSheet: "N" },
  { id: 14, majorCategory: "생산설비", midCategory: "금형", minorCategory: "프레스금형", assetName: "펜더 금형 LH", acquisitionDate: "2024-03-20", usefulYears: 10, manageDept: "생산3팀", operationLocation: "C창고-2층", acquisitionType: "구매", acquisitionCost: 180000000, offBalanceSheet: "N" },
  { id: 15, majorCategory: "생산설비", midCategory: "금형", minorCategory: "프레스금형", assetName: "펜더 금형 RH", acquisitionDate: "2024-03-20", usefulYears: 10, manageDept: "생산3팀", operationLocation: "C창고-2층", acquisitionType: "구매", acquisitionCost: 180000000, offBalanceSheet: "N" },
  { id: 16, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "그릴 금형 Upper", acquisitionDate: "2024-03-25", usefulYears: 5, manageDept: "생산1팀", operationLocation: "A창고-2층", acquisitionType: "구매", acquisitionCost: 75000000, offBalanceSheet: "N" },
  { id: 17, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "그릴 금형 Lower", acquisitionDate: "2024-03-25", usefulYears: 5, manageDept: "생산1팀", operationLocation: "A창고-2층", acquisitionType: "구매", acquisitionCost: 70000000, offBalanceSheet: "N" },
  { id: 18, majorCategory: "생산설비", midCategory: "금형", minorCategory: "프레스금형", assetName: "트렁크 금형 Main", acquisitionDate: "2024-04-05", usefulYears: 10, manageDept: "생산3팀", operationLocation: "D창고-2층", acquisitionType: "구매", acquisitionCost: 250000000, offBalanceSheet: "N" },
  { id: 19, majorCategory: "생산설비", midCategory: "금형", minorCategory: "사출금형", assetName: "대시보드 금형 Main", acquisitionDate: "2024-04-10", usefulYears: 7, manageDept: "생산2팀", operationLocation: "B창고-2층", acquisitionType: "구매", acquisitionCost: 320000000, offBalanceSheet: "N" },
  { id: 20, majorCategory: "생산설비", midCategory: "금형", minorCategory: "다이캐스팅", assetName: "도어핸들 금형 Set", acquisitionDate: "2024-05-01", usefulYears: 7, manageDept: "생산2팀", operationLocation: "D창고-1층", acquisitionType: "임대", acquisitionCost: 65000000, offBalanceSheet: "Y" },
]

// 자산 선택용 더미 데이터
const assetSelectionData = [
  { assetNo: "MD2024001", moldCode: "M001", moldName: "프론트범퍼 금형", category: "사출금형" },
  { assetNo: "MD2024002", moldCode: "M002", moldName: "리어범퍼 금형", category: "사출금형" },
  { assetNo: "MD2024003", moldCode: "M003", moldName: "사이드미러 금형", category: "다이캐스팅" },
  { assetNo: "MD2024004", moldCode: "M004", moldName: "도어패널 금형", category: "프레스금형" },
  { assetNo: "MD2024005", moldCode: "M005", moldName: "헤드라이트 금형", category: "사출금형" },
  { assetNo: "MD2024006", moldCode: "M006", moldName: "테일램프 금형", category: "사출금형" },
  { assetNo: "MD2024007", moldCode: "M007", moldName: "후드 금형", category: "프레스금형" },
  { assetNo: "MD2024008", moldCode: "M008", moldName: "펜더 금형", category: "프레스금형" },
  { assetNo: "MD2024009", moldCode: "M009", moldName: "그릴 금형", category: "사출금형" },
  { assetNo: "MD2024010", moldCode: "M010", moldName: "트렁크 금형", category: "프레스금형" },
]

const PAGE_SIZE = 30

export default function AssetLocationInquiryPage() {
  const gridRef = useRef<AgGridReact>(null)
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [rowData] = useState(dummyData)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  // 검색 필터 상태
  const [assetNo, setAssetNo] = useState("")
  const [moldCode, setMoldCode] = useState("")
  const [moldName, setMoldName] = useState("")
  const [approvalStatus, setApprovalStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [transferDateFrom, setTransferDateFrom] = useState("")
  const [transferDateTo, setTransferDateTo] = useState("")
  const [partner, setPartner] = useState("")
  const [transferType, setTransferType] = useState("all")

  // 자산 선택 팝업 상태
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)
  const [assetSearchKeyword, setAssetSearchKeyword] = useState("")

  // 금형 자산 상세 팝업 상태
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedMoldName, setSelectedMoldName] = useState("")
  const [detailDisplayCount, setDetailDisplayCount] = useState(10)

  // 상세 팝업 검색 필터
  const [detailMajorCategory, setDetailMajorCategory] = useState("all")
  const [detailMinorCategory, setDetailMinorCategory] = useState("all")
  const [detailAssetName, setDetailAssetName] = useState("")
  const [detailManageDept, setDetailManageDept] = useState("all")
  const [detailOffBalanceSheet, setDetailOffBalanceSheet] = useState("all")

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
  }, [])

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "자산번호",
        field: "assetNo",
        width: 120,
        cellClass: "text-center",
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
        width: 180,
        flex: 1,
        cellRenderer: (params: { value: string }) => (
          <span
            className="text-blue-600 underline cursor-pointer hover:text-blue-800"
            onClick={() => handleMoldNameClick(params.value)}
          >
            {params.value}
          </span>
        ),
      },
      {
        headerName: "차수",
        field: "sequence",
        width: 70,
        cellClass: "text-center",
      },
      {
        headerName: "구분",
        field: "category",
        width: 100,
        cellClass: "text-center",
      },
      {
        headerName: "반출입코드",
        field: "transferCode",
        width: 110,
        cellClass: "text-center",
      },
      {
        headerName: "반출입일",
        field: "transferDate",
        width: 110,
        cellClass: "text-center",
      },
      {
        headerName: "협력회사",
        field: "partner",
        width: 130,
      },
      {
        headerName: "반입위치",
        field: "transferLocation",
        width: 120,
      },
      {
        headerName: "반출입구분",
        field: "transferType",
        width: 100,
        cellClass: "text-center",
        cellStyle: (params) => {
          if (params.value === "반출") {
            return { color: "#ef4444" }
          }
          if (params.value === "반입") {
            return { color: "#22c55e" }
          }
          return null
        },
      },
      {
        headerName: "반출입사유",
        field: "transferReason",
        width: 150,
      },
      {
        headerName: "승인상태",
        field: "approvalStatus",
        width: 100,
        cellClass: "text-center",
        cellStyle: (params) => {
          if (params.value === "승인완료") {
            return { color: "#22c55e" }
          }
          if (params.value === "승인거절") {
            return { color: "#ef4444" }
          }
          if (params.value === "승인대기") {
            return { color: "#f59e0b" }
          }
          return null
        },
      },
      {
        headerName: "승인일",
        field: "approvalDate",
        width: 110,
        cellClass: "text-center",
      },
      {
        headerName: "승인자",
        field: "approver",
        width: 90,
        cellClass: "text-center",
      },
      {
        headerName: "승인의견",
        field: "approvalComment",
        width: 180,
        flex: 1,
      },
    ],
    []
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      suppressMovable: true,
    }),
    []
  )

  const handleSearch = () => {
    console.log("검색 실행", {
      assetNo,
      moldCode,
      moldName,
      approvalStatus,
      category,
      transferDateFrom,
      transferDateTo,
      partner,
      transferType,
    })
  }

  const handleExportExcel = () => {
    gridApi?.exportDataAsExcel({
      fileName: "자산위치조회.xlsx",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, rowData.length))
  }

  // 자산 선택 팝업에서 자산 선택
  const handleSelectAsset = (asset: typeof assetSelectionData[0]) => {
    setAssetNo(asset.assetNo)
    setMoldCode(asset.moldCode)
    setMoldName(asset.moldName)
    setIsAssetDialogOpen(false)
    setAssetSearchKeyword("")
  }

  // 금형명 클릭 핸들러
  const handleMoldNameClick = (moldName: string) => {
    setSelectedMoldName(moldName)
    setIsDetailDialogOpen(true)
    setDetailDisplayCount(10)
    // 필터 초기화
    setDetailMajorCategory("all")
    setDetailMinorCategory("all")
    setDetailAssetName("")
    setDetailManageDept("all")
    setDetailOffBalanceSheet("all")
  }

  // 상세 팝업 검색 핸들러
  const handleDetailSearch = () => {
    setDetailDisplayCount(10) // 검색 시 페이지 초기화
  }

  // 상세 팝업 더보기 핸들러
  const handleDetailLoadMore = () => {
    setDetailDisplayCount((prev) => Math.min(prev + 10, filteredDetailData.length))
  }

  // 상세 팝업 닫기 핸들러
  const handleDetailClose = () => {
    setIsDetailDialogOpen(false)
    setSelectedMoldName("")
  }

  // 상세 팝업 필터링된 데이터
  const filteredDetailData = useMemo(() => {
    return assetDetailData.filter((item) => {
      if (detailMajorCategory !== "all" && item.majorCategory !== detailMajorCategory) return false
      if (detailMinorCategory !== "all" && item.minorCategory !== detailMinorCategory) return false
      if (detailAssetName && !item.assetName.toLowerCase().includes(detailAssetName.toLowerCase())) return false
      if (detailManageDept !== "all" && item.manageDept !== detailManageDept) return false
      if (detailOffBalanceSheet !== "all" && item.offBalanceSheet !== detailOffBalanceSheet) return false
      return true
    })
  }, [detailMajorCategory, detailMinorCategory, detailAssetName, detailManageDept, detailOffBalanceSheet])

  const displayedDetailData = filteredDetailData.slice(0, detailDisplayCount)
  const hasMoreDetail = detailDisplayCount < filteredDetailData.length

  // 자산 선택 팝업 필터링된 데이터
  const filteredAssetData = assetSelectionData.filter((asset) => {
    if (!assetSearchKeyword) return true
    const keyword = assetSearchKeyword.toLowerCase()
    return (
      asset.assetNo.toLowerCase().includes(keyword) ||
      asset.moldCode.toLowerCase().includes(keyword) ||
      asset.moldName.toLowerCase().includes(keyword)
    )
  })

  const displayedData = rowData.slice(0, displayCount)
  const hasMore = displayCount < rowData.length

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 상단 검색 영역 */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card p-3">
        {/* 자산번호 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">자산번호</label>
          <Input
            value={assetNo}
            onChange={(e) => setAssetNo(e.target.value)}
            className="w-[120px]"
            placeholder="자산번호"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setIsAssetDialogOpen(true)}
          >
            선택
          </Button>
        </div>

        {/* 금형코드 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">금형코드</label>
          <Input
            value={moldCode}
            onChange={(e) => setMoldCode(e.target.value)}
            className="w-[100px]"
            placeholder="금형코드"
          />
        </div>

        {/* 금형명 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">금형명</label>
          <Input
            value={moldName}
            onChange={(e) => setMoldName(e.target.value)}
            className="w-[150px]"
            placeholder="금형명"
          />
        </div>

        {/* 승인상태 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">승인상태</label>
          <Select value={approvalStatus} onValueChange={(v) => setApprovalStatus(v ?? "all")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="pending">승인대기</SelectItem>
              <SelectItem value="approved">승인완료</SelectItem>
              <SelectItem value="rejected">승인거절</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 구분 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">구분</label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="injection">사출금형</SelectItem>
              <SelectItem value="press">프레스금형</SelectItem>
              <SelectItem value="diecasting">다이캐스팅</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 반출입일 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">반출입일</label>
          <Input
            type="date"
            value={transferDateFrom}
            onChange={(e) => setTransferDateFrom(e.target.value)}
            className="w-[140px]"
          />
          <span className="text-muted-foreground">~</span>
          <Input
            type="date"
            value={transferDateTo}
            onChange={(e) => setTransferDateTo(e.target.value)}
            className="w-[140px]"
          />
        </div>

        {/* 협력회사 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">협력회사</label>
          <Input
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
            className="w-[140px]"
            placeholder="협력회사명"
          />
        </div>

        {/* 반출입구분 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">반출입구분</label>
          <Select value={transferType} onValueChange={(v) => setTransferType(v ?? "all")}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="in">반입</SelectItem>
              <SelectItem value="out">반출</SelectItem>
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
            onClick={handleExportExcel}
          >
            <HugeiconsIcon icon={FileExportIcon} strokeWidth={2} className="h-4 w-4" />
            엑셀
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handlePrint}
          >
            <HugeiconsIcon icon={PrinterIcon} strokeWidth={2} className="h-4 w-4" />
            인쇄
          </Button>
        </div>
      </div>

      {/* 데이터 그리드 */}
      <div className="ag-theme-alpine flex-1" style={{ minHeight: 500 }}>
        <AgGridReact
          ref={gridRef}
          rowData={displayedData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          rowSelection="single"
          headerHeight={36}
          rowHeight={32}
          domLayout="autoHeight"
          suppressCellFocus={false}
        />
      </div>

      {/* 더보기 영역 */}
      <div className="flex items-center justify-between rounded-md border bg-card px-4 py-2.5">
        <span className="text-sm text-muted-foreground">
          {displayedData.length} / {rowData.length}건
        </span>
        {hasMore && (
          <Button variant="outline" size="sm" onClick={handleLoadMore}>
            더보기
          </Button>
        )}
      </div>

      {/* 자산 선택 팝업 */}
      <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
        <DialogContent className="max-w-2xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>자산 선택</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {/* 검색 입력 */}
            <div className="flex items-center gap-2">
              <Input
                value={assetSearchKeyword}
                onChange={(e) => setAssetSearchKeyword(e.target.value)}
                placeholder="자산번호, 금형코드, 금형명으로 검색"
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="h-4 w-4" />
              </Button>
            </div>

            {/* 자산 목록 */}
            <div className="max-h-[400px] overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">자산번호</th>
                    <th className="px-3 py-2 text-left font-medium">금형코드</th>
                    <th className="px-3 py-2 text-left font-medium">금형명</th>
                    <th className="px-3 py-2 text-left font-medium">구분</th>
                    <th className="px-3 py-2 text-center font-medium">선택</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssetData.map((asset) => (
                    <tr
                      key={asset.assetNo}
                      className="border-t hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSelectAsset(asset)}
                    >
                      <td className="px-3 py-2">{asset.assetNo}</td>
                      <td className="px-3 py-2">{asset.moldCode}</td>
                      <td className="px-3 py-2">{asset.moldName}</td>
                      <td className="px-3 py-2">{asset.category}</td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectAsset(asset)
                          }}
                        >
                          선택
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 금형 자산 상세 팝업 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] w-[95vw] h-auto max-h-[90vh] p-0 flex flex-col [&>button]:hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <DialogTitle className="text-lg font-semibold">
              {selectedMoldName} - 자산 상세
            </DialogTitle>
            <button
              onClick={handleDetailClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
              <span className="sr-only">닫기</span>
            </button>
          </div>

          {/* 검색 필터 영역 */}
          <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
            {/* 대분류 */}
            <div className="flex items-center gap-2">
              <label className="min-w-fit text-sm font-medium">대분류</label>
              <Select value={detailMajorCategory} onValueChange={(v) => setDetailMajorCategory(v ?? "all")}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="생산설비">생산설비</SelectItem>
                  <SelectItem value="검사설비">검사설비</SelectItem>
                  <SelectItem value="물류설비">물류설비</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 소분류 */}
            <div className="flex items-center gap-2">
              <label className="min-w-fit text-sm font-medium">소분류</label>
              <Select value={detailMinorCategory} onValueChange={(v) => setDetailMinorCategory(v ?? "all")}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="사출금형">사출금형</SelectItem>
                  <SelectItem value="프레스금형">프레스금형</SelectItem>
                  <SelectItem value="다이캐스팅">다이캐스팅</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 자산명 */}
            <div className="flex items-center gap-2">
              <label className="min-w-fit text-sm font-medium">자산명</label>
              <Input
                value={detailAssetName}
                onChange={(e) => setDetailAssetName(e.target.value)}
                className="w-[150px] h-8"
                placeholder="자산명"
              />
            </div>

            {/* 관리부점 */}
            <div className="flex items-center gap-2">
              <label className="min-w-fit text-sm font-medium">관리부점</label>
              <Select value={detailManageDept} onValueChange={(v) => setDetailManageDept(v ?? "all")}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="생산1팀">생산1팀</SelectItem>
                  <SelectItem value="생산2팀">생산2팀</SelectItem>
                  <SelectItem value="생산3팀">생산3팀</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 부외자산여부 */}
            <div className="flex items-center gap-2">
              <label className="min-w-fit text-sm font-medium">부외자산</label>
              <Select value={detailOffBalanceSheet} onValueChange={(v) => setDetailOffBalanceSheet(v ?? "all")}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="Y">Y</SelectItem>
                  <SelectItem value="N">N</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 조회 버튼 */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleDetailSearch}
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="h-4 w-4" />
              조회
            </Button>
          </div>

          {/* 테이블 영역 */}
          <div className="flex-1 overflow-auto px-4 py-3">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/40">
                  <tr>
                    <th className="px-3 py-2.5 text-center font-medium border-b whitespace-nowrap">대분류</th>
                    <th className="px-3 py-2.5 text-center font-medium border-b whitespace-nowrap">종분류</th>
                    <th className="px-3 py-2.5 text-center font-medium border-b whitespace-nowrap">소분류</th>
                    <th className="px-3 py-2.5 text-left font-medium border-b whitespace-nowrap">자산명</th>
                    <th className="px-3 py-2.5 text-center font-medium border-b whitespace-nowrap">취득일자</th>
                    <th className="px-3 py-2.5 text-center font-medium border-b whitespace-nowrap">내용년수</th>
                    <th className="px-3 py-2.5 text-center font-medium border-b whitespace-nowrap">관리부점</th>
                    <th className="px-3 py-2.5 text-left font-medium border-b whitespace-nowrap">운용위치</th>
                    <th className="px-3 py-2.5 text-center font-medium border-b whitespace-nowrap">취득구분</th>
                    <th className="px-3 py-2.5 text-right font-medium border-b whitespace-nowrap">취득원가</th>
                    <th className="px-3 py-2.5 text-center font-medium border-b whitespace-nowrap">부외자산여부</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedDetailData.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-3 py-8 text-center text-muted-foreground">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    displayedDetailData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 text-center">{item.majorCategory}</td>
                        <td className="px-3 py-2 text-center">{item.midCategory}</td>
                        <td className="px-3 py-2 text-center">{item.minorCategory}</td>
                        <td className="px-3 py-2">{item.assetName}</td>
                        <td className="px-3 py-2 text-center">{item.acquisitionDate}</td>
                        <td className="px-3 py-2 text-center">{item.usefulYears}년</td>
                        <td className="px-3 py-2 text-center">{item.manageDept}</td>
                        <td className="px-3 py-2">{item.operationLocation}</td>
                        <td className="px-3 py-2 text-center">{item.acquisitionType}</td>
                        <td className="px-3 py-2 text-right">{item.acquisitionCost.toLocaleString()}원</td>
                        <td className="px-3 py-2 text-center">
                          <span className={item.offBalanceSheet === "Y" ? "text-amber-600" : ""}>
                            {item.offBalanceSheet}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 하단 영역 */}
          <div className="flex items-center justify-between border-t px-4 py-2.5">
            <span className="text-sm text-muted-foreground">
              {displayedDetailData.length}건 / 전체 {filteredDetailData.length}건
            </span>
            <div className="flex items-center gap-2">
              {hasMoreDetail && (
                <Button variant="outline" size="sm" onClick={handleDetailLoadMore}>
                  더보기
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDetailClose}>
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
