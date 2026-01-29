"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, ColGroupDef, GridReadyEvent, GridApi, ICellRendererParams } from "ag-grid-community"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogTitle,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FileExportIcon,
  PrinterIcon,
  File01Icon,
  ArrowDataTransferHorizontalIcon,
  Cancel01Icon,
  ViewIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons"

ModuleRegistry.registerModules([AllCommunityModule])

// 부품 데이터 타입
interface PartData {
  partCode: string
  partName: string
  occurDate: string
  useStatus: string
}

// 선택된 금형 정보 타입 (inspection 팝업용)
interface SelectedMoldInfo {
  moldCode: string
  moldName: string
  manufacturer: string
}

// 금형별 부품 데이터 (더미)
const getPartsDataForMold = (moldCode: string): PartData[] => {
  const baseParts: PartData[] = [
    { partCode: "P001", partName: "상부 코어", occurDate: "2024-01-15", useStatus: "사용중" },
    { partCode: "P002", partName: "하부 코어", occurDate: "2024-01-15", useStatus: "사용중" },
    { partCode: "P003", partName: "이젝터 핀", occurDate: "2024-02-01", useStatus: "교체예정" },
    { partCode: "P004", partName: "슬라이드 코어", occurDate: "2024-01-20", useStatus: "사용중" },
    { partCode: "P005", partName: "가이드 핀", occurDate: "2024-01-20", useStatus: "사용중" },
    { partCode: "P006", partName: "냉각 블록", occurDate: "2024-02-10", useStatus: "사용중" },
    { partCode: "P007", partName: "노즐 팁", occurDate: "2024-02-10", useStatus: "교체완료" },
    { partCode: "P008", partName: "스프루 부싱", occurDate: "2024-02-15", useStatus: "사용중" },
  ]
  const numParts = 2 + (parseInt(moldCode.replace(/\D/g, "")) % 5)
  return baseParts.slice(0, numParts)
}

// 점검현황 팝업용 더미 데이터 - 금형/자산 점검 현황
const inspectionDummyData = [
  { id: 1, moldCode: "MLD-2024-001", moldName: "프론트범퍼 금형 A", factory: "본사공장", moldStatus: "정상", modelName: "AVANTE CN7", partCode: "BMP-001", partName: "프론트범퍼", assetCode: "AST-001", buyer: "현대자동차", manufacturer: "삼성금형", shotCount: 125000, storageLocation: "금형창고 A-1", useStatus: "가동중", progressStep: "양산", changeDate: "2024-01-15", transferStatus: "전송완료" },
  { id: 2, moldCode: "MLD-2024-002", moldName: "리어범퍼 금형 A", factory: "본사공장", moldStatus: "정상", modelName: "AVANTE CN7", partCode: "BMP-002", partName: "리어범퍼", assetCode: "AST-002", buyer: "현대자동차", manufacturer: "삼성금형", shotCount: 118000, storageLocation: "금형창고 A-2", useStatus: "가동중", progressStep: "양산", changeDate: "2024-01-15", transferStatus: "전송완료" },
  { id: 3, moldCode: "MLD-2024-003", moldName: "사이드미러 커버 금형", factory: "제2공장", moldStatus: "수리중", modelName: "SONATA DN8", partCode: "MRR-001", partName: "사이드미러커버", assetCode: "AST-003", buyer: "현대자동차", manufacturer: "대우금형", shotCount: 89000, storageLocation: "금형창고 B-1", useStatus: "수리중", progressStep: "양산", changeDate: "2024-02-10", transferStatus: "미전송" },
  { id: 4, moldCode: "MLD-2024-004", moldName: "대시보드 금형 A", factory: "본사공장", moldStatus: "정상", modelName: "TUCSON NX4", partCode: "DSH-001", partName: "대시보드", assetCode: "AST-004", buyer: "현대자동차", manufacturer: "한국금형", shotCount: 156000, storageLocation: "금형창고 A-3", useStatus: "가동중", progressStep: "양산", changeDate: "2024-01-20", transferStatus: "전송완료" },
  { id: 5, moldCode: "MLD-2024-005", moldName: "도어트림 금형 좌측", factory: "제2공장", moldStatus: "정상", modelName: "GRANDEUR GN7", partCode: "TRM-001", partName: "도어트림 LH", assetCode: "AST-005", buyer: "현대자동차", manufacturer: "삼성금형", shotCount: 67000, storageLocation: "금형창고 B-2", useStatus: "가동중", progressStep: "양산", changeDate: "2024-02-05", transferStatus: "전송완료" },
  { id: 6, moldCode: "MLD-2024-006", moldName: "도어트림 금형 우측", factory: "제2공장", moldStatus: "정상", modelName: "GRANDEUR GN7", partCode: "TRM-002", partName: "도어트림 RH", assetCode: "AST-006", buyer: "현대자동차", manufacturer: "삼성금형", shotCount: 67500, storageLocation: "금형창고 B-3", useStatus: "가동중", progressStep: "양산", changeDate: "2024-02-05", transferStatus: "전송완료" },
  { id: 7, moldCode: "MLD-2024-007", moldName: "헤드램프 하우징 금형", factory: "본사공장", moldStatus: "점검필요", modelName: "K5 DL3", partCode: "LMP-001", partName: "헤드램프하우징", assetCode: "AST-007", buyer: "기아자동차", manufacturer: "대우금형", shotCount: 145000, storageLocation: "금형창고 A-4", useStatus: "대기중", progressStep: "점검", changeDate: "2024-03-01", transferStatus: "미전송" },
  { id: 8, moldCode: "MLD-2024-008", moldName: "테일램프 하우징 금형", factory: "본사공장", moldStatus: "정상", modelName: "K5 DL3", partCode: "LMP-002", partName: "테일램프하우징", assetCode: "AST-008", buyer: "기아자동차", manufacturer: "대우금형", shotCount: 132000, storageLocation: "금형창고 A-5", useStatus: "가동중", progressStep: "양산", changeDate: "2024-02-20", transferStatus: "전송완료" },
  { id: 9, moldCode: "MLD-2024-009", moldName: "센터콘솔 금형", factory: "제3공장", moldStatus: "정상", modelName: "SORENTO MQ4", partCode: "CNS-001", partName: "센터콘솔", assetCode: "AST-009", buyer: "기아자동차", manufacturer: "한국금형", shotCount: 78000, storageLocation: "금형창고 C-1", useStatus: "가동중", progressStep: "양산", changeDate: "2024-02-25", transferStatus: "전송완료" },
  { id: 10, moldCode: "MLD-2024-010", moldName: "글로브박스 금형", factory: "제3공장", moldStatus: "정상", modelName: "SORENTO MQ4", partCode: "GBX-001", partName: "글로브박스", assetCode: "AST-010", buyer: "기아자동차", manufacturer: "한국금형", shotCount: 75000, storageLocation: "금형창고 C-2", useStatus: "가동중", progressStep: "양산", changeDate: "2024-02-25", transferStatus: "전송완료" },
  { id: 11, moldCode: "MLD-2024-011", moldName: "라디에이터 그릴 금형", factory: "본사공장", moldStatus: "정상", modelName: "PALISADE LX2", partCode: "GRL-001", partName: "라디에이터그릴", assetCode: "AST-011", buyer: "현대자동차", manufacturer: "삼성금형", shotCount: 95000, storageLocation: "금형창고 A-6", useStatus: "가동중", progressStep: "양산", changeDate: "2024-01-25", transferStatus: "전송완료" },
  { id: 12, moldCode: "MLD-2024-012", moldName: "펜더라이너 금형 좌측", factory: "제2공장", moldStatus: "폐기예정", modelName: "VELOSTER JS", partCode: "FNL-001", partName: "펜더라이너 LH", assetCode: "AST-012", buyer: "현대자동차", manufacturer: "대우금형", shotCount: 280000, storageLocation: "폐기대기구역", useStatus: "미사용", progressStep: "폐기", changeDate: "2024-03-05", transferStatus: "미전송" },
  { id: 13, moldCode: "MLD-2024-013", moldName: "휠아치 몰딩 금형", factory: "제2공장", moldStatus: "정상", modelName: "SANTA FE TM", partCode: "WHL-001", partName: "휠아치몰딩", assetCode: "AST-013", buyer: "현대자동차", manufacturer: "한국금형", shotCount: 112000, storageLocation: "금형창고 B-4", useStatus: "가동중", progressStep: "양산", changeDate: "2024-02-15", transferStatus: "전송완료" },
  { id: 14, moldCode: "MLD-2024-014", moldName: "에어덕트 금형", factory: "본사공장", moldStatus: "정상", modelName: "IONIQ 6 CE", partCode: "ADT-001", partName: "에어덕트", assetCode: "AST-014", buyer: "현대자동차", manufacturer: "삼성금형", shotCount: 45000, storageLocation: "금형창고 A-7", useStatus: "가동중", progressStep: "양산", changeDate: "2024-03-10", transferStatus: "전송완료" },
  { id: 15, moldCode: "MLD-2024-015", moldName: "카울탑 커버 금형", factory: "제3공장", moldStatus: "수리중", modelName: "EV6 CV", partCode: "CWT-001", partName: "카울탑커버", assetCode: "AST-015", buyer: "기아자동차", manufacturer: "대우금형", shotCount: 52000, storageLocation: "수리공장", useStatus: "수리중", progressStep: "수리", changeDate: "2024-03-08", transferStatus: "미전송" },
  { id: 16, moldCode: "MLD-2024-016", moldName: "스포일러 금형", factory: "본사공장", moldStatus: "정상", modelName: "STINGER CK", partCode: "SPL-001", partName: "리어스포일러", assetCode: "AST-016", buyer: "기아자동차", manufacturer: "삼성금형", shotCount: 38000, storageLocation: "금형창고 A-8", useStatus: "가동중", progressStep: "양산", changeDate: "2024-02-28", transferStatus: "전송완료" },
  { id: 17, moldCode: "MLD-2024-017", moldName: "사이드스텝 금형", factory: "제2공장", moldStatus: "정상", modelName: "MOHAVE HM", partCode: "STP-001", partName: "사이드스텝", assetCode: "AST-017", buyer: "기아자동차", manufacturer: "한국금형", shotCount: 62000, storageLocation: "금형창고 B-5", useStatus: "가동중", progressStep: "양산", changeDate: "2024-02-18", transferStatus: "전송완료" },
  { id: 18, moldCode: "MLD-2024-018", moldName: "도어핸들 금형 외측", factory: "본사공장", moldStatus: "정상", modelName: "GENESIS G80 RG3", partCode: "HDL-001", partName: "도어핸들 외측", assetCode: "AST-018", buyer: "제네시스", manufacturer: "삼성금형", shotCount: 88000, storageLocation: "금형창고 A-9", useStatus: "가동중", progressStep: "양산", changeDate: "2024-01-30", transferStatus: "전송완료" },
  { id: 19, moldCode: "MLD-2024-019", moldName: "도어핸들 금형 내측", factory: "본사공장", moldStatus: "정상", modelName: "GENESIS G80 RG3", partCode: "HDL-002", partName: "도어핸들 내측", assetCode: "AST-019", buyer: "제네시스", manufacturer: "삼성금형", shotCount: 86000, storageLocation: "금형창고 A-10", useStatus: "가동중", progressStep: "양산", changeDate: "2024-01-30", transferStatus: "전송완료" },
  { id: 20, moldCode: "MLD-2024-020", moldName: "시트커버 금형 전면", factory: "제3공장", moldStatus: "점검필요", modelName: "GENESIS GV70 JK", partCode: "SCR-001", partName: "시트커버 전면", assetCode: "AST-020", buyer: "제네시스", manufacturer: "대우금형", shotCount: 135000, storageLocation: "금형창고 C-3", useStatus: "대기중", progressStep: "점검", changeDate: "2024-03-12", transferStatus: "미전송" },
]

const INSPECTION_PAGE_SIZE = 30

// 자산등록대상 더미 데이터 (자산정보 팝업용)
const assetRegistrationTargetData = [
  { id: 1, selected: false, execNo: "EXC-2024-001", execDate: "2024-01-10", contractNo: "CNT-2024-0051", itemName: "엔진블록 주조금형", quantity: 1, unitPrice: 45000000, amount: 45000000, image: "/images/assets/engine-block.png" },
  { id: 2, selected: false, execNo: "EXC-2024-002", execDate: "2024-01-15", contractNo: "CNT-2024-0052", itemName: "실린더헤드 다이캐스팅금형", quantity: 2, unitPrice: 38000000, amount: 76000000, image: "/images/assets/engine-block.png" },
  { id: 3, selected: false, execNo: "EXC-2024-003", execDate: "2024-01-20", contractNo: "CNT-2024-0053", itemName: "크랭크샤프트 단조금형", quantity: 1, unitPrice: 52000000, amount: 52000000, image: "/images/assets/engine-block.png" },
  { id: 4, selected: false, execNo: "EXC-2024-004", execDate: "2024-02-01", contractNo: "CNT-2024-0054", itemName: "캠샤프트 성형금형", quantity: 3, unitPrice: 28000000, amount: 84000000, image: "/images/assets/engine-block.png" },
  { id: 5, selected: false, execNo: "EXC-2024-005", execDate: "2024-02-10", contractNo: "CNT-2024-0055", itemName: "피스톤 주조금형", quantity: 4, unitPrice: 15000000, amount: 60000000, image: "/images/assets/engine-block.png" },
]

// 자산등록 테이블 더미 데이터 (자산정보 팝업용)
const assetRegistrationData = [
  { id: 1, assetNo: "AST-2024-001", assetName: "엔진블록 주조금형 A", majorCategory: "금형", middleCategory: "주조금형", minorCategory: "엔진금형", manageDept: "생산1팀", operLocation: "본사공장 A동", acquisitionDate: "2024-01-15", quantity: 1, unit: "SET", unitPrice: 45000000, amount: 45000000 },
  { id: 2, assetNo: "AST-2024-002", assetName: "실린더헤드 다이캐스팅금형 L", majorCategory: "금형", middleCategory: "다이캐스팅", minorCategory: "엔진금형", manageDept: "생산1팀", operLocation: "본사공장 A동", acquisitionDate: "2024-01-20", quantity: 1, unit: "SET", unitPrice: 38000000, amount: 38000000 },
  { id: 3, assetNo: "AST-2024-003", assetName: "실린더헤드 다이캐스팅금형 R", majorCategory: "금형", middleCategory: "다이캐스팅", minorCategory: "엔진금형", manageDept: "생산1팀", operLocation: "본사공장 A동", acquisitionDate: "2024-01-20", quantity: 1, unit: "SET", unitPrice: 38000000, amount: 38000000 },
  { id: 4, assetNo: "AST-2024-004", assetName: "크랭크샤프트 단조금형", majorCategory: "금형", middleCategory: "단조금형", minorCategory: "구동계금형", manageDept: "생산2팀", operLocation: "제2공장 B동", acquisitionDate: "2024-02-05", quantity: 1, unit: "SET", unitPrice: 52000000, amount: 52000000 },
  { id: 5, assetNo: "AST-2024-005", assetName: "캠샤프트 성형금형 A", majorCategory: "금형", middleCategory: "성형금형", minorCategory: "구동계금형", manageDept: "생산2팀", operLocation: "제2공장 B동", acquisitionDate: "2024-02-15", quantity: 1, unit: "SET", unitPrice: 28000000, amount: 28000000 },
]

// 더미 데이터 - 자동차부품
const dummyData = [
  { assetNo: "AP2024001", assetName: "엔진오일 5W-30 합성유", assetCode: "ENG01", assetCodeName: "엔진부품", itemCode: "OIL001", itemCodeName: "엔진오일", acquisitionDate: "2024-01-05", acquisitionAmount: 45000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024002", assetName: "점화플러그 이리듐", assetCode: "ENG01", assetCodeName: "엔진부품", itemCode: "SPK001", itemCodeName: "점화플러그", acquisitionDate: "2024-01-08", acquisitionAmount: 12000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024003", assetName: "에어필터 고효율", assetCode: "ENG01", assetCodeName: "엔진부품", itemCode: "FLT001", itemCodeName: "에어필터", acquisitionDate: "2024-01-10", acquisitionAmount: 25000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024004", assetName: "연료필터 디젤용", assetCode: "ENG01", assetCodeName: "엔진부품", itemCode: "FLT002", itemCodeName: "연료필터", acquisitionDate: "2024-01-12", acquisitionAmount: 35000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024005", assetName: "타이밍벨트 강화형", assetCode: "ENG01", assetCodeName: "엔진부품", itemCode: "BLT001", itemCodeName: "타이밍벨트", acquisitionDate: "2024-01-15", acquisitionAmount: 85000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024006", assetName: "브레이크패드 세라믹", assetCode: "BRK01", assetCodeName: "브레이크부품", itemCode: "PAD001", itemCodeName: "브레이크패드", acquisitionDate: "2024-01-18", acquisitionAmount: 65000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024007", assetName: "브레이크디스크 벤틸레이티드", assetCode: "BRK01", assetCodeName: "브레이크부품", itemCode: "DSC001", itemCodeName: "브레이크디스크", acquisitionDate: "2024-01-20", acquisitionAmount: 120000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024008", assetName: "브레이크호스 스테인리스", assetCode: "BRK01", assetCodeName: "브레이크부품", itemCode: "HSE001", itemCodeName: "브레이크호스", acquisitionDate: "2024-01-22", acquisitionAmount: 45000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024009", assetName: "브레이크캘리퍼 4피스톤", assetCode: "BRK01", assetCodeName: "브레이크부품", itemCode: "CAL001", itemCodeName: "브레이크캘리퍼", acquisitionDate: "2024-01-25", acquisitionAmount: 280000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024010", assetName: "쇼크업소버 가스충전식", assetCode: "SUS01", assetCodeName: "서스펜션부품", itemCode: "SHK001", itemCodeName: "쇼크업소버", acquisitionDate: "2024-01-28", acquisitionAmount: 95000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024011", assetName: "코일스프링 강화형", assetCode: "SUS01", assetCodeName: "서스펜션부품", itemCode: "SPR001", itemCodeName: "코일스프링", acquisitionDate: "2024-02-01", acquisitionAmount: 75000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024012", assetName: "로워암 부싱 폴리우레탄", assetCode: "SUS01", assetCodeName: "서스펜션부품", itemCode: "BSH001", itemCodeName: "서스펜션부싱", acquisitionDate: "2024-02-03", acquisitionAmount: 35000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024013", assetName: "스태빌라이저 링크", assetCode: "SUS01", assetCodeName: "서스펜션부품", itemCode: "LNK001", itemCodeName: "스태빌라이저링크", acquisitionDate: "2024-02-05", acquisitionAmount: 28000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024014", assetName: "배터리 AGM 80Ah", assetCode: "ELC01", assetCodeName: "전장부품", itemCode: "BAT001", itemCodeName: "자동차배터리", acquisitionDate: "2024-02-08", acquisitionAmount: 180000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024015", assetName: "알터네이터 150A", assetCode: "ELC01", assetCodeName: "전장부품", itemCode: "ALT001", itemCodeName: "알터네이터", acquisitionDate: "2024-02-10", acquisitionAmount: 320000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024016", assetName: "스타터모터 1.4kW", assetCode: "ELC01", assetCodeName: "전장부품", itemCode: "STR001", itemCodeName: "스타터모터", acquisitionDate: "2024-02-12", acquisitionAmount: 250000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024017", assetName: "이그니션코일 다이렉트", assetCode: "ELC01", assetCodeName: "전장부품", itemCode: "IGN001", itemCodeName: "이그니션코일", acquisitionDate: "2024-02-15", acquisitionAmount: 55000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024018", assetName: "라디에이터 알루미늄", assetCode: "COL01", assetCodeName: "냉각부품", itemCode: "RAD001", itemCodeName: "라디에이터", acquisitionDate: "2024-02-18", acquisitionAmount: 185000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024019", assetName: "워터펌프 고유량", assetCode: "COL01", assetCodeName: "냉각부품", itemCode: "WPM001", itemCodeName: "워터펌프", acquisitionDate: "2024-02-20", acquisitionAmount: 95000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024020", assetName: "써모스탯 82도", assetCode: "COL01", assetCodeName: "냉각부품", itemCode: "THM001", itemCodeName: "써모스탯", acquisitionDate: "2024-02-22", acquisitionAmount: 25000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024021", assetName: "냉각팬 전동식", assetCode: "COL01", assetCodeName: "냉각부품", itemCode: "FAN001", itemCodeName: "냉각팬", acquisitionDate: "2024-02-25", acquisitionAmount: 145000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024022", assetName: "머플러 스테인리스", assetCode: "EXH01", assetCodeName: "배기부품", itemCode: "MFL001", itemCodeName: "머플러", acquisitionDate: "2024-02-28", acquisitionAmount: 220000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024023", assetName: "촉매변환기 삼원촉매", assetCode: "EXH01", assetCodeName: "배기부품", itemCode: "CAT001", itemCodeName: "촉매변환기", acquisitionDate: "2024-03-02", acquisitionAmount: 580000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024024", assetName: "배기매니폴드 스테인리스", assetCode: "EXH01", assetCodeName: "배기부품", itemCode: "MNF001", itemCodeName: "배기매니폴드", acquisitionDate: "2024-03-05", acquisitionAmount: 320000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024025", assetName: "산소센서 광대역", assetCode: "EXH01", assetCodeName: "배기부품", itemCode: "O2S001", itemCodeName: "산소센서", acquisitionDate: "2024-03-08", acquisitionAmount: 85000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024026", assetName: "파워스티어링펌프 전동식", assetCode: "STR01", assetCodeName: "조향부품", itemCode: "PSP001", itemCodeName: "파워스티어링펌프", acquisitionDate: "2024-03-10", acquisitionAmount: 380000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024027", assetName: "타이로드엔드 강화형", assetCode: "STR01", assetCodeName: "조향부품", itemCode: "TRE001", itemCodeName: "타이로드엔드", acquisitionDate: "2024-03-12", acquisitionAmount: 45000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024028", assetName: "스티어링랙 유압식", assetCode: "STR01", assetCodeName: "조향부품", itemCode: "RAK001", itemCodeName: "스티어링랙", acquisitionDate: "2024-03-15", acquisitionAmount: 650000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024029", assetName: "볼조인트 내구성강화", assetCode: "STR01", assetCodeName: "조향부품", itemCode: "BJT001", itemCodeName: "볼조인트", acquisitionDate: "2024-03-18", acquisitionAmount: 38000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024030", assetName: "클러치디스크 세라믹", assetCode: "TRN01", assetCodeName: "변속기부품", itemCode: "CLT001", itemCodeName: "클러치디스크", acquisitionDate: "2024-03-20", acquisitionAmount: 180000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024031", assetName: "클러치압력판 강화형", assetCode: "TRN01", assetCodeName: "변속기부품", itemCode: "CLT002", itemCodeName: "클러치압력판", acquisitionDate: "2024-03-22", acquisitionAmount: 220000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024032", assetName: "미션오일 ATF", assetCode: "TRN01", assetCodeName: "변속기부품", itemCode: "OIL002", itemCodeName: "미션오일", acquisitionDate: "2024-03-25", acquisitionAmount: 35000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024033", assetName: "드라이브샤프트 CV조인트", assetCode: "TRN01", assetCodeName: "변속기부품", itemCode: "SFT001", itemCodeName: "드라이브샤프트", acquisitionDate: "2024-03-28", acquisitionAmount: 280000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024034", assetName: "헤드라이트 LED", assetCode: "LGT01", assetCodeName: "조명부품", itemCode: "HLD001", itemCodeName: "헤드라이트", acquisitionDate: "2024-04-01", acquisitionAmount: 450000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024035", assetName: "테일램프 LED", assetCode: "LGT01", assetCodeName: "조명부품", itemCode: "TLL001", itemCodeName: "테일램프", acquisitionDate: "2024-04-03", acquisitionAmount: 180000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024036", assetName: "안개등 할로겐", assetCode: "LGT01", assetCodeName: "조명부품", itemCode: "FGL001", itemCodeName: "안개등", acquisitionDate: "2024-04-05", acquisitionAmount: 75000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024037", assetName: "사이드미러 전동접이식", assetCode: "BDY01", assetCodeName: "차체부품", itemCode: "MRR001", itemCodeName: "사이드미러", acquisitionDate: "2024-04-08", acquisitionAmount: 165000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024038", assetName: "범퍼 전면 PP소재", assetCode: "BDY01", assetCodeName: "차체부품", itemCode: "BMP001", itemCodeName: "프론트범퍼", acquisitionDate: "2024-04-10", acquisitionAmount: 280000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024039", assetName: "후드 알루미늄", assetCode: "BDY01", assetCodeName: "차체부품", itemCode: "HOD001", itemCodeName: "후드", acquisitionDate: "2024-04-12", acquisitionAmount: 520000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024040", assetName: "펜더 좌측", assetCode: "BDY01", assetCodeName: "차체부품", itemCode: "FND001", itemCodeName: "펜더", acquisitionDate: "2024-04-15", acquisitionAmount: 185000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024041", assetName: "와이퍼블레이드 실리콘", assetCode: "ACC01", assetCodeName: "액세서리", itemCode: "WPR001", itemCodeName: "와이퍼블레이드", acquisitionDate: "2024-04-18", acquisitionAmount: 28000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024042", assetName: "에어컨컴프레서 인버터", assetCode: "ACC01", assetCodeName: "액세서리", itemCode: "ACM001", itemCodeName: "에어컨컴프레서", acquisitionDate: "2024-04-20", acquisitionAmount: 480000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024043", assetName: "에어컨콘덴서 고효율", assetCode: "ACC01", assetCodeName: "액세서리", itemCode: "CND001", itemCodeName: "에어컨콘덴서", acquisitionDate: "2024-04-22", acquisitionAmount: 185000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024044", assetName: "휠베어링 허브일체형", assetCode: "WHL01", assetCodeName: "휠부품", itemCode: "BRG001", itemCodeName: "휠베어링", acquisitionDate: "2024-04-25", acquisitionAmount: 125000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024045", assetName: "알로이휠 18인치", assetCode: "WHL01", assetCodeName: "휠부품", itemCode: "WHL001", itemCodeName: "알로이휠", acquisitionDate: "2024-04-28", acquisitionAmount: 350000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024046", assetName: "타이어 225/45R18", assetCode: "WHL01", assetCodeName: "휠부품", itemCode: "TIR001", itemCodeName: "타이어", acquisitionDate: "2024-05-01", acquisitionAmount: 180000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024047", assetName: "ABS센서 휠스피드", assetCode: "ELC01", assetCodeName: "전장부품", itemCode: "ABS001", itemCodeName: "ABS센서", acquisitionDate: "2024-05-03", acquisitionAmount: 65000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024048", assetName: "크랭크샤프트센서", assetCode: "ELC01", assetCodeName: "전장부품", itemCode: "CRK001", itemCodeName: "크랭크샤프트센서", acquisitionDate: "2024-05-05", acquisitionAmount: 55000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
  { assetNo: "AP2024049", assetName: "캠샤프트센서", assetCode: "ELC01", assetCodeName: "전장부품", itemCode: "CAM001", itemCodeName: "캠샤프트센서", acquisitionDate: "2024-05-08", acquisitionAmount: 48000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "PRD", managementDeptName: "생산팀" },
  { assetNo: "AP2024050", assetName: "연료인젝터 GDI", assetCode: "ENG01", assetCodeName: "엔진부품", itemCode: "INJ001", itemCodeName: "연료인젝터", acquisitionDate: "2024-05-10", acquisitionAmount: 145000, acquisitionDeptCode: "PRD", acquisitionDeptName: "생산팀", managementDeptCode: "QC", managementDeptName: "품질관리팀" },
]

const PAGE_SIZE = 30

export default function AssetUsageInquiryPage() {
  const gridRef = useRef<AgGridReact>(null)
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [rowData] = useState(dummyData)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  // 자산점검현황 팝업 상태
  const [inspectionPopupOpen, setInspectionPopupOpen] = useState(false)
  const [inspDisplayCount, setInspDisplayCount] = useState(INSPECTION_PAGE_SIZE)
  const inspectionGridRef = useRef<AgGridReact>(null)
  const [inspectionGridApi, setInspectionGridApi] = useState<GridApi | null>(null)

  // 자산점검현황 팝업 검색 필터 상태
  const [inspFactory, setInspFactory] = useState("")
  const [inspTransferStatus, setInspTransferStatus] = useState("")
  const [inspMoldCode, setInspMoldCode] = useState("")
  const [inspPartCode, setInspPartCode] = useState("")
  const [inspAssetCode, setInspAssetCode] = useState("")
  const [inspBuyerCode, setInspBuyerCode] = useState("")
  const [inspMoldStatus, setInspMoldStatus] = useState("")
  const [inspProgressStep, setInspProgressStep] = useState("")
  const [inspUseStatus, setInspUseStatus] = useState("")

  // 부품조회 팝업 상태 (inspection 팝업 내부)
  const [partsPopupOpen, setPartsPopupOpen] = useState(false)
  const [selectedMold, setSelectedMold] = useState<SelectedMoldInfo | null>(null)
  const [partsData, setPartsData] = useState<PartData[]>([])

  // 자산정보 팝업 상태
  const [assetInfoPopupOpen, setAssetInfoPopupOpen] = useState(false)
  const [assetInfoTab, setAssetInfoTab] = useState<"자산대장" | "자산상세" | "자산등록" | "금형등록">("자산등록")

  // 금형등록 팝업 상태
  const [moldRegistrationPopupOpen, setMoldRegistrationPopupOpen] = useState(false)
  const [moldMasterSubTab, setMoldMasterSubTab] = useState<"공정정보" | "부품정보" | "도면/문서">("공정정보")
  const [selectedAssetTarget, setSelectedAssetTarget] = useState<typeof assetRegistrationTargetData[0] | null>(null)

  // 검색 필터 상태
  const [companyCode, setCompanyCode] = useState("A101")
  const [acquisitionDeptCode, setAcquisitionDeptCode] = useState("")
  const [acquisitionDeptName, setAcquisitionDeptName] = useState("")
  const [acquisitionDateFrom, setAcquisitionDateFrom] = useState("")
  const [acquisitionDateTo, setAcquisitionDateTo] = useState("")
  const [assetCode, setAssetCode] = useState("")
  const [assetCodeName, setAssetCodeName] = useState("")
  const [itemCode, setItemCode] = useState("")
  const [itemCodeName, setItemCodeName] = useState("")
  const [supplierCode, setSupplierCode] = useState("")
  const [supplierName, setSupplierName] = useState("")

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
  }, [])

  const onInspectionGridReady = useCallback((params: GridReadyEvent) => {
    setInspectionGridApi(params.api)
  }, [])

  // 자산명칭 클릭 핸들러 - 자산점검현황 팝업 열기
  const handleAssetNameClick = useCallback(() => {
    setInspectionPopupOpen(true)
  }, [])

  // 금형명 클릭 핸들러 - 부품조회 팝업 열기
  const handleMoldNameClick = useCallback((data: typeof inspectionDummyData[0]) => {
    setSelectedMold({
      moldCode: data.moldCode,
      moldName: data.moldName,
      manufacturer: data.manufacturer,
    })
    setPartsData(getPartsDataForMold(data.moldCode))
    setPartsPopupOpen(true)
  }, [])

  // Inspection 팝업 컬럼 정의 (17개 컬럼)
  const inspectionColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "",
        field: "id",
        width: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        cellClass: "text-center",
      },
      {
        headerName: "금형코드",
        field: "moldCode",
        width: 130,
        cellClass: "text-center",
      },
      {
        headerName: "금형명",
        field: "moldName",
        width: 200,
        flex: 1,
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span
              className="cursor-pointer text-blue-600 hover:underline"
              onClick={() => handleMoldNameClick(params.data)}
            >
              {params.value}
            </span>
          )
        },
      },
      {
        headerName: "공장",
        field: "factory",
        width: 100,
        cellClass: "text-center",
      },
      {
        headerName: "금형상태",
        field: "moldStatus",
        width: 100,
        cellClass: "text-center",
      },
      {
        headerName: "모델명",
        field: "modelName",
        width: 140,
      },
      {
        headerName: "부품코드",
        field: "partCode",
        width: 100,
        cellClass: "text-center",
      },
      {
        headerName: "부품명",
        field: "partName",
        width: 140,
      },
      {
        headerName: "자산코드",
        field: "assetCode",
        width: 100,
        cellClass: "text-center",
      },
      {
        headerName: "BUYER",
        field: "buyer",
        width: 100,
      },
      {
        headerName: "제작업체",
        field: "manufacturer",
        width: 100,
      },
      {
        headerName: "SHOT실적",
        field: "shotCount",
        width: 100,
        cellClass: "text-right",
        valueFormatter: (params) => {
          if (params.value == null) return ""
          return params.value.toLocaleString("ko-KR")
        },
      },
      {
        headerName: "실보관처",
        field: "storageLocation",
        width: 130,
      },
      {
        headerName: "사용상태",
        field: "useStatus",
        width: 90,
        cellClass: "text-center",
      },
      {
        headerName: "진행단계",
        field: "progressStep",
        width: 90,
        cellClass: "text-center",
      },
      {
        headerName: "변경일자",
        field: "changeDate",
        width: 110,
        cellClass: "text-center",
      },
      {
        headerName: "전송여부",
        field: "transferStatus",
        width: 100,
        cellClass: "text-center",
      },
    ],
    [handleMoldNameClick]
  )

  // Inspection 팝업 핸들러
  const handleInspSearch = () => {
    console.log("점검현황 조회", {
      inspFactory,
      inspTransferStatus,
      inspMoldCode,
      inspPartCode,
      inspAssetCode,
      inspBuyerCode,
      inspMoldStatus,
      inspProgressStep,
      inspUseStatus,
    })
  }

  const handleInspExportExcel = () => {
    inspectionGridApi?.exportDataAsExcel({
      fileName: "자산점검현황조회.xlsx",
    })
  }

  const handleInspPrint = () => {
    window.print()
  }

  const handleInspPropertyRegister = () => {
    console.log("속성등록")
  }

  const handleInspPartInquiry = () => {
    console.log("부품조회")
  }

  const handleInspTransfer = () => {
    console.log("전송")
  }

  const handleInspLoadMore = () => {
    setInspDisplayCount((prev) => Math.min(prev + INSPECTION_PAGE_SIZE, inspectionDummyData.length))
  }

  const inspDisplayedData = inspectionDummyData.slice(0, inspDisplayCount)
  const inspHasMore = inspDisplayCount < inspectionDummyData.length

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
    () => [
      {
        headerName: "자산번호",
        field: "assetNo",
        width: 120,
        cellClass: "text-center",
      },
      {
        headerName: "자산명칭",
        field: "assetName",
        width: 200,
        flex: 1,
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span
              className="cursor-pointer text-blue-600 hover:underline"
              onClick={() => handleAssetNameClick()}
            >
              {params.value}
            </span>
          )
        },
      },
      {
        headerName: "자산코드",
        children: [
          {
            headerName: "코드",
            field: "assetCode",
            width: 100,
            cellClass: "text-center",
          },
          {
            headerName: "명칭",
            field: "assetCodeName",
            width: 120,
          },
        ],
      },
      {
        headerName: "자산품목코드",
        children: [
          {
            headerName: "코드",
            field: "itemCode",
            width: 100,
            cellClass: "text-center",
          },
          {
            headerName: "명칭",
            field: "itemCodeName",
            width: 150,
          },
        ],
      },
      {
        headerName: "취득일자",
        field: "acquisitionDate",
        width: 120,
        cellClass: "text-center",
      },
      {
        headerName: "취득금액",
        field: "acquisitionAmount",
        width: 130,
        cellClass: "text-right",
        valueFormatter: (params) => {
          if (params.value == null) return ""
          return params.value.toLocaleString("ko-KR")
        },
      },
      {
        headerName: "취득부서",
        children: [
          {
            headerName: "코드",
            field: "acquisitionDeptCode",
            width: 80,
            cellClass: "text-center",
          },
          {
            headerName: "명칭",
            field: "acquisitionDeptName",
            width: 100,
          },
        ],
      },
      {
        headerName: "관리부서",
        children: [
          {
            headerName: "코드",
            field: "managementDeptCode",
            width: 80,
            cellClass: "text-center",
          },
          {
            headerName: "명칭",
            field: "managementDeptName",
            width: 100,
          },
        ],
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
      companyCode,
      acquisitionDeptCode,
      acquisitionDateFrom,
      acquisitionDateTo,
      assetCode,
      itemCode,
      supplierCode,
    })
  }

  const handleExportExcel = () => {
    gridApi?.exportDataAsExcel({
      fileName: "자산사용현황조회.xlsx",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    console.log("내보내기")
  }

  const handleAssetInfo = () => {
    setAssetInfoPopupOpen(true)
  }

  const handleChangeHistory = () => {
    console.log("변동현황")
  }

  const handleMoveHistory = () => {
    console.log("이동현황")
  }

  const handleVoucherInquiry = () => {
    console.log("전표조회")
  }

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, rowData.length))
  }

  const displayedData = rowData.slice(0, displayCount)
  const hasMore = displayCount < rowData.length

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 상단 검색 영역 */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card p-3">
        {/* 법인코드 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">법인코드</label>
          <Select value={companyCode} onValueChange={(value) => value && setCompanyCode(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A101">A101</SelectItem>
              <SelectItem value="A102">A102</SelectItem>
              <SelectItem value="A103">A103</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 취득부서 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">취득부서</label>
          <Input
            value={acquisitionDeptCode}
            onChange={(e) => setAcquisitionDeptCode(e.target.value)}
            className="w-[80px]"
            placeholder="코드"
          />
          <Input
            value={acquisitionDeptName}
            onChange={(e) => setAcquisitionDeptName(e.target.value)}
            className="w-[100px]"
            placeholder="명칭"
          />
        </div>

        {/* 취득일자 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">취득일자</label>
          <Input
            type="date"
            value={acquisitionDateFrom}
            onChange={(e) => setAcquisitionDateFrom(e.target.value)}
            className="w-[140px]"
          />
          <span className="text-muted-foreground">~</span>
          <Input
            type="date"
            value={acquisitionDateTo}
            onChange={(e) => setAcquisitionDateTo(e.target.value)}
            className="w-[140px]"
          />
        </div>

        {/* 자산코드 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">자산코드</label>
          <Input
            value={assetCode}
            onChange={(e) => setAssetCode(e.target.value)}
            className="w-[80px]"
            placeholder="코드"
          />
          <Input
            value={assetCodeName}
            onChange={(e) => setAssetCodeName(e.target.value)}
            className="w-[100px]"
            placeholder="명칭"
          />
        </div>

        {/* 자산품목코드 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">자산품목코드</label>
          <Input
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            className="w-[80px]"
            placeholder="코드"
          />
          <Input
            value={itemCodeName}
            onChange={(e) => setItemCodeName(e.target.value)}
            className="w-[100px]"
            placeholder="명칭"
          />
        </div>

        {/* 취득거래처 */}
        <div className="flex items-center gap-2">
          <label className="min-w-fit text-sm font-medium">취득거래처</label>
          <Input
            value={supplierCode}
            onChange={(e) => setSupplierCode(e.target.value)}
            className="w-[80px]"
            placeholder="코드"
          />
          <Input
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-[100px]"
            placeholder="명칭"
          />
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
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleExport}
          >
            <HugeiconsIcon icon={FileExportIcon} strokeWidth={2} className="h-4 w-4" />
            내보내기
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            className="h-8"
            onClick={handleAssetInfo}
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
            variant="secondary"
            size="sm"
            className="h-8"
            onClick={handleChangeHistory}
          >
            변동현황
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8"
            onClick={handleMoveHistory}
          >
            이동현황
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8"
            onClick={handleVoucherInquiry}
          >
            전표조회
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
          groupHeaderHeight={36}
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

      {/* 자산점검현황 팝업 */}
      <Dialog open={inspectionPopupOpen} onOpenChange={setInspectionPopupOpen}>
        <DialogContent className="sm:max-w-6xl h-[900px] flex flex-col p-0 gap-0" showCloseButton={false}>
          {/* 헤더 - 흰색 배경 + border-b */}
          <div className="flex items-center justify-between border-b bg-white px-4 py-3">
            <DialogTitle className="text-lg font-semibold">자산점검현황</DialogTitle>
            <button
              onClick={() => setInspectionPopupOpen(false)}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
            </button>
          </div>

          {/* 본문 - 스크롤 가능 영역 */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* 검색 필터 영역 */}
            <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card p-3">
              {/* 공장 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">공장</label>
                <Select value={inspFactory} onValueChange={(v) => setInspFactory(v ?? "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="본사공장">본사공장</SelectItem>
                    <SelectItem value="제2공장">제2공장</SelectItem>
                    <SelectItem value="제3공장">제3공장</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 전송여부 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">전송여부</label>
                <Select value={inspTransferStatus} onValueChange={(v) => setInspTransferStatus(v ?? "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="전송완료">전송완료</SelectItem>
                    <SelectItem value="미전송">미전송</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 금형코드 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">금형코드</label>
                <Input
                  value={inspMoldCode}
                  onChange={(e) => setInspMoldCode(e.target.value)}
                  className="w-[120px]"
                  placeholder="금형코드"
                />
              </div>

              {/* 부품코드 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">부품코드</label>
                <Input
                  value={inspPartCode}
                  onChange={(e) => setInspPartCode(e.target.value)}
                  className="w-[120px]"
                  placeholder="부품코드"
                />
              </div>

              {/* 자산코드 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">자산코드</label>
                <Input
                  value={inspAssetCode}
                  onChange={(e) => setInspAssetCode(e.target.value)}
                  className="w-[120px]"
                  placeholder="자산코드"
                />
              </div>

              {/* 바이어코드 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">바이어코드</label>
                <Input
                  value={inspBuyerCode}
                  onChange={(e) => setInspBuyerCode(e.target.value)}
                  className="w-[120px]"
                  placeholder="바이어코드"
                />
              </div>

              {/* 금형상태 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">금형상태</label>
                <Select value={inspMoldStatus} onValueChange={(v) => setInspMoldStatus(v ?? "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="정상">정상</SelectItem>
                    <SelectItem value="수리중">수리중</SelectItem>
                    <SelectItem value="수리완료">수리완료</SelectItem>
                    <SelectItem value="점검필요">점검필요</SelectItem>
                    <SelectItem value="점검중">점검중</SelectItem>
                    <SelectItem value="신규">신규</SelectItem>
                    <SelectItem value="폐기예정">폐기예정</SelectItem>
                    <SelectItem value="폐기완료">폐기완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 진행단계 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">진행단계</label>
                <Select value={inspProgressStep} onValueChange={(v) => setInspProgressStep(v ?? "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="개발">개발</SelectItem>
                    <SelectItem value="양산">양산</SelectItem>
                    <SelectItem value="점검">점검</SelectItem>
                    <SelectItem value="수리">수리</SelectItem>
                    <SelectItem value="수리대기">수리대기</SelectItem>
                    <SelectItem value="폐기">폐기</SelectItem>
                    <SelectItem value="폐기완료">폐기완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 사용상태 */}
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-sm font-medium">사용상태</label>
                <Select value={inspUseStatus} onValueChange={(v) => setInspUseStatus(v ?? "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="가동중">가동중</SelectItem>
                    <SelectItem value="대기중">대기중</SelectItem>
                    <SelectItem value="수리중">수리중</SelectItem>
                    <SelectItem value="시운전">시운전</SelectItem>
                    <SelectItem value="미사용">미사용</SelectItem>
                    <SelectItem value="점검중">점검중</SelectItem>
                    <SelectItem value="폐기">폐기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 툴바 영역 - 액션버튼 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => {
                    console.log("검색 실행", {
                      inspFactory,
                      inspTransferStatus,
                      inspMoldCode,
                      inspPartCode,
                      inspAssetCode,
                      inspBuyerCode,
                      inspMoldStatus,
                      inspProgressStep,
                      inspUseStatus,
                    })
                  }}
                >
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="h-4 w-4" />
                  조회
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => {
                    inspectionGridApi?.exportDataAsExcel({
                      fileName: "자산점검현황조회.xlsx",
                    })
                  }}
                >
                  <HugeiconsIcon icon={FileExportIcon} strokeWidth={2} className="h-4 w-4" />
                  엑셀
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => window.print()}
                >
                  <HugeiconsIcon icon={PrinterIcon} strokeWidth={2} className="h-4 w-4" />
                  인쇄
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => console.log("속성등록")}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="h-4 w-4" />
                  속성등록
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => console.log("부품조회")}
                >
                  <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="h-4 w-4" />
                  부품조회
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => console.log("전송")}
                >
                  <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} strokeWidth={2} className="h-4 w-4" />
                  전송
                </Button>
              </div>
            </div>

            {/* 데이터 그리드 */}
            <div className="ag-theme-alpine" style={{ minHeight: 400 }}>
              <AgGridReact
                ref={inspectionGridRef}
                rowData={inspectionDummyData.slice(0, inspDisplayCount)}
                columnDefs={inspectionColumnDefs}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                  suppressMovable: true,
                }}
                onGridReady={onInspectionGridReady}
                rowSelection="multiple"
                headerHeight={36}
                rowHeight={32}
                domLayout="autoHeight"
                suppressCellFocus={false}
                suppressRowClickSelection={true}
              />
            </div>

            {/* 더보기 영역 */}
            <div className="flex items-center justify-between rounded-md border bg-card px-4 py-2.5">
              <span className="text-sm text-muted-foreground">
                {Math.min(inspDisplayCount, inspectionDummyData.length)} / {inspectionDummyData.length}건
              </span>
              {inspDisplayCount < inspectionDummyData.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspDisplayCount((prev) => prev + INSPECTION_PAGE_SIZE)}
                >
                  더보기
                </Button>
              )}
            </div>
          </div>

          {/* 하단 - 닫기버튼 */}
          <div className="flex items-center justify-end border-t bg-white px-4 py-3">
            <Button variant="outline" onClick={() => setInspectionPopupOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 부품조회 하위 팝업 */}
      <Dialog open={partsPopupOpen} onOpenChange={setPartsPopupOpen}>
        <DialogContent className="max-w-2xl p-0 [&>button]:hidden">
          {/* 헤더 - 흰색 배경 + border-b */}
          <div className="flex items-center justify-between border-b bg-white px-4 py-3">
            <DialogTitle className="text-lg font-semibold">부품조회</DialogTitle>
            <button
              onClick={() => setPartsPopupOpen(false)}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
            </button>
          </div>

          {/* 부품 테이블 */}
          <div className="p-4">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium">부품코드</th>
                    <th className="px-4 py-2 text-left font-medium">부품명</th>
                    <th className="px-4 py-2 text-left font-medium">발생일자</th>
                    <th className="px-4 py-2 text-left font-medium">사용상태</th>
                  </tr>
                </thead>
                <tbody>
                  {partsData.map((part, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="px-4 py-2">{part.partCode}</td>
                      <td className="px-4 py-2">{part.partName}</td>
                      <td className="px-4 py-2">{part.occurDate}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {part.useStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 하단 - 건수 + 닫기버튼 */}
          <div className="flex items-center justify-between border-t bg-white px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {partsData.length}건 / 전체 {partsData.length}건
            </span>
            <Button variant="outline" onClick={() => setPartsPopupOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 자산정보 팝업 */}
      <Dialog open={assetInfoPopupOpen} onOpenChange={(open) => {
        setAssetInfoPopupOpen(open)
        if (!open) setSelectedAssetTarget(null)
      }}>
        <DialogContent className="sm:max-w-6xl h-[900px] flex flex-col p-0 gap-0" showCloseButton={false}>
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b bg-white px-4 py-3">
            <DialogTitle className="text-lg font-semibold">자산정보</DialogTitle>
            <button
              onClick={() => {
                setAssetInfoPopupOpen(false)
                setSelectedAssetTarget(null)
              }}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
            </button>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex border-b bg-gray-50 px-4">
            {(["자산대장", "자산상세", "자산등록"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setAssetInfoTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  assetInfoTab === tab
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
            <button
              onClick={() => setMoldRegistrationPopupOpen(true)}
              className="px-6 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700"
            >
              금형등록
            </button>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-auto p-4">
            {/* 상단: 자산등록대상 테이블 + 이미지 영역 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* 좌측: 자산등록대상 테이블 */}
              <div className="col-span-2 border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b">
                  <span className="text-sm font-medium">자산등록대상</span>
                </div>
                <div className="max-h-[200px] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5 border-b text-center font-medium w-12">선택</th>
                        <th className="px-2 py-1.5 border-b text-center font-medium">집행번호</th>
                        <th className="px-2 py-1.5 border-b text-center font-medium">집행일자</th>
                        <th className="px-2 py-1.5 border-b text-center font-medium">계약번호</th>
                        <th className="px-2 py-1.5 border-b text-left font-medium">품목명</th>
                        <th className="px-2 py-1.5 border-b text-right font-medium">수량</th>
                        <th className="px-2 py-1.5 border-b text-right font-medium">단가</th>
                        <th className="px-2 py-1.5 border-b text-right font-medium">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetRegistrationTargetData.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedAssetTarget(row)}
                          className={`cursor-pointer border-b last:border-b-0 transition-colors ${
                            selectedAssetTarget?.id === row.id
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-2 py-1.5 text-center">
                            <input
                              type="checkbox"
                              className="h-3 w-3"
                              checked={selectedAssetTarget?.id === row.id}
                              onChange={() => setSelectedAssetTarget(row)}
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">{row.execNo}</td>
                          <td className="px-2 py-1.5 text-center">{row.execDate}</td>
                          <td className="px-2 py-1.5 text-center">{row.contractNo}</td>
                          <td className="px-2 py-1.5">{row.itemName}</td>
                          <td className="px-2 py-1.5 text-right">{row.quantity}</td>
                          <td className="px-2 py-1.5 text-right">{row.unitPrice.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-right">{row.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 우측: 이미지 영역 */}
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b">
                  <span className="text-sm font-medium">자산 이미지</span>
                </div>
                <div className="h-[168px] flex items-center justify-center bg-gray-100 text-gray-400">
                  {selectedAssetTarget ? (
                    <img
                      src={selectedAssetTarget.image}
                      alt={selectedAssetTarget.itemName}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        // 이미지 로드 실패 시 플레이스홀더 표시
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                  ) : null}
                  <div className={`text-center ${selectedAssetTarget ? "hidden" : ""}`}>
                    <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="h-12 w-12 mx-auto mb-2" />
                    <span className="text-xs">{selectedAssetTarget ? "이미지 로드 실패" : "이미지 없음"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 중간: 자산 상세 정보 폼 */}
            <div className="border rounded-md overflow-hidden mb-4">
              <div className="bg-gray-50 px-3 py-2 border-b">
                <span className="text-sm font-medium">자산 상세 정보</span>
              </div>
              <div className="p-3">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="bg-gray-50 px-3 py-2 border font-medium w-[120px]">대분류</td>
                      <td className="px-3 py-2 border">
                        <Select defaultValue="금형">
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="금형">금형</SelectItem>
                            <SelectItem value="설비">설비</SelectItem>
                            <SelectItem value="공구">공구</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="bg-gray-50 px-3 py-2 border font-medium w-[120px]">중분류</td>
                      <td className="px-3 py-2 border">
                        <Select defaultValue="주조금형">
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="주조금형">주조금형</SelectItem>
                            <SelectItem value="다이캐스팅">다이캐스팅</SelectItem>
                            <SelectItem value="단조금형">단조금형</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="bg-gray-50 px-3 py-2 border font-medium w-[120px]">소분류</td>
                      <td className="px-3 py-2 border">
                        <Select defaultValue="엔진금형">
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="엔진금형">엔진금형</SelectItem>
                            <SelectItem value="구동계금형">구동계금형</SelectItem>
                            <SelectItem value="차체금형">차체금형</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-gray-50 px-3 py-2 border font-medium">자산명</td>
                      <td className="px-3 py-2 border" colSpan={3}>
                        <Input className="h-8 text-xs" defaultValue="엔진블록 주조금형 A" />
                      </td>
                      <td className="bg-gray-50 px-3 py-2 border font-medium">배부수량</td>
                      <td className="px-3 py-2 border">
                        <Input className="h-8 text-xs text-right" defaultValue="1" />
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-gray-50 px-3 py-2 border font-medium">관리부서</td>
                      <td className="px-3 py-2 border">
                        <Select defaultValue="생산1팀">
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="생산1팀">생산1팀</SelectItem>
                            <SelectItem value="생산2팀">생산2팀</SelectItem>
                            <SelectItem value="품질관리팀">품질관리팀</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="bg-gray-50 px-3 py-2 border font-medium">운영위치</td>
                      <td className="px-3 py-2 border">
                        <Select defaultValue="본사공장 A동">
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="본사공장 A동">본사공장 A동</SelectItem>
                            <SelectItem value="제2공장 B동">제2공장 B동</SelectItem>
                            <SelectItem value="제3공장 C동">제3공장 C동</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="bg-gray-50 px-3 py-2 border font-medium">취득일자</td>
                      <td className="px-3 py-2 border">
                        <Input type="date" className="h-8 text-xs" defaultValue="2024-01-15" />
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-gray-50 px-3 py-2 border font-medium">단위</td>
                      <td className="px-3 py-2 border">
                        <Select defaultValue="SET">
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SET">SET</SelectItem>
                            <SelectItem value="EA">EA</SelectItem>
                            <SelectItem value="LOT">LOT</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="bg-gray-50 px-3 py-2 border font-medium">단가</td>
                      <td className="px-3 py-2 border">
                        <Input className="h-8 text-xs text-right" defaultValue="45,000,000" />
                      </td>
                      <td className="bg-gray-50 px-3 py-2 border font-medium">금액</td>
                      <td className="px-3 py-2 border">
                        <Input className="h-8 text-xs text-right" defaultValue="45,000,000" readOnly />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 하단: 자산등록 테이블 */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium">자산등록</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="h-3 w-3 mr-1" />
                    행추가
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    행삭제
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    엑셀 업로드
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    엑셀 다운로드
                  </Button>
                </div>
              </div>
              <div className="max-h-[180px] overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 border-b text-center font-medium w-10">
                        <input type="checkbox" className="h-3 w-3" />
                      </th>
                      <th className="px-2 py-1.5 border-b text-center font-medium">자산번호</th>
                      <th className="px-2 py-1.5 border-b text-left font-medium">자산명</th>
                      <th className="px-2 py-1.5 border-b text-center font-medium">대분류</th>
                      <th className="px-2 py-1.5 border-b text-center font-medium">중분류</th>
                      <th className="px-2 py-1.5 border-b text-center font-medium">소분류</th>
                      <th className="px-2 py-1.5 border-b text-center font-medium">관리부서</th>
                      <th className="px-2 py-1.5 border-b text-center font-medium">운영위치</th>
                      <th className="px-2 py-1.5 border-b text-center font-medium">취득일자</th>
                      <th className="px-2 py-1.5 border-b text-right font-medium">수량</th>
                      <th className="px-2 py-1.5 border-b text-center font-medium">단위</th>
                      <th className="px-2 py-1.5 border-b text-right font-medium">단가</th>
                      <th className="px-2 py-1.5 border-b text-right font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetRegistrationData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 border-b last:border-b-0">
                        <td className="px-2 py-1.5 text-center">
                          <input type="checkbox" className="h-3 w-3" />
                        </td>
                        <td className="px-2 py-1.5 text-center">{row.assetNo}</td>
                        <td className="px-2 py-1.5">{row.assetName}</td>
                        <td className="px-2 py-1.5 text-center">{row.majorCategory}</td>
                        <td className="px-2 py-1.5 text-center">{row.middleCategory}</td>
                        <td className="px-2 py-1.5 text-center">{row.minorCategory}</td>
                        <td className="px-2 py-1.5 text-center">{row.manageDept}</td>
                        <td className="px-2 py-1.5 text-center">{row.operLocation}</td>
                        <td className="px-2 py-1.5 text-center">{row.acquisitionDate}</td>
                        <td className="px-2 py-1.5 text-right">{row.quantity}</td>
                        <td className="px-2 py-1.5 text-center">{row.unit}</td>
                        <td className="px-2 py-1.5 text-right">{row.unitPrice.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-right">{row.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between border-t bg-white px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {assetRegistrationData.length}건 / 전체 {assetRegistrationData.length}건
            </span>
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                저장
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setAssetInfoPopupOpen(false)
                setSelectedAssetTarget(null)
              }}>
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 금형 마스터 생성 팝업 */}
      <Dialog open={moldRegistrationPopupOpen} onOpenChange={setMoldRegistrationPopupOpen}>
        <DialogContent className="sm:max-w-[1400px] w-[95vw] h-auto max-h-[95vh] p-0 flex flex-col [&>button]:hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b bg-white px-4 py-3">
            <h2 className="text-lg font-semibold">금형 마스터 생성</h2>
            <button
              onClick={() => setMoldRegistrationPopupOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
            </button>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-auto p-4">
            {/* 금형마스터 데이터 입력 */}
            <div className="border rounded-md mb-4">
              <div className="bg-gray-50 px-3 py-2 border-b">
                <span className="text-sm font-medium">금형마스터 데이터 입력</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* 1행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">플랜트</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">금형코드</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">금형명</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 2행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">기준MODEL</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">목표금액</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">제작금액</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 3행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">제작업체코드</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">제작구분</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">BUYER코드</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 4행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">투자비율</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">발송일자</Label>
                    <Input className="h-8 text-sm" type="date" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">금형CAVITY</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 5행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">금형SIZE</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">합체력</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">금형재질</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 6행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">양산업체코드</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">보증SHOT</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">GATE코드</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 7행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">금형형식</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">기준시간</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">순중량</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 8행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">SUPER중량</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">GROSS중량</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">발주일자</Label>
                    <Input className="h-8 text-sm" type="date" />
                  </div>
                  {/* 9행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">사출일자</Label>
                    <Input className="h-8 text-sm" type="date" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">인검일자</Label>
                    <Input className="h-8 text-sm" type="date" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">인검횟수</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 10행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">이관일자</Label>
                    <Input className="h-8 text-sm" type="date" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">수정횟수</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">프로젝트코드</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  {/* 11행 */}
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">코스트 센터</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-24 text-sm shrink-0">금형상태</Label>
                    <Input className="h-8 text-sm" placeholder="" />
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 탭 및 테이블 */}
            <div className="border rounded-md">
              {/* 하단 탭 메뉴 */}
              <div className="flex border-b bg-gray-50">
                {(["공정정보", "부품정보", "도면/문서"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMoldMasterSubTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      moldMasterSubTab === tab
                        ? "border-blue-500 text-blue-600 bg-white"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* 테이블 */}
              <div className="max-h-[200px] overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 border-b text-center font-medium">공정코드</th>
                      <th className="px-3 py-2 border-b text-center font-medium">금형코드</th>
                      <th className="px-3 py-2 border-b text-left font-medium">공정명</th>
                      <th className="px-3 py-2 border-b text-center font-medium">자산번호</th>
                      <th className="px-3 py-2 border-b text-right font-medium">취득가</th>
                      <th className="px-3 py-2 border-b text-center font-medium">취득일</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">P001</td>
                      <td className="px-3 py-2 text-center">M-2024-001</td>
                      <td className="px-3 py-2">1차 사출 공정</td>
                      <td className="px-3 py-2 text-center">A-2024-0001</td>
                      <td className="px-3 py-2 text-right">45,000,000</td>
                      <td className="px-3 py-2 text-center">2024-01-15</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">P002</td>
                      <td className="px-3 py-2 text-center">M-2024-002</td>
                      <td className="px-3 py-2">2차 가공 공정</td>
                      <td className="px-3 py-2 text-center">A-2024-0002</td>
                      <td className="px-3 py-2 text-right">38,000,000</td>
                      <td className="px-3 py-2 text-center">2024-01-20</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">P003</td>
                      <td className="px-3 py-2 text-center">M-2024-003</td>
                      <td className="px-3 py-2">표면 처리 공정</td>
                      <td className="px-3 py-2 text-center">A-2024-0003</td>
                      <td className="px-3 py-2 text-right">52,000,000</td>
                      <td className="px-3 py-2 text-center">2024-02-01</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between border-t bg-white px-4 py-3">
            <span className="text-sm text-muted-foreground">
              3건 / 전체 3건
            </span>
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                저장
              </Button>
              <Button size="sm" variant="outline" onClick={() => setMoldRegistrationPopupOpen(false)}>
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
