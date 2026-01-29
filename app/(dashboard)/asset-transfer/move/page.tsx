"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import { ColDef, ColGroupDef, CellValueChangedEvent, ModuleRegistry, AllCommunityModule } from "ag-grid-community"

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule])
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FloppyDiskIcon,
  FileExportIcon,
  PrinterIcon,
  SentIcon,
  MoreHorizontalIcon,
  Cancel01Icon,
  Add01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// 페이지 사이즈 상수
const PAGE_SIZE = 30
const POPUP_PAGE_SIZE = 20

// 더미 데이터 타입 정의
interface AssetTransferData {
  id: string
  assetCode: string
  assetName: string
  spec: string
  acquireDate: string
  bookValue: number
  // 현재 정보
  currentCorpCode: string
  currentCorpName: string
  currentDeptCode: string
  currentDeptName: string
  currentLocation: string
  currentUser: string
  // 이동 정보 (편집 가능)
  transferCorpCode: string
  transferCorpName: string
  transferDeptCode: string
  transferDeptName: string
  transferLocation: string
  transferUser: string
  transferDate: string
  transferReason: string
}

interface CorpData {
  code: string
  name: string
}

interface DeptData {
  code: string
  name: string
  corpCode: string
}

interface AssetPopupData {
  code: string
  name: string
  spec: string
}

// 자산정보 팝업용 인터페이스 (참조 이미지 기준 확장)
interface AssetInfoDetailData {
  // 그리드용 필드
  assetNo: string                    // 자산번호
  assetName: string                  // 자산명칭
  assetCodeName: string              // 자산코드명
  itemName: string                   // 품목명
  acquireDate: string                // 취득일자
  acquireAmount: number              // 취득금액
  currentDept: string                // (현)보유부서
  currentDept1: string               // (현)보유부서1

  // 기본정보 필드
  assetCode: string                  // 자산코드
  assetCodeDesc: string              // 자산코드 설명 (예: 차량운반구)
  itemCode: string                   // 품목코드
  itemCodeDesc: string               // 품목코드 설명 (예: 승용차)
  detailCode: string                 // 세목코드
  fiscalYear: string                 // 회계년도
  depreciationMethod: string         // 상각방법
  acquireVoucherNo: string           // 취득전표번호

  // 취득정보 필드
  acquireDeptCode: string            // 취득부서코드
  acquireVendorCode: string          // 취득거래처코드
  acquireStatus: string              // 취득상태
  acquireQty: string                 // 취득수량
  acquireUnit: string                // 단위
  usefulLife: string                 // 내용년수
  evidenceYn: string                 // 증빙여부
  accountCode: string                // 계정코드(차금)
  designationYn: string              // 지정여부
  manageDeptCode: string             // 관리부서코드
  managerIdMain: string              // 관리자ID(정)
  managerIdSub: string               // 관리자ID(부)
  assetStatus: string                // 자산상태
  inspectionDate: string             // 조사일자
  managementNo: string               // 관리번호
  spec: string                       // 규격
  summary: string                    // 적요사항
  memo: string                       // 비고
}

// 금형이동 요청서 인터페이스
interface MoldTransferRequestData {
  id: string
  moldCode: string           // 금형코드
  moldName: string           // 금형명
  factory: string            // 공장
  moldStatus: string         // 금형상태
  modelName: string          // 모델명
  partCode: string           // 부품코드
  partName: string           // 부품명
  warrantyShot: number       // 보증SHOT
  actualShot: number         // SHOT실적
  storageLocation: string    // 실보관처
  useStatus: string          // 사용상태
}

// 인수업체 인터페이스
interface ReceiverCompanyData {
  code: string
  name: string
  address: string
  contact: string
}

// 구매담당자 인터페이스
interface PurchaseManagerData {
  code: string
  name: string
  department: string
  contact: string
}

// 금형이동 요청서 더미 데이터
const dummyMoldTransferData: MoldTransferRequestData[] = [
  { id: "1", moldCode: "M-2024-001", moldName: "범퍼 사출금형", factory: "화성공장", moldStatus: "정상", modelName: "아반떼 CN7", partCode: "86511-AA000", partName: "프론트 범퍼", warrantyShot: 500000, actualShot: 125000, storageLocation: "A동 1층", useStatus: "가동중" },
  { id: "2", moldCode: "M-2024-002", moldName: "도어트림 금형", factory: "울산공장", moldStatus: "정상", modelName: "쏘나타 DN8", partCode: "82310-L1000", partName: "도어 트림 LH", warrantyShot: 400000, actualShot: 89000, storageLocation: "B동 2층", useStatus: "가동중" },
  { id: "3", moldCode: "M-2023-015", moldName: "헤드램프 하우징 금형", factory: "아산공장", moldStatus: "점검중", modelName: "그랜저 GN7", partCode: "92101-M9000", partName: "헤드램프 하우징 RH", warrantyShot: 300000, actualShot: 245000, storageLocation: "C동 1층", useStatus: "점검중" },
  { id: "4", moldCode: "M-2023-022", moldName: "대시보드 금형", factory: "화성공장", moldStatus: "정상", modelName: "K5 DL3", partCode: "84710-L2000", partName: "대시보드 어셈블리", warrantyShot: 350000, actualShot: 156000, storageLocation: "A동 2층", useStatus: "가동중" },
  { id: "5", moldCode: "M-2022-008", moldName: "사이드미러 커버 금형", factory: "울산공장", moldStatus: "수리필요", modelName: "투싼 NX4", partCode: "87616-N9000", partName: "사이드미러 커버 LH", warrantyShot: 600000, actualShot: 520000, storageLocation: "D동 1층", useStatus: "대기중" },
]

// 인수업체 더미 데이터
const dummyReceiverCompanyData: ReceiverCompanyData[] = [
  { code: "RC001", name: "현대모비스(주)", address: "경기도 용인시 기흥구 덕영대로 2160", contact: "031-596-1234" },
  { code: "RC002", name: "현대위아(주)", address: "경남 창원시 성산구 공단로 462", contact: "055-280-5678" },
  { code: "RC003", name: "만도(주)", address: "경기도 평택시 모곡산단로 30", contact: "031-8080-1234" },
  { code: "RC004", name: "현대트랜시스(주)", address: "울산시 북구 산업로 677", contact: "052-280-3456" },
  { code: "RC005", name: "현대케피코(주)", address: "대구시 달성군 구지면 국가산단대로 54길 40", contact: "053-610-7890" },
]

// 구매담당자 더미 데이터
const dummyPurchaseManagerData: PurchaseManagerData[] = [
  { code: "PM001", name: "김철수", department: "구매1팀", contact: "010-1234-5678" },
  { code: "PM002", name: "이영희", department: "구매2팀", contact: "010-2345-6789" },
  { code: "PM003", name: "박민수", department: "구매1팀", contact: "010-3456-7890" },
  { code: "PM004", name: "정수진", department: "구매3팀", contact: "010-4567-8901" },
  { code: "PM005", name: "최동현", department: "구매2팀", contact: "010-5678-9012" },
]

// 더미 데이터 - 50개의 자동차 부품 자산 이동 데이터
const dummyAssetData: AssetTransferData[] = [
  // 엔진 부품 (10개)
  { id: "1", assetCode: "EN00001", assetName: "피스톤 세트", spec: "현대 2.0L GDi/STD/4기통", acquireDate: "2024-01-15", bookValue: 450000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D001", currentDeptName: "총무팀", currentLocation: "본사 창고 A-12", currentUser: "김부품", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D011", transferDeptName: "서울영업1팀", transferLocation: "서울지사 창고", transferUser: "박서울", transferDate: "2024-04-01", transferReason: "서울지사 재고 보충" },
  { id: "2", assetCode: "EN00002", assetName: "실린더 헤드", spec: "기아 1.6T/알루미늄/16밸브", acquireDate: "2023-03-20", bookValue: 850000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D002", currentDeptName: "영업팀", currentLocation: "본사 창고 B-05", currentUser: "이영업", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산지사 창고", transferUser: "김부산", transferDate: "2024-04-15", transferReason: "부산 고객사 납품용" },
  { id: "3", assetCode: "EN00003", assetName: "크랭크샤프트", spec: "르노삼성 2.0D/단조강/5베어링", acquireDate: "2023-05-10", bookValue: 1200000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D002", currentDeptName: "영업팀", currentLocation: "본사 창고 B-06", currentUser: "박영업", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D003", transferDeptName: "생산팀", transferLocation: "공장동 A 창고", transferUser: "정생산", transferDate: "2024-03-20", transferReason: "생산라인 투입용" },
  { id: "4", assetCode: "EN00004", assetName: "캠샤프트", spec: "현대 1.6 GDi/DOHC/흡기측", acquireDate: "2022-07-25", bookValue: 380000, currentCorpCode: "C002", currentCorpName: "서울지사", currentDeptCode: "D011", currentDeptName: "서울영업1팀", currentLocation: "서울지사 창고 1층", currentUser: "최서울", transferCorpCode: "C004", transferCorpName: "대전지사", transferDeptCode: "D031", transferDeptName: "대전영업팀", transferLocation: "대전지사 창고", transferUser: "윤대전", transferDate: "2024-05-01", transferReason: "대전지사 신규배치" },
  { id: "5", assetCode: "EN00005", assetName: "밸브 세트", spec: "기아 2.5 GDi/흡배기세트/16개", acquireDate: "2024-02-28", bookValue: 280000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D003", currentDeptName: "생산팀", currentLocation: "공장동 A 창고", currentUser: "정생산", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D004", transferDeptName: "물류팀", transferLocation: "물류센터 창고", transferUser: "김물류", transferDate: "2024-04-10", transferReason: "물류센터 배송 대기" },
  { id: "6", assetCode: "EN00006", assetName: "타이밍 체인", spec: "현대 3.3 GDi/이중체인/가이드포함", acquireDate: "2023-08-15", bookValue: 320000, currentCorpCode: "C003", currentCorpName: "부산지사", currentDeptCode: "D021", currentDeptName: "부산영업팀", currentLocation: "부산지사 창고", currentUser: "강부산", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D001", transferDeptName: "총무팀", transferLocation: "본사 창고", transferUser: "한총무", transferDate: "2024-03-25", transferReason: "본사 재고 통합" },
  { id: "7", assetCode: "EN00007", assetName: "오일펌프", spec: "기아 2.2D/로터리타입/가변용량", acquireDate: "2022-11-20", bookValue: 420000, currentCorpCode: "C004", currentCorpName: "대전지사", currentDeptCode: "D031", currentDeptName: "대전영업팀", currentLocation: "대전지사 창고", currentUser: "윤대전", transferCorpCode: "C005", transferCorpName: "광주지사", transferDeptCode: "D041", transferDeptName: "광주영업팀", transferLocation: "광주지사 창고", transferUser: "조광주", transferDate: "2024-04-20", transferReason: "광주지사 재고 보강" },
  { id: "8", assetCode: "EN00008", assetName: "워터펌프", spec: "현대 2.0T/전자식/베어링포함", acquireDate: "2023-04-05", bookValue: 280000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D001", currentDeptName: "총무팀", currentLocation: "본사 창고 A-01", currentUser: "한경영", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D012", transferDeptName: "서울영업2팀", transferLocation: "서울지사 창고", transferUser: "이서울", transferDate: "2024-05-10", transferReason: "서울 긴급 출고용" },
  { id: "9", assetCode: "EN00009", assetName: "연료 인젝터", spec: "기아 1.6T/GDi/고압타입", acquireDate: "2024-03-12", bookValue: 180000, currentCorpCode: "C005", currentCorpName: "광주지사", currentDeptCode: "D041", currentDeptName: "광주영업팀", currentLocation: "광주지사 창고", currentUser: "조광주", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산지사 창고", transferUser: "강부산", transferDate: "2024-04-05", transferReason: "부산 고객 긴급 요청" },
  { id: "10", assetCode: "EN00010", assetName: "점화코일", spec: "현대 3.0 GDi/독립점화/6기통세트", acquireDate: "2022-09-30", bookValue: 360000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D004", currentDeptName: "물류팀", currentLocation: "물류센터 창고", currentUser: "임물류", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D005", transferDeptName: "개발팀", transferLocation: "본사 R&D 창고", transferUser: "김개발", transferDate: "2024-03-15", transferReason: "신제품 테스트용" },

  // 변속기 부품 (8개)
  { id: "11", assetCode: "TM00001", assetName: "클러치 디스크", spec: "현대 6단MT/240mm/유기질", acquireDate: "2023-02-10", bookValue: 180000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D004", currentDeptName: "물류팀", currentLocation: "물류센터 A구역", currentUser: "김물류", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산 물류창고", transferUser: "정부산", transferDate: "2024-04-01", transferReason: "부산 정비소 납품용" },
  { id: "12", assetCode: "TM00002", assetName: "플라이휠", spec: "기아 2.0T DCT/듀얼매스/LuK", acquireDate: "2022-06-15", bookValue: 650000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D004", currentDeptName: "물류팀", currentLocation: "물류센터 A구역", currentUser: "이운송", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D011", transferDeptName: "서울영업1팀", transferLocation: "서울 물류창고", transferUser: "박운송", transferDate: "2024-03-28", transferReason: "서울 대리점 주문" },
  { id: "13", assetCode: "TM00003", assetName: "싱크로나이저", spec: "현대 6단AT/3-4단/브론즈", acquireDate: "2023-07-20", bookValue: 420000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D004", currentDeptName: "물류팀", currentLocation: "물류센터 B구역", currentUser: "박배송", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D003", transferDeptName: "생산팀", transferLocation: "공장동 B 창고", transferUser: "최생산", transferDate: "2024-04-15", transferReason: "생산라인 자재 투입" },
  { id: "14", assetCode: "TM00004", assetName: "기어셋", spec: "기아 8단AT/유성기어/5세트", acquireDate: "2024-01-25", bookValue: 1800000, currentCorpCode: "C003", currentCorpName: "부산지사", currentDeptCode: "D021", currentDeptName: "부산영업팀", currentLocation: "부산 물류창고", currentUser: "정기어", transferCorpCode: "C004", transferCorpName: "대전지사", transferDeptCode: "D031", transferDeptName: "대전영업팀", transferLocation: "대전 물류창고", transferUser: "윤기어", transferDate: "2024-05-01", transferReason: "대전 특수정비 납품" },
  { id: "15", assetCode: "TM00005", assetName: "변속기 오일쿨러", spec: "현대 6단AT/알루미늄/핀타입", acquireDate: "2022-10-05", bookValue: 280000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D003", currentDeptName: "생산팀", currentLocation: "공장동 B 창고", currentUser: "최생산", transferCorpCode: "C005", transferCorpName: "광주지사", transferDeptCode: "D041", transferDeptName: "광주영업팀", transferLocation: "광주 물류창고", transferUser: "조쿨러", transferDate: "2024-04-08", transferReason: "광주지사 재고 지원" },
  { id: "16", assetCode: "TM00006", assetName: "토크 컨버터", spec: "기아 8단AT/3요소/락업클러치", acquireDate: "2023-09-15", bookValue: 950000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D004", currentDeptName: "물류팀", currentLocation: "물류센터 C구역", currentUser: "김대형", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산 물류센터", transferUser: "강대형", transferDate: "2024-04-20", transferReason: "부산 대형정비소 납품" },
  { id: "17", assetCode: "TM00007", assetName: "변속 레버", spec: "현대 전자식/게이트타입/크롬", acquireDate: "2024-02-08", bookValue: 320000, currentCorpCode: "C002", currentCorpName: "서울지사", currentDeptCode: "D012", currentDeptName: "서울영업2팀", currentLocation: "서울 물류창고", currentUser: "이서울", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D004", transferDeptName: "물류팀", transferLocation: "물류센터 A구역", transferUser: "박물류", transferDate: "2024-03-30", transferReason: "본사 재고 통합" },
  { id: "18", assetCode: "TM00008", assetName: "CVT 벨트", spec: "르노삼성 CVT/금속푸시벨트/보쉬", acquireDate: "2023-11-22", bookValue: 1200000, currentCorpCode: "C004", currentCorpName: "대전지사", currentDeptCode: "D031", currentDeptName: "대전영업팀", currentLocation: "대전 물류창고", currentUser: "박대전", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D011", transferDeptName: "서울영업1팀", transferLocation: "서울 물류창고", transferUser: "홍서울", transferDate: "2024-04-25", transferReason: "서울 CVT 전문점 납품" },

  // 제동 장치 (7개)
  { id: "19", assetCode: "BR00001", assetName: "브레이크 패드 세트", spec: "현대 쏘나타/세라믹/전륜", acquireDate: "2023-03-15", bookValue: 85000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D004", currentDeptName: "물류팀", currentLocation: "물류센터 A구역", currentUser: "패드1", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산 물류창고", transferUser: "부산패드", transferDate: "2024-04-05", transferReason: "부산 정비소 납품" },
  { id: "20", assetCode: "BR00002", assetName: "브레이크 디스크", spec: "기아 K5/벤틸레이티드/320mm", acquireDate: "2022-08-20", bookValue: 180000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D003", currentDeptName: "생산팀", currentLocation: "공장동 A 창고", currentUser: "생산디스크", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D004", transferDeptName: "물류팀", transferLocation: "물류센터 B구역", transferUser: "물류디스크", transferDate: "2024-03-18", transferReason: "물류센터 재고 재배치" },
  { id: "21", assetCode: "BR00003", assetName: "브레이크 캘리퍼", spec: "현대 그랜저/4피스톤/좌측", acquireDate: "2024-01-10", bookValue: 350000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D004", currentDeptName: "물류팀", currentLocation: "물류센터 B구역", currentUser: "캘리퍼", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D011", transferDeptName: "서울영업1팀", transferLocation: "서울 물류창고", transferUser: "서울캘리퍼", transferDate: "2024-04-12", transferReason: "서울 고성능 정비소 납품" },
  { id: "22", assetCode: "BR00004", assetName: "마스터 실린더", spec: "기아 스포티지/ABS연동/탠덤", acquireDate: "2023-06-05", bookValue: 280000, currentCorpCode: "C003", currentCorpName: "부산지사", currentDeptCode: "D021", currentDeptName: "부산영업팀", currentLocation: "부산 물류창고", currentUser: "부산마스터", transferCorpCode: "C004", transferCorpName: "대전지사", transferDeptCode: "D031", transferDeptName: "대전영업팀", transferLocation: "대전 물류창고", transferUser: "대전마스터", transferDate: "2024-05-05", transferReason: "대전 정비소 긴급 주문" },
  { id: "23", assetCode: "BR00005", assetName: "브레이크 호스", spec: "현대 투싼/스테인리스/전후륜세트", acquireDate: "2024-03-01", bookValue: 120000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D003", currentDeptName: "생산팀", currentLocation: "공장동 B 창고", currentUser: "공장호스", transferCorpCode: "C005", transferCorpName: "광주지사", transferDeptCode: "D041", transferDeptName: "광주영업팀", transferLocation: "광주 물류창고", transferUser: "광주호스", transferDate: "2024-04-18", transferReason: "광주 신규 거래처 납품" },
  { id: "24", assetCode: "BR00006", assetName: "ABS 센서", spec: "기아 셀토스/휠스피드/전자식", acquireDate: "2022-12-15", bookValue: 95000, currentCorpCode: "C002", currentCorpName: "서울지사", currentDeptCode: "D011", currentDeptName: "서울영업1팀", currentLocation: "서울 물류창고", currentUser: "서울센서", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D003", transferDeptName: "생산팀", transferLocation: "공장동 A 창고", transferUser: "생산센서", transferDate: "2024-03-22", transferReason: "생산라인 품질테스트" },
  { id: "25", assetCode: "BR00007", assetName: "브레이크 부스터", spec: "현대 팰리세이드/진공식/대형", acquireDate: "2023-10-08", bookValue: 420000, currentCorpCode: "C004", currentCorpName: "대전지사", currentDeptCode: "D031", currentDeptName: "대전영업팀", currentLocation: "대전 물류창고", currentUser: "대전부스터", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산 물류창고", transferUser: "부산부스터", transferDate: "2024-04-28", transferReason: "부산 대형차 정비소 납품" },

  // 조향/현가 장치 (15개)
  { id: "26", assetCode: "SS00001", assetName: "스티어링 랙", spec: "현대 아반떼/전동식/MDPS", acquireDate: "2024-01-05", bookValue: 850000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D005", currentDeptName: "개발팀", currentLocation: "본사 R&D 창고", currentUser: "김개발", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D011", transferDeptName: "서울영업1팀", transferLocation: "서울지사 창고", transferUser: "박서울", transferDate: "2024-04-01", transferReason: "서울 고급정비소 납품" },
  { id: "27", assetCode: "SS00002", assetName: "타이로드 엔드", spec: "기아 K3/좌우세트/볼조인트", acquireDate: "2023-08-12", bookValue: 120000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D001", currentDeptName: "총무팀", currentLocation: "본사 창고 2층", currentUser: "이총무", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D002", transferDeptName: "영업팀", transferLocation: "본사 영업창고", transferUser: "최영업", transferDate: "2024-03-25", transferReason: "영업 샘플용" },
  { id: "28", assetCode: "SS00003", assetName: "볼조인트", spec: "현대 싼타페/하부암/프레스타입", acquireDate: "2023-04-18", bookValue: 85000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D002", currentDeptName: "영업팀", currentLocation: "본사 영업창고", currentUser: "박영업", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산지사 창고", transferUser: "강부산", transferDate: "2024-04-10", transferReason: "부산지사 재고 보강" },
  { id: "29", assetCode: "SS00004", assetName: "쇼크 업소버", spec: "기아 쏘렌토/가스충전/전륜좌측", acquireDate: "2024-02-22", bookValue: 280000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D005", currentDeptName: "개발팀", currentLocation: "본사 R&D 창고", currentUser: "최개발", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D001", transferDeptName: "총무팀", transferLocation: "본사 창고 2층", transferUser: "송총무", transferDate: "2024-03-18", transferReason: "샘플 테스트 완료 후 이관" },
  { id: "30", assetCode: "SS00005", assetName: "코일 스프링", spec: "현대 투싼/프론트/표준하중", acquireDate: "2023-11-08", bookValue: 150000, currentCorpCode: "C002", currentCorpName: "서울지사", currentDeptCode: "D011", currentDeptName: "서울영업1팀", currentLocation: "서울지사 창고", currentUser: "정서울", transferCorpCode: "C004", transferCorpName: "대전지사", transferDeptCode: "D031", transferDeptName: "대전영업팀", transferLocation: "대전지사 창고", transferUser: "오대전", transferDate: "2024-04-22", transferReason: "대전지사 신규 배치" },
  { id: "31", assetCode: "SS00006", assetName: "스태빌라이저 바", spec: "기아 스팅어/전륜/강화형", acquireDate: "2023-05-25", bookValue: 180000, currentCorpCode: "C003", currentCorpName: "부산지사", currentDeptCode: "D021", currentDeptName: "부산영업팀", currentLocation: "부산지사 창고", currentUser: "한부산", transferCorpCode: "C005", transferCorpName: "광주지사", transferDeptCode: "D041", transferDeptName: "광주영업팀", transferLocation: "광주지사 창고", transferUser: "유광주", transferDate: "2024-05-01", transferReason: "광주지사 고성능 부품 지원" },
  { id: "32", assetCode: "SS00007", assetName: "로어암", spec: "현대 그랜저/알루미늄/좌측", acquireDate: "2022-12-10", bookValue: 320000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D001", currentDeptName: "총무팀", currentLocation: "본사 창고 회계실", currentUser: "송회계", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D005", transferDeptName: "개발팀", transferLocation: "본사 R&D 창고", transferUser: "신개발", transferDate: "2024-03-28", transferReason: "신차종 개발 테스트" },
  { id: "33", assetCode: "SS00008", assetName: "어퍼암", spec: "기아 모하비/스틸/우측", acquireDate: "2023-07-15", bookValue: 280000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D005", currentDeptName: "개발팀", currentLocation: "본사 R&D 창고", currentUser: "임서버", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D012", transferDeptName: "서울영업2팀", transferLocation: "서울지사 창고", transferUser: "홍개발", transferDate: "2024-04-15", transferReason: "서울 SUV 전문점 납품" },
  { id: "34", assetCode: "SS00009", assetName: "허브베어링", spec: "현대 쏘나타/전륜/ABS센서통합", acquireDate: "2022-09-20", bookValue: 180000, currentCorpCode: "C004", currentCorpName: "대전지사", currentDeptCode: "D031", currentDeptName: "대전영업팀", currentLocation: "대전지사 창고", currentUser: "오대전", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D004", transferDeptName: "물류팀", transferLocation: "물류센터 창고", transferUser: "배물류", transferDate: "2024-03-20", transferReason: "물류센터 통합 재고" },
  { id: "35", assetCode: "SS00010", assetName: "스티어링 휠", spec: "기아 K8/가죽/열선/패들시프트", acquireDate: "2024-03-05", bookValue: 650000, currentCorpCode: "C005", currentCorpName: "광주지사", currentDeptCode: "D041", currentDeptName: "광주영업팀", currentLocation: "광주지사 창고", currentUser: "유광주", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산지사 창고", transferUser: "남부산", transferDate: "2024-04-08", transferReason: "부산지사 프리미엄 부품" },
  { id: "36", assetCode: "SS00011", assetName: "파워스티어링 펌프", spec: "현대 스타렉스/유압식/벤타입", acquireDate: "2023-02-28", bookValue: 380000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D005", currentDeptName: "개발팀", currentLocation: "본사 R&D 창고", currentUser: "신디자인", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D003", transferDeptName: "생산팀", transferLocation: "공장동 A 창고", transferUser: "권생산", transferDate: "2024-03-15", transferReason: "생산라인 자재 투입" },
  { id: "37", assetCode: "SS00012", assetName: "스트럿 마운트", spec: "기아 니로/전륜좌우세트/베어링", acquireDate: "2022-07-12", bookValue: 95000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D003", currentDeptName: "생산팀", currentLocation: "공장동 A 창고", currentUser: "권생산", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D011", transferDeptName: "서울영업1팀", transferLocation: "서울지사 창고", transferUser: "정서울", transferDate: "2024-04-25", transferReason: "서울지사 일반 납품용" },
  { id: "38", assetCode: "SS00013", assetName: "서스펜션 부시", spec: "현대 i30/폴리우레탄/전체세트", acquireDate: "2023-09-18", bookValue: 180000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D004", currentDeptName: "물류팀", currentLocation: "물류센터 창고", currentUser: "배물류", transferCorpCode: "C004", transferCorpName: "대전지사", transferDeptCode: "D031", transferDeptName: "대전영업팀", transferLocation: "대전지사 창고", transferUser: "서대전", transferDate: "2024-05-05", transferReason: "대전지사 튜닝샵 납품" },
  { id: "39", assetCode: "SS00014", assetName: "스티어링 기어박스", spec: "기아 카니발/유압식/리빌드", acquireDate: "2023-06-22", bookValue: 520000, currentCorpCode: "C002", currentCorpName: "서울지사", currentDeptCode: "D012", currentDeptName: "서울영업2팀", currentLocation: "서울지사 회의실", currentUser: "공용창고", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D002", transferDeptName: "영업팀", transferLocation: "본사 영업창고", transferUser: "공용PC3", transferDate: "2024-03-22", transferReason: "본사 재고 통합" },
  { id: "40", assetCode: "SS00015", assetName: "휠 얼라인먼트 키트", spec: "현대 전차종/캠버볼트/토우조정", acquireDate: "2024-01-30", bookValue: 85000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D002", currentDeptName: "영업팀", currentLocation: "본사 영업창고", currentUser: "공용창고2", transferCorpCode: "C005", transferCorpName: "광주지사", transferDeptCode: "D041", transferDeptName: "광주영업팀", transferLocation: "광주지사 창고", transferUser: "공용창고4", transferDate: "2024-04-30", transferReason: "광주지사 정비장비 지원" },

  // 전장 부품 (10개)
  { id: "41", assetCode: "EL00001", assetName: "알터네이터", spec: "현대 아반떼/14V/150A", acquireDate: "2024-02-15", bookValue: 380000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D002", currentDeptName: "영업팀", currentLocation: "본사 영업창고", currentUser: "김영업", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산지사 창고", transferUser: "강영업", transferDate: "2024-04-01", transferReason: "부산 전기정비소 납품" },
  { id: "42", assetCode: "EL00002", assetName: "스타터 모터", spec: "기아 쏘렌토/12V/2.0kW/리덕션", acquireDate: "2023-10-10", bookValue: 420000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D001", currentDeptName: "총무팀", currentLocation: "본사 창고 임원실", currentUser: "이상무", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D012", transferDeptName: "서울영업2팀", transferLocation: "서울지사 창고", transferUser: "홍상무", transferDate: "2024-03-28", transferReason: "서울지사 긴급 출고" },
  { id: "43", assetCode: "EL00003", assetName: "AGM 배터리", spec: "현대 팰리세이드/12V/95Ah/스탑앤고", acquireDate: "2024-01-20", bookValue: 350000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D005", currentDeptName: "개발팀", currentLocation: "본사 R&D 창고", currentUser: "박개발", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D005", transferDeptName: "개발팀", transferLocation: "본사 테스트실", transferUser: "윤디자인", transferDate: "2024-04-10", transferReason: "내구성 테스트용" },
  { id: "44", assetCode: "EL00004", assetName: "ECU 모듈", spec: "기아 K5/엔진제어/KEFICO", acquireDate: "2023-08-28", bookValue: 850000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D005", currentDeptName: "개발팀", currentLocation: "본사 R&D 창고", currentUser: "조개발", transferCorpCode: "C004", transferCorpName: "대전지사", transferDeptCode: "D031", transferDeptName: "대전영업팀", transferLocation: "대전지사 창고", transferUser: "박대전", transferDate: "2024-04-18", transferReason: "대전 ECU 전문점 납품" },
  { id: "45", assetCode: "EL00005", assetName: "점화 플러그 세트", spec: "현대 3.3 GDi/이리듐/6기통", acquireDate: "2023-05-15", bookValue: 120000, currentCorpCode: "C002", currentCorpName: "서울지사", currentDeptCode: "D011", currentDeptName: "서울영업1팀", currentLocation: "서울지사 창고", currentUser: "홍서울", transferCorpCode: "C005", transferCorpName: "광주지사", transferDeptCode: "D041", transferDeptName: "광주영업팀", transferLocation: "광주지사 창고", transferUser: "조광주", transferDate: "2024-05-01", transferReason: "광주지사 소모품 지원" },
  { id: "46", assetCode: "EL00006", assetName: "산소 센서", spec: "기아 스포티지/광대역/후방", acquireDate: "2024-03-08", bookValue: 180000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D001", currentDeptName: "총무팀", currentLocation: "본사 창고 기획실", currentUser: "고기획", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D002", transferDeptName: "영업팀", transferLocation: "본사 영업창고", transferUser: "김영업2", transferDate: "2024-03-25", transferReason: "영업팀 샘플 전환" },
  { id: "47", assetCode: "EL00007", assetName: "크랭크각 센서", spec: "현대 2.0T/홀효과/60-2톱니", acquireDate: "2023-07-22", bookValue: 95000, currentCorpCode: "C003", currentCorpName: "부산지사", currentDeptCode: "D021", currentDeptName: "부산영업팀", currentLocation: "부산지사 창고", currentUser: "남부산", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D004", transferDeptName: "물류팀", transferLocation: "물류센터 창고", transferUser: "임물류", transferDate: "2024-04-05", transferReason: "물류센터 통합 관리" },
  { id: "48", assetCode: "EL00008", assetName: "MAP 센서", spec: "기아 셀토스/압력식/부스트연동", acquireDate: "2023-12-05", bookValue: 85000, currentCorpCode: "C004", currentCorpName: "대전지사", currentDeptCode: "D031", currentDeptName: "대전영업팀", currentLocation: "대전지사 창고", currentUser: "서대전", transferCorpCode: "C002", transferCorpName: "서울지사", transferDeptCode: "D011", transferDeptName: "서울영업1팀", transferLocation: "서울지사 창고", transferUser: "정서울", transferDate: "2024-04-22", transferReason: "서울지사 재고 교환" },
  { id: "49", assetCode: "EL00009", assetName: "퓨즈박스", spec: "현대 코나/실내형/PDM통합", acquireDate: "2023-04-12", bookValue: 280000, currentCorpCode: "C001", currentCorpName: "본사", currentDeptCode: "D005", currentDeptName: "개발팀", currentLocation: "본사 테스트실", currentUser: "윤디자인", transferCorpCode: "C003", transferCorpName: "부산지사", transferDeptCode: "D021", transferDeptName: "부산영업팀", transferLocation: "부산지사 창고", transferUser: "강디자인", transferDate: "2024-03-30", transferReason: "부산지사 전장 부품 지원" },
  { id: "50", assetCode: "EL00010", assetName: "멀티 릴레이", spec: "기아 전차종/5핀/30A/방수", acquireDate: "2024-02-28", bookValue: 45000, currentCorpCode: "C005", currentCorpName: "광주지사", currentDeptCode: "D041", currentDeptName: "광주영업팀", currentLocation: "광주지사 창고", currentUser: "장광주", transferCorpCode: "C001", transferCorpName: "본사", transferDeptCode: "D001", transferDeptName: "총무팀", transferLocation: "본사 창고 기획실", transferUser: "고기획", transferDate: "2024-04-28", transferReason: "본사 소모품 통합 관리" },
]

const corpData: CorpData[] = [
  { code: "C001", name: "본사" },
  { code: "C002", name: "서울지사" },
  { code: "C003", name: "부산지사" },
  { code: "C004", name: "대전지사" },
  { code: "C005", name: "광주지사" },
]

const deptData: DeptData[] = [
  { code: "D001", name: "총무팀", corpCode: "C001" },
  { code: "D002", name: "영업팀", corpCode: "C001" },
  { code: "D003", name: "생산팀", corpCode: "C001" },
  { code: "D004", name: "물류팀", corpCode: "C001" },
  { code: "D005", name: "개발팀", corpCode: "C001" },
  { code: "D011", name: "서울영업1팀", corpCode: "C002" },
  { code: "D012", name: "서울영업2팀", corpCode: "C002" },
  { code: "D021", name: "부산영업팀", corpCode: "C003" },
  { code: "D031", name: "대전영업팀", corpCode: "C004" },
  { code: "D041", name: "광주영업팀", corpCode: "C005" },
]

// 자산 팝업용 데이터 (50개 전체)
const assetPopupData: AssetPopupData[] = dummyAssetData.map((item) => ({
  code: item.assetCode,
  name: item.assetName,
  spec: item.spec,
}))

// 자산정보 팝업용 더미 데이터 (참조 이미지 기준 확장)
const assetInfoDetailData: AssetInfoDetailData[] = dummyAssetData.map((item, idx) => {
  const assetCodePrefix = item.assetCode.startsWith("EN") ? "EN" :
                          item.assetCode.startsWith("TM") ? "TM" :
                          item.assetCode.startsWith("BR") ? "BR" :
                          item.assetCode.startsWith("SS") ? "SS" : "EL"

  const assetCodeName = assetCodePrefix === "EN" ? "엔진부품" :
                        assetCodePrefix === "TM" ? "변속기부품" :
                        assetCodePrefix === "BR" ? "제동장치" :
                        assetCodePrefix === "SS" ? "조향/현가장치" : "전장부품"

  const assetCodeDesc = assetCodePrefix === "EN" ? "차량운반구" :
                        assetCodePrefix === "TM" ? "기계장치" :
                        assetCodePrefix === "BR" ? "차량운반구" :
                        assetCodePrefix === "SS" ? "기계장치" : "전자장비"

  const itemCodeDesc = assetCodePrefix === "EN" ? "승용차" :
                       assetCodePrefix === "TM" ? "변속기" :
                       assetCodePrefix === "BR" ? "제동장치" :
                       assetCodePrefix === "SS" ? "조향장치" : "전장품"

  return {
    // 그리드용 필드
    assetNo: item.assetCode,
    assetName: item.assetName,
    assetCodeName: assetCodeName,
    itemName: item.assetName,
    acquireDate: item.acquireDate,
    acquireAmount: item.bookValue * 1.2,
    currentDept: item.currentDeptName,
    currentDept1: item.currentLocation,

    // 기본정보 필드
    assetCode: assetCodePrefix + String(idx + 1).padStart(5, "0"),
    assetCodeDesc: assetCodeDesc,
    itemCode: `ITM${assetCodePrefix}${String(idx + 1).padStart(3, "0")}`,
    itemCodeDesc: itemCodeDesc,
    detailCode: `DTL${String(idx + 1).padStart(4, "0")}`,
    fiscalYear: item.acquireDate.substring(0, 4),
    depreciationMethod: ["정액법", "정률법", "정액법", "정률법", "정액법"][idx % 5],
    acquireVoucherNo: `VCH-${item.acquireDate.substring(0, 4)}-${String(idx + 1).padStart(6, "0")}`,

    // 취득정보 필드
    acquireDeptCode: item.currentDeptCode,
    acquireVendorCode: `VND${String((idx % 10) + 1).padStart(4, "0")}`,
    acquireStatus: ["신규취득", "신규취득", "이관취득", "무상취득", "신규취득"][idx % 5],
    acquireQty: "1",
    acquireUnit: "EA",
    usefulLife: ["5", "7", "10", "5", "8"][idx % 5],
    evidenceYn: idx % 2 === 0 ? "Y" : "N",
    accountCode: `ACC${String((idx % 5) + 1).padStart(4, "0")}`,
    designationYn: idx % 3 === 0 ? "Y" : "N",
    manageDeptCode: item.currentDeptCode,
    managerIdMain: `MGR${String((idx % 10) + 1).padStart(4, "0")}`,
    managerIdSub: idx % 2 === 0 ? `MGR${String((idx % 10) + 11).padStart(4, "0")}` : "",
    assetStatus: ["사용중", "사용중", "사용중", "수리중", "대기중"][idx % 5],
    inspectionDate: item.acquireDate,
    managementNo: `MNG-${item.acquireDate.substring(0, 4)}-${String(idx + 1).padStart(5, "0")}`,
    spec: item.spec,
    summary: idx % 3 === 0 ? `${assetCodeName} 취득` : "",
    memo: idx % 4 === 0 ? "정기점검 필요" : "",
  }
})

export default function AssetTransferMovePage() {
  // 검색 필터 상태
  const [searchCorpCode, setSearchCorpCode] = useState("")
  const [searchCorpName, setSearchCorpName] = useState("")
  const [searchDeptCode, setSearchDeptCode] = useState("")
  const [searchDeptName, setSearchDeptName] = useState("")
  const [searchStartMonth, setSearchStartMonth] = useState("")
  const [searchEndMonth, setSearchEndMonth] = useState("")
  const [searchAssetCode, setSearchAssetCode] = useState("")

  // 그리드 데이터 상태
  const [rowData, setRowData] = useState<AssetTransferData[]>([])
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  // 활성 탭 상태
  const [activeTab, setActiveTab] = useState("transfer-history")

  // 팝업 상태
  const [corpPopupOpen, setCorpPopupOpen] = useState(false)
  const [deptPopupOpen, setDeptPopupOpen] = useState(false)
  const [assetPopupOpen, setAssetPopupOpen] = useState(false)
  const [corpPopupSearch, setCorpPopupSearch] = useState("")
  const [deptPopupSearch, setDeptPopupSearch] = useState("")
  const [assetPopupSearch, setAssetPopupSearch] = useState("")
  const [corpPopupDisplayCount, setCorpPopupDisplayCount] = useState(POPUP_PAGE_SIZE)
  const [deptPopupDisplayCount, setDeptPopupDisplayCount] = useState(POPUP_PAGE_SIZE)
  const [assetPopupDisplayCount, setAssetPopupDisplayCount] = useState(POPUP_PAGE_SIZE)

  // 자산정보 팝업 상태
  const [assetInfoPopupOpen, setAssetInfoPopupOpen] = useState(false)
  const [assetInfoPopupTab, setAssetInfoPopupTab] = useState<"asset-info" | "asset-additional">("asset-info")
  const [selectedAssetInfo, setSelectedAssetInfo] = useState<AssetInfoDetailData | null>(null)

  // 신규요청서 작성 팝업 상태
  const [newRequestPopupOpen, setNewRequestPopupOpen] = useState(false)
  const [newRequestMoldData, setNewRequestMoldData] = useState<MoldTransferRequestData[]>([])
  const [selectedReceiverCompany, setSelectedReceiverCompany] = useState<ReceiverCompanyData | null>(null)
  const [selectedPurchaseManager, setSelectedPurchaseManager] = useState<PurchaseManagerData | null>(null)
  const [newRequestDate, setNewRequestDate] = useState("")
  const [receiverCompanySearch, setReceiverCompanySearch] = useState("")
  const [purchaseManagerSearch, setPurchaseManagerSearch] = useState("")
  const [receiverCompanyPopupOpen, setReceiverCompanyPopupOpen] = useState(false)
  const [purchaseManagerPopupOpen, setPurchaseManagerPopupOpen] = useState(false)

  // 페이지 로드 시 초기 데이터 로드
  useEffect(() => {
    setRowData(dummyAssetData)
  }, [])

  // 탭 목록
  const tabs = [
    { id: "transfer-history", label: "이동이력" },
    { id: "approval-request", label: "결재상신" },
    { id: "cancel-approval", label: "취소결재상신" },
    { id: "approval-status", label: "결재상태조회" },
  ]

  // 표시할 데이터
  const displayedData = useMemo(() => {
    return rowData.slice(0, displayCount)
  }, [rowData, displayCount])

  const hasMore = displayCount < rowData.length

  // 더보기 핸들러
  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, rowData.length))
  }, [rowData.length])

  // 조회 핸들러
  const handleSearch = useCallback(() => {
    // 실제로는 API 호출로 대체
    // 검색 필터 적용
    let filteredData = [...dummyAssetData]

    if (searchCorpCode) {
      filteredData = filteredData.filter(item => item.currentCorpCode === searchCorpCode)
    }
    if (searchDeptCode) {
      filteredData = filteredData.filter(item => item.currentDeptCode === searchDeptCode)
    }
    if (searchAssetCode) {
      filteredData = filteredData.filter(item => item.assetCode.includes(searchAssetCode))
    }

    setRowData(filteredData)
    setDisplayCount(PAGE_SIZE)
  }, [searchCorpCode, searchDeptCode, searchAssetCode])

  // 저장 핸들러
  const handleSave = useCallback(() => {
    alert("저장되었습니다.")
  }, [])

  // 엑셀 내보내기 핸들러
  const handleExcelExport = useCallback(() => {
    alert("엑셀 내보내기가 실행됩니다.")
  }, [])

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    alert("인쇄가 실행됩니다.")
  }, [])

  // 전송 핸들러
  const handleSend = useCallback(() => {
    alert("전송이 실행됩니다.")
  }, [])

  // 셀 값 변경 핸들러
  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const { data, colDef, newValue } = event
    // 이동정보 관련 필드가 변경되면 데이터 업데이트
    setRowData((prev) =>
      prev.map((row) =>
        row.id === data.id ? { ...row, [colDef.field as string]: newValue } : row
      )
    )
  }, [])

  // 법인코드 팝업 데이터
  const filteredCorpData = useMemo(() => {
    if (!corpPopupSearch) return corpData
    return corpData.filter(
      (item) =>
        item.code.toLowerCase().includes(corpPopupSearch.toLowerCase()) ||
        item.name.toLowerCase().includes(corpPopupSearch.toLowerCase())
    )
  }, [corpPopupSearch])

  const displayedCorpData = useMemo(() => {
    return filteredCorpData.slice(0, corpPopupDisplayCount)
  }, [filteredCorpData, corpPopupDisplayCount])

  // 보유부서 팝업 데이터
  const filteredDeptData = useMemo(() => {
    let data = deptData
    if (searchCorpCode) {
      data = data.filter((item) => item.corpCode === searchCorpCode)
    }
    if (!deptPopupSearch) return data
    return data.filter(
      (item) =>
        item.code.toLowerCase().includes(deptPopupSearch.toLowerCase()) ||
        item.name.toLowerCase().includes(deptPopupSearch.toLowerCase())
    )
  }, [deptPopupSearch, searchCorpCode])

  const displayedDeptData = useMemo(() => {
    return filteredDeptData.slice(0, deptPopupDisplayCount)
  }, [filteredDeptData, deptPopupDisplayCount])

  // 자산코드 팝업 데이터
  const filteredAssetData = useMemo(() => {
    if (!assetPopupSearch) return assetPopupData
    return assetPopupData.filter(
      (item) =>
        item.code.toLowerCase().includes(assetPopupSearch.toLowerCase()) ||
        item.name.toLowerCase().includes(assetPopupSearch.toLowerCase())
    )
  }, [assetPopupSearch])

  const displayedAssetData = useMemo(() => {
    return filteredAssetData.slice(0, assetPopupDisplayCount)
  }, [filteredAssetData, assetPopupDisplayCount])

  // 자산정보 팝업 데이터
  const filteredAssetInfoData = useMemo(() => {
    return assetInfoDetailData
  }, [])

  // 법인코드 선택 핸들러
  const handleCorpSelect = useCallback((corp: CorpData) => {
    setSearchCorpCode(corp.code)
    setSearchCorpName(corp.name)
    setCorpPopupOpen(false)
    setCorpPopupSearch("")
    setCorpPopupDisplayCount(POPUP_PAGE_SIZE)
    // 법인이 변경되면 부서 초기화
    setSearchDeptCode("")
    setSearchDeptName("")
  }, [])

  // 보유부서 선택 핸들러
  const handleDeptSelect = useCallback((dept: DeptData) => {
    setSearchDeptCode(dept.code)
    setSearchDeptName(dept.name)
    setDeptPopupOpen(false)
    setDeptPopupSearch("")
    setDeptPopupDisplayCount(POPUP_PAGE_SIZE)
  }, [])

  // 자산코드 선택 핸들러
  const handleAssetSelect = useCallback((asset: AssetPopupData) => {
    setSearchAssetCode(asset.code)
    setAssetPopupOpen(false)
    setAssetPopupSearch("")
    setAssetPopupDisplayCount(POPUP_PAGE_SIZE)
  }, [])

  // 자산정보 팝업 선택 핸들러
  const handleAssetInfoSelect = useCallback((info: AssetInfoDetailData) => {
    setSelectedAssetInfo(info)
  }, [])

  // 금액 포맷터
  const currencyFormatter = (params: { value: number }) => {
    if (params.value == null) return ""
    return params.value.toLocaleString("ko-KR")
  }

  // 컬럼 정의
  const columnDefs: (ColDef | ColGroupDef)[] = useMemo(
    () => [
      {
        headerName: "자산정보",
        children: [
          {
            headerName: "자산코드",
            field: "assetCode",
            width: 120,
            minWidth: 100,
            pinned: "left",
            tooltipField: "assetCode",
          },
          {
            headerName: "자산명",
            field: "assetName",
            width: 180,
            minWidth: 150,
            tooltipField: "assetName",
          },
          {
            headerName: "규격",
            field: "spec",
            width: 220,
            minWidth: 180,
            tooltipField: "spec",
          },
          {
            headerName: "취득일자",
            field: "acquireDate",
            width: 110,
            minWidth: 100,
          },
          {
            headerName: "장부가액",
            field: "bookValue",
            width: 130,
            minWidth: 110,
            type: "numericColumn",
            valueFormatter: currencyFormatter,
          },
        ],
      },
      {
        headerName: "현재(전출)정보",
        children: [
          {
            headerName: "법인코드",
            field: "currentCorpCode",
            width: 100,
            minWidth: 90,
          },
          {
            headerName: "법인명",
            field: "currentCorpName",
            width: 100,
            minWidth: 80,
            tooltipField: "currentCorpName",
          },
          {
            headerName: "부서코드",
            field: "currentDeptCode",
            width: 100,
            minWidth: 90,
          },
          {
            headerName: "부서명",
            field: "currentDeptName",
            width: 120,
            minWidth: 100,
            tooltipField: "currentDeptName",
          },
          {
            headerName: "위치",
            field: "currentLocation",
            width: 160,
            minWidth: 120,
            tooltipField: "currentLocation",
          },
          {
            headerName: "사용자",
            field: "currentUser",
            width: 90,
            minWidth: 80,
            tooltipField: "currentUser",
          },
        ],
      },
      {
        headerName: "이동(전입)정보",
        headerClass: "bg-blue-50",
        children: [
          {
            headerName: "*법인코드",
            field: "transferCorpCode",
            width: 100,
            minWidth: 90,
            editable: true,
            cellClass: "editable-cell",
          },
          {
            headerName: "*법인명",
            field: "transferCorpName",
            width: 100,
            minWidth: 80,
            editable: true,
            cellClass: "editable-cell",
            tooltipField: "transferCorpName",
          },
          {
            headerName: "*부서코드",
            field: "transferDeptCode",
            width: 100,
            minWidth: 90,
            editable: true,
            cellClass: "editable-cell",
          },
          {
            headerName: "*부서명",
            field: "transferDeptName",
            width: 120,
            minWidth: 100,
            editable: true,
            cellClass: "editable-cell",
            tooltipField: "transferDeptName",
          },
          {
            headerName: "위치",
            field: "transferLocation",
            width: 160,
            minWidth: 120,
            editable: true,
            cellClass: "editable-cell",
            tooltipField: "transferLocation",
          },
          {
            headerName: "사용자",
            field: "transferUser",
            width: 90,
            minWidth: 80,
            editable: true,
            cellClass: "editable-cell",
            tooltipField: "transferUser",
          },
          {
            headerName: "*이동일자",
            field: "transferDate",
            width: 110,
            minWidth: 100,
            editable: true,
            cellClass: "editable-cell",
          },
          {
            headerName: "이동사유",
            field: "transferReason",
            width: 200,
            minWidth: 150,
            editable: true,
            cellClass: "editable-cell",
            tooltipField: "transferReason",
          },
        ],
      },
    ],
    []
  )

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      suppressMovable: true,
    }),
    []
  )

  // 팝업용 컬럼 정의
  const corpPopupColumnDefs: ColDef[] = useMemo(
    () => [
      { headerName: "법인코드", field: "code", width: 120 },
      { headerName: "법인명", field: "name", flex: 1 },
    ],
    []
  )

  const deptPopupColumnDefs: ColDef[] = useMemo(
    () => [
      { headerName: "부서코드", field: "code", width: 120 },
      { headerName: "부서명", field: "name", flex: 1 },
    ],
    []
  )

  const assetPopupColumnDefs: ColDef[] = useMemo(
    () => [
      { headerName: "자산코드", field: "code", width: 120 },
      { headerName: "자산명", field: "name", flex: 1 },
      { headerName: "규격", field: "spec", width: 100 },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 검색 영역 */}
      <div className="rounded-md border bg-card p-4">
        <div className="grid grid-cols-4 gap-4">
          {/* 법인코드 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">법인코드</Label>
            <div className="flex gap-1">
              <Input
                value={searchCorpCode}
                onChange={(e) => setSearchCorpCode(e.target.value)}
                placeholder="법인코드"
                className="flex-1"
              />
              <Input
                value={searchCorpName}
                readOnly
                placeholder="법인명"
                className="flex-1 bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCorpPopupOpen(true)}
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 보유부서 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">보유부서</Label>
            <div className="flex gap-1">
              <Input
                value={searchDeptCode}
                onChange={(e) => setSearchDeptCode(e.target.value)}
                placeholder="부서코드"
                className="flex-1"
              />
              <Input
                value={searchDeptName}
                readOnly
                placeholder="부서명"
                className="flex-1 bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDeptPopupOpen(true)}
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 이동년월 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">이동년월</Label>
            <div className="flex items-center gap-1">
              <Input
                type="month"
                value={searchStartMonth}
                onChange={(e) => setSearchStartMonth(e.target.value)}
                className="flex-1"
              />
              <span className="text-muted-foreground">~</span>
              <Input
                type="month"
                value={searchEndMonth}
                onChange={(e) => setSearchEndMonth(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* 자산코드 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">자산코드</Label>
            <div className="flex gap-1">
              <Input
                value={searchAssetCode}
                onChange={(e) => setSearchAssetCode(e.target.value)}
                placeholder="자산코드"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAssetPopupOpen(true)}
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 툴바 영역 */}
      <div className="flex items-center justify-between">
        {/* 왼쪽 - 기능 버튼 */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSearch}>
            <HugeiconsIcon icon={Search01Icon} className="mr-1.5 h-4 w-4" />
            조회
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <HugeiconsIcon icon={FloppyDiskIcon} className="mr-1.5 h-4 w-4" />
            저장
          </Button>
          <Button variant="outline" onClick={handleExcelExport}>
            <HugeiconsIcon icon={FileExportIcon} className="mr-1.5 h-4 w-4" />
            엑셀
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <HugeiconsIcon icon={PrinterIcon} className="mr-1.5 h-4 w-4" />
            인쇄
          </Button>
          <Button variant="outline" onClick={handleSend}>
            <HugeiconsIcon icon={SentIcon} className="mr-1.5 h-4 w-4" />
            전송
          </Button>
        </div>

        {/* 오른쪽 - 자산정보 + 금형이동 버튼 + 탭 버튼 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssetInfoPopupOpen(true)}
          >
            <span className="flex items-center gap-1.5">
              자산정보
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewRequestPopupOpen(true)
              setNewRequestMoldData(dummyMoldTransferData)
              setNewRequestDate(new Date().toISOString().split('T')[0])
            }}
          >
            <span className="flex items-center gap-1.5">
              금형이동
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
            </span>
          </Button>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="outline"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  activeTab === tab.id && "bg-white font-semibold"
                )}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 그리드 영역 */}
      <div className="ag-theme-quartz w-full">
        <AgGridReact
          rowData={displayedData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          rowSelection="multiple"
          onCellValueChanged={onCellValueChanged}
          suppressRowClickSelection
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

      {/* 법인코드 팝업 */}
      <Dialog open={corpPopupOpen} onOpenChange={setCorpPopupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>법인코드 검색</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="법인코드 또는 법인명으로 검색"
                value={corpPopupSearch}
                onChange={(e) => {
                  setCorpPopupSearch(e.target.value)
                  setCorpPopupDisplayCount(POPUP_PAGE_SIZE)
                }}
              />
            </div>
            <div className="ag-theme-quartz h-[300px]">
              <AgGridReact
                rowData={displayedCorpData}
                columnDefs={corpPopupColumnDefs}
                defaultColDef={{ sortable: true, resizable: true }}
                rowSelection="single"
                onRowClicked={(e) => e.data && handleCorpSelect(e.data)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {displayedCorpData.length} / {filteredCorpData.length}건
              </span>
              {corpPopupDisplayCount < filteredCorpData.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCorpPopupDisplayCount((prev) => prev + POPUP_PAGE_SIZE)
                  }
                >
                  더보기
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 보유부서 팝업 */}
      <Dialog open={deptPopupOpen} onOpenChange={setDeptPopupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>보유부서 검색</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="부서코드 또는 부서명으로 검색"
                value={deptPopupSearch}
                onChange={(e) => {
                  setDeptPopupSearch(e.target.value)
                  setDeptPopupDisplayCount(POPUP_PAGE_SIZE)
                }}
              />
            </div>
            <div className="ag-theme-quartz h-[300px]">
              <AgGridReact
                rowData={displayedDeptData}
                columnDefs={deptPopupColumnDefs}
                defaultColDef={{ sortable: true, resizable: true }}
                rowSelection="single"
                onRowClicked={(e) => e.data && handleDeptSelect(e.data)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {displayedDeptData.length} / {filteredDeptData.length}건
              </span>
              {deptPopupDisplayCount < filteredDeptData.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDeptPopupDisplayCount((prev) => prev + POPUP_PAGE_SIZE)
                  }
                >
                  더보기
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 자산코드 팝업 */}
      <Dialog open={assetPopupOpen} onOpenChange={setAssetPopupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>자산코드 검색</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="자산코드 또는 자산명으로 검색"
                value={assetPopupSearch}
                onChange={(e) => {
                  setAssetPopupSearch(e.target.value)
                  setAssetPopupDisplayCount(POPUP_PAGE_SIZE)
                }}
              />
            </div>
            <div className="ag-theme-quartz h-[300px]">
              <AgGridReact
                rowData={displayedAssetData}
                columnDefs={assetPopupColumnDefs}
                defaultColDef={{ sortable: true, resizable: true }}
                rowSelection="single"
                onRowClicked={(e) => e.data && handleAssetSelect(e.data)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {displayedAssetData.length} / {filteredAssetData.length}건
              </span>
              {assetPopupDisplayCount < filteredAssetData.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAssetPopupDisplayCount((prev) => prev + POPUP_PAGE_SIZE)
                  }
                >
                  더보기
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 자산정보 팝업 */}
      <Dialog open={assetInfoPopupOpen} onOpenChange={setAssetInfoPopupOpen}>
        <DialogContent className="w-[98vw] max-w-[2000px] h-[900px] flex flex-col p-0 gap-0" showCloseButton={false}>
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <DialogTitle className="text-base font-semibold">자산정보</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAssetInfoPopupOpen(false)}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </div>

          {/* 탭 영역 */}
          <div className="flex border-b px-4 shrink-0">
            <button
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px",
                assetInfoPopupTab === "asset-info"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setAssetInfoPopupTab("asset-info")}
            >
              자산정보
            </button>
            <button
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px",
                assetInfoPopupTab === "asset-additional"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setAssetInfoPopupTab("asset-additional")}
            >
              자산부가정보
            </button>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="flex gap-3 p-4 flex-1 overflow-hidden">
            {/* 왼쪽 - AG Grid 테이블 */}
            <div className="w-2/5 flex flex-col border rounded overflow-hidden">
              <div className="ag-theme-alpine h-full text-xs">
                <AgGridReact
                  rowData={filteredAssetInfoData}
                  columnDefs={[
                    { field: "assetNo", headerName: "자산번호", width: 120, minWidth: 100, tooltipField: "assetNo" },
                    { field: "assetName", headerName: "자산명칭", width: 150, minWidth: 120, tooltipField: "assetName" },
                    { field: "assetCodeName", headerName: "자산코드명", width: 130, minWidth: 100, tooltipField: "assetCodeName" },
                    { field: "itemName", headerName: "품목명", width: 130, minWidth: 100, tooltipField: "itemName" },
                    { field: "acquireDate", headerName: "취득일자", width: 110, minWidth: 100 },
                    {
                      field: "acquireAmount",
                      headerName: "취득금액",
                      width: 120,
                      minWidth: 100,
                      valueFormatter: (params: { value: number }) => params.value?.toLocaleString("ko-KR")
                    },
                    { field: "currentDept", headerName: "(현)보유부서", width: 120, minWidth: 100, tooltipField: "currentDept" },
                    { field: "currentDept1", headerName: "(현)보유부서1", width: 120, minWidth: 100, tooltipField: "currentDept1" },
                  ]}
                  defaultColDef={{
                    sortable: true,
                    resizable: true,
                    suppressMovable: true,
                  }}
                  rowSelection="single"
                  onRowClicked={(e) => e.data && handleAssetInfoSelect(e.data)}
                  getRowClass={(params) =>
                    selectedAssetInfo?.assetNo === params.data?.assetNo ? "bg-blue-100" : ""
                  }
                  headerHeight={32}
                  rowHeight={28}
                />
              </div>
            </div>

            {/* 오른쪽 - 폼 상세 정보 */}
            <div className="w-3/5 overflow-y-auto pr-2">
              {selectedAssetInfo ? (
                <div className="space-y-4">
                  {/* 기본정보 */}
                  <div>
                    <h3 className="text-xs font-semibold mb-2 pb-1.5 border-b text-gray-800 flex items-center gap-1">
                      <span className="w-1 h-3 bg-blue-500 rounded-sm"></span>
                      기본정보
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {/* Row 1 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">자산번호</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.assetNo} readOnly />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">자산명</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.assetName} readOnly />
                      </div>

                      {/* Row 2 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">자산코드</label>
                        <div className="flex gap-1 flex-1">
                          <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.assetCode} readOnly />
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs shrink-0">
                            <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">자산코드명</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.assetCodeDesc} readOnly />
                      </div>

                      {/* Row 3 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">품목코드</label>
                        <div className="flex gap-1 flex-1">
                          <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.itemCode} readOnly />
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs shrink-0">
                            <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">품목명</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.itemCodeDesc} readOnly />
                      </div>

                      {/* Row 4 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">세목코드</label>
                        <div className="flex gap-1 flex-1">
                          <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.detailCode} readOnly />
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs shrink-0">
                            <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">세목명</label>
                        <Input className="h-7 text-xs flex-1" value="" placeholder="세목명" readOnly />
                      </div>

                      {/* Row 5 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">회계년도</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.fiscalYear} readOnly />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">상각방법</label>
                        <Select value={selectedAssetInfo.depreciationMethod} disabled>
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="정액법">정액법</SelectItem>
                            <SelectItem value="정률법">정률법</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Row 6 */}
                      <div className="flex items-center gap-2 col-span-2">
                        <label className="w-20 text-gray-600 shrink-0">취득전표번호</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.acquireVoucherNo} readOnly />
                      </div>
                    </div>
                  </div>

                  {/* 취득정보 */}
                  <div>
                    <h3 className="text-xs font-semibold mb-2 pb-1.5 border-b text-gray-800 flex items-center gap-1">
                      <span className="w-1 h-3 bg-blue-500 rounded-sm"></span>
                      취득정보
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {/* Row 1 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">취득부서</label>
                        <div className="flex gap-1 flex-1">
                          <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.acquireDeptCode} readOnly />
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs shrink-0">
                            <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">취득거래처</label>
                        <div className="flex gap-1 flex-1">
                          <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.acquireVendorCode} readOnly />
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs shrink-0">
                            <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">취득상태</label>
                        <Select value={selectedAssetInfo.acquireStatus} disabled>
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="신규취득">신규취득</SelectItem>
                            <SelectItem value="무상취득">무상취득</SelectItem>
                            <SelectItem value="기타취득">기타취득</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">취득일자</label>
                        <Input className="h-7 text-xs flex-1" type="date" value={selectedAssetInfo.acquireDate} readOnly />
                      </div>

                      {/* Row 3 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">취득수량</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.acquireQty} readOnly />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">취득금액</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.acquireAmount.toLocaleString("ko-KR")} readOnly />
                      </div>

                      {/* Row 4 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">단위</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.acquireUnit} readOnly />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">내용년수</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.usefulLife} readOnly />
                      </div>

                      {/* Row 5 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">증빙여부</label>
                        <Select value={selectedAssetInfo.evidenceYn} disabled>
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Y</SelectItem>
                            <SelectItem value="N">N</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">계정코드</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.accountCode} readOnly />
                      </div>

                      {/* Row 6 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">지정여부</label>
                        <Select value={selectedAssetInfo.designationYn} disabled>
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Y</SelectItem>
                            <SelectItem value="N">N</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">관리부서</label>
                        <div className="flex gap-1 flex-1">
                          <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.manageDeptCode} readOnly />
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs shrink-0">
                            <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Row 7 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">관리자(정)</label>
                        <div className="flex gap-1 flex-1">
                          <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.managerIdMain} readOnly />
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs shrink-0">
                            <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">관리자(부)</label>
                        <div className="flex gap-1 flex-1">
                          <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.managerIdSub} readOnly />
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs shrink-0">
                            <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Row 8 */}
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">자산상태</label>
                        <Select value={selectedAssetInfo.assetStatus} disabled>
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="정상">정상</SelectItem>
                            <SelectItem value="불용">불용</SelectItem>
                            <SelectItem value="수리중">수리중</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-20 text-gray-600 shrink-0">조사일자</label>
                        <Input className="h-7 text-xs flex-1" type="date" value={selectedAssetInfo.inspectionDate} readOnly />
                      </div>

                      {/* Row 9 */}
                      <div className="flex items-center gap-2 col-span-2">
                        <label className="w-20 text-gray-600 shrink-0">관리번호</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.managementNo} readOnly />
                      </div>

                      {/* Row 10 */}
                      <div className="flex items-center gap-2 col-span-2">
                        <label className="w-20 text-gray-600 shrink-0">규격</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.spec} readOnly />
                      </div>

                      {/* Row 11 */}
                      <div className="flex items-center gap-2 col-span-2">
                        <label className="w-20 text-gray-600 shrink-0">적요사항</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.summary} readOnly />
                      </div>

                      {/* Row 12 */}
                      <div className="flex items-center gap-2 col-span-2">
                        <label className="w-20 text-gray-600 shrink-0">비고</label>
                        <Input className="h-7 text-xs flex-1" value={selectedAssetInfo.memo} readOnly />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  자산을 선택하세요
                </div>
              )}
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex justify-end gap-2 border-t px-4 py-3 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setAssetInfoPopupOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 신규요청서 작성 팝업 */}
      <Dialog open={newRequestPopupOpen} onOpenChange={setNewRequestPopupOpen}>
        <DialogContent className="w-[98vw] max-w-[1600px] h-[850px] flex flex-col p-0 gap-0 [&>button]:hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <DialogTitle className="text-base font-semibold">신규요청서 작성</DialogTitle>
            <button onClick={() => setNewRequestPopupOpen(false)} className="p-1 hover:bg-gray-100 rounded">
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
            </button>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            {/* 회사정보 헤더 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">회사코드:</span>
                  <span className="text-sm text-blue-900">IYCNC001</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">회사명:</span>
                  <span className="text-sm text-blue-900">(주)아이와이씨앤씨</span>
                </div>
              </div>
            </div>

            {/* 검색 필드 영역 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 인수업체 검색 */}
              <div className="flex items-center gap-2">
                <label className="w-20 text-sm font-medium shrink-0">인수업체</label>
                <Input
                  className="h-8 text-sm flex-1"
                  placeholder="업체명 검색"
                  value={receiverCompanySearch}
                  onChange={(e) => setReceiverCompanySearch(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={() => setReceiverCompanyPopupOpen(true)}>
                  <HugeiconsIcon icon={Search01Icon} className="h-4 w-4" />
                </Button>
                {selectedReceiverCompany && (
                  <span className="text-sm text-gray-600 ml-2">{selectedReceiverCompany.name}</span>
                )}
              </div>

              {/* 구매담당자 검색 */}
              <div className="flex items-center gap-2">
                <label className="w-20 text-sm font-medium shrink-0">구매담당자</label>
                <Input
                  className="h-8 text-sm flex-1"
                  placeholder="담당자 검색"
                  value={purchaseManagerSearch}
                  onChange={(e) => setPurchaseManagerSearch(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={() => setPurchaseManagerPopupOpen(true)}>
                  <HugeiconsIcon icon={Search01Icon} className="h-4 w-4" />
                </Button>
                {selectedPurchaseManager && (
                  <span className="text-sm text-gray-600 ml-2">{selectedPurchaseManager.name} ({selectedPurchaseManager.department})</span>
                )}
              </div>
            </div>

            {/* 요청서 정보 행 */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 border">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">요청일자</label>
                <Input
                  type="date"
                  className="h-8 text-sm w-40"
                  value={newRequestDate}
                  onChange={(e) => setNewRequestDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">요청번호</label>
                <span className="text-sm text-gray-600">자동생성</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <HugeiconsIcon icon={Add01Icon} className="mr-1 h-4 w-4" />
                  금형등록
                </Button>
                <Button variant="outline" size="sm">
                  <HugeiconsIcon icon={Delete01Icon} className="mr-1 h-4 w-4" />
                  삭제
                </Button>
                <Button variant="default" size="sm">
                  제출
                </Button>
                <Button variant="outline" size="sm" onClick={() => setNewRequestPopupOpen(false)}>
                  목록
                </Button>
              </div>
            </div>

            {/* AG Grid 영역 */}
            <div className="ag-theme-alpine flex-1 overflow-auto">
              <AgGridReact
                rowData={newRequestMoldData}
                columnDefs={[
                  { field: "moldCode", headerName: "금형코드", width: 140, minWidth: 120, headerCheckboxSelection: true, checkboxSelection: true, tooltipField: "moldCode" },
                  { field: "moldName", headerName: "금형명", width: 180, minWidth: 150, tooltipField: "moldName" },
                  { field: "factory", headerName: "공장", width: 100, minWidth: 80 },
                  { field: "moldStatus", headerName: "금형상태", width: 100, minWidth: 80 },
                  { field: "modelName", headerName: "모델명", width: 150, minWidth: 120, tooltipField: "modelName" },
                  { field: "partCode", headerName: "부품코드", width: 140, minWidth: 120, tooltipField: "partCode" },
                  { field: "partName", headerName: "부품명", width: 160, minWidth: 130, tooltipField: "partName" },
                  { field: "warrantyShot", headerName: "보증SHOT", width: 110, minWidth: 90, valueFormatter: (params) => params.value?.toLocaleString() },
                  { field: "actualShot", headerName: "SHOT실적", width: 110, minWidth: 90, valueFormatter: (params) => params.value?.toLocaleString() },
                  { field: "storageLocation", headerName: "실보관처", width: 130, minWidth: 100, tooltipField: "storageLocation" },
                  { field: "useStatus", headerName: "사용상태", width: 100, minWidth: 80 },
                ]}
                defaultColDef={{
                  sortable: true,
                  filter: true,
                  resizable: true,
                  suppressMovable: true,
                }}
                rowSelection="multiple"
                domLayout="normal"
                headerHeight={34}
                rowHeight={30}
              />
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between border-t px-4 py-3 shrink-0">
            <span className="text-sm text-muted-foreground">
              {newRequestMoldData.length}건
            </span>
            <Button variant="outline" size="sm" onClick={() => setNewRequestPopupOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 인수업체 검색 팝업 */}
      <Dialog open={receiverCompanyPopupOpen} onOpenChange={setReceiverCompanyPopupOpen}>
        <DialogContent className="w-[600px] max-h-[500px] flex flex-col p-0 gap-0" showCloseButton={false}>
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <DialogTitle className="text-base font-semibold">인수업체 검색</DialogTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setReceiverCompanyPopupOpen(false)}>
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {dummyReceiverCompanyData
                .filter(c => c.name.includes(receiverCompanySearch) || c.code.includes(receiverCompanySearch))
                .map((company) => (
                  <div
                    key={company.code}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedReceiverCompany(company)
                      setReceiverCompanySearch(company.name)
                      setReceiverCompanyPopupOpen(false)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{company.name}</div>
                        <div className="text-xs text-gray-500">{company.code}</div>
                      </div>
                      <div className="text-xs text-gray-500">{company.contact}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{company.address}</div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 구매담당자 검색 팝업 */}
      <Dialog open={purchaseManagerPopupOpen} onOpenChange={setPurchaseManagerPopupOpen}>
        <DialogContent className="w-[500px] max-h-[400px] flex flex-col p-0 gap-0" showCloseButton={false}>
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <DialogTitle className="text-base font-semibold">구매담당자 검색</DialogTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPurchaseManagerPopupOpen(false)}>
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {dummyPurchaseManagerData
                .filter(m => m.name.includes(purchaseManagerSearch) || m.department.includes(purchaseManagerSearch))
                .map((manager) => (
                  <div
                    key={manager.code}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedPurchaseManager(manager)
                      setPurchaseManagerSearch(manager.name)
                      setPurchaseManagerPopupOpen(false)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{manager.name}</div>
                        <div className="text-xs text-gray-500">{manager.department}</div>
                      </div>
                      <div className="text-xs text-gray-500">{manager.contact}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 편집 가능 셀 스타일 */}
      <style jsx global>{`
        .editable-cell {
          background-color: #fffef0 !important;
        }
        .ag-header-cell.bg-blue-50 .ag-header-cell-label {
          background-color: #eff6ff;
        }
      `}</style>
    </div>
  )
}
