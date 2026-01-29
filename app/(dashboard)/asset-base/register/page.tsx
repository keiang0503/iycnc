"use client"

import React, { useState, useCallback, useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import type { ColDef, ColGroupDef } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  Add01Icon,
  Delete01Icon,
  PrinterIcon,
  FileExportIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

ModuleRegistry.registerModules([AllCommunityModule])

interface AssetRow {
  code: string
  name: string
  depreciationMethod: string
  assetAccountCode: string
  assetAccountName: string
  accumDepAccountCode: string
  accumDepAccountName: string
  depExpAccountCode: string
  depExpAccountName: string
  impairLossAccountCode: string
  impairLossAccountName: string
  impairReversalAccountCode: string
  impairReversalAccountName: string
}

const PAGE_SIZE = 30
const POPUP_PAGE_SIZE = 20

const sampleData: AssetRow[] = [
  // ── 엔진 계열 (E) ──
  { code: "E100", name: "엔진 어셈블리", depreciationMethod: "정액법", assetAccountCode: "18104101", assetAccountName: "기계장치-엔진", accumDepAccountCode: "18104201", accumDepAccountName: "감가상각누계액-엔진", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "E110", name: "실린더 블록", depreciationMethod: "정액법", assetAccountCode: "18104102", assetAccountName: "기계장치-실린더블록", accumDepAccountCode: "18104202", accumDepAccountName: "감가상각누계액-실린더블록", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "E120", name: "크랭크샤프트", depreciationMethod: "정액법", assetAccountCode: "18104103", assetAccountName: "기계장치-크랭크샤프트", accumDepAccountCode: "18104203", accumDepAccountName: "감가상각누계액-크랭크샤프트", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "E130", name: "캠샤프트", depreciationMethod: "정액법", assetAccountCode: "18104104", assetAccountName: "기계장치-캠샤프트", accumDepAccountCode: "18104204", accumDepAccountName: "감가상각누계액-캠샤프트", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "E140", name: "피스톤", depreciationMethod: "정액법", assetAccountCode: "18104105", assetAccountName: "기계장치-피스톤", accumDepAccountCode: "18104205", accumDepAccountName: "감가상각누계액-피스톤", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "E150", name: "커넥팅 로드", depreciationMethod: "정액법", assetAccountCode: "18104106", assetAccountName: "기계장치-커넥팅로드", accumDepAccountCode: "18104206", accumDepAccountName: "감가상각누계액-커넥팅로드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "E160", name: "실린더 헤드", depreciationMethod: "정액법", assetAccountCode: "18104107", assetAccountName: "기계장치-실린더헤드", accumDepAccountCode: "18104207", accumDepAccountName: "감가상각누계액-실린더헤드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "E170", name: "밸브 트레인", depreciationMethod: "정액법", assetAccountCode: "18104108", assetAccountName: "기계장치-밸브트레인", accumDepAccountCode: "18104208", accumDepAccountName: "감가상각누계액-밸브트레인", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "E180", name: "타이밍 체인", depreciationMethod: "정률법", assetAccountCode: "18104109", assetAccountName: "기계장치-타이밍체인", accumDepAccountCode: "18104209", accumDepAccountName: "감가상각누계액-타이밍체인", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "E190", name: "오일 펌프", depreciationMethod: "정액법", assetAccountCode: "18104110", assetAccountName: "기계장치-오일펌프", accumDepAccountCode: "18104210", accumDepAccountName: "감가상각누계액-오일펌프", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  // ── 변속기 계열 (T) ──
  { code: "T200", name: "변속기(트랜스미션)", depreciationMethod: "정액법", assetAccountCode: "18104201", assetAccountName: "기계장치-변속기", accumDepAccountCode: "18104301", accumDepAccountName: "감가상각누계액-변속기", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "T210", name: "클러치 어셈블리", depreciationMethod: "정액법", assetAccountCode: "18104202", assetAccountName: "기계장치-클러치", accumDepAccountCode: "18104302", accumDepAccountName: "감가상각누계액-클러치", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "T220", name: "토크 컨버터", depreciationMethod: "정액법", assetAccountCode: "18104203", assetAccountName: "기계장치-토크컨버터", accumDepAccountCode: "18104303", accumDepAccountName: "감가상각누계액-토크컨버터", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "T230", name: "기어박스 하우징", depreciationMethod: "정액법", assetAccountCode: "18104204", assetAccountName: "기계장치-기어박스", accumDepAccountCode: "18104304", accumDepAccountName: "감가상각누계액-기어박스", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "T240", name: "드라이브 샤프트", depreciationMethod: "정액법", assetAccountCode: "18104205", assetAccountName: "기계장치-드라이브샤프트", accumDepAccountCode: "18104305", accumDepAccountName: "감가상각누계액-드라이브샤프트", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "T250", name: "디퍼렌셜 기어", depreciationMethod: "정률법", assetAccountCode: "18104206", assetAccountName: "기계장치-디퍼렌셜", accumDepAccountCode: "18104306", accumDepAccountName: "감가상각누계액-디퍼렌셜", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "T260", name: "플라이휠", depreciationMethod: "정액법", assetAccountCode: "18104207", assetAccountName: "기계장치-플라이휠", accumDepAccountCode: "18104307", accumDepAccountName: "감가상각누계액-플라이휠", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "T270", name: "CVT 벨트/체인", depreciationMethod: "정률법", assetAccountCode: "18104208", assetAccountName: "기계장치-CVT", accumDepAccountCode: "18104308", accumDepAccountName: "감가상각누계액-CVT", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  // ── 브레이크 계열 (B) ──
  { code: "B300", name: "브레이크 시스템", depreciationMethod: "정률법", assetAccountCode: "18107101", assetAccountName: "부품-브레이크시스템", accumDepAccountCode: "18107201", accumDepAccountName: "감가상각누계액-브레이크", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "B310", name: "디스크 로터", depreciationMethod: "정률법", assetAccountCode: "18107102", assetAccountName: "부품-디스크로터", accumDepAccountCode: "18107202", accumDepAccountName: "감가상각누계액-디스크로터", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "B320", name: "브레이크 패드", depreciationMethod: "정률법", assetAccountCode: "18107103", assetAccountName: "부품-브레이크패드", accumDepAccountCode: "18107203", accumDepAccountName: "감가상각누계액-브레이크패드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "B330", name: "브레이크 캘리퍼", depreciationMethod: "정률법", assetAccountCode: "18107104", assetAccountName: "부품-브레이크캘리퍼", accumDepAccountCode: "18107204", accumDepAccountName: "감가상각누계액-캘리퍼", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "B340", name: "마스터 실린더", depreciationMethod: "정률법", assetAccountCode: "18107105", assetAccountName: "부품-마스터실린더", accumDepAccountCode: "18107205", accumDepAccountName: "감가상각누계액-마스터실린더", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "B350", name: "ABS 모듈", depreciationMethod: "정액법", assetAccountCode: "18107106", assetAccountName: "부품-ABS모듈", accumDepAccountCode: "18107206", accumDepAccountName: "감가상각누계액-ABS", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "B360", name: "브레이크 호스", depreciationMethod: "정률법", assetAccountCode: "18107107", assetAccountName: "부품-브레이크호스", accumDepAccountCode: "18107207", accumDepAccountName: "감가상각누계액-브레이크호스", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "B370", name: "주차 브레이크", depreciationMethod: "정률법", assetAccountCode: "18107108", assetAccountName: "부품-주차브레이크", accumDepAccountCode: "18107208", accumDepAccountName: "감가상각누계액-주차브레이크", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  // ── 서스펜션 계열 (S) ──
  { code: "S400", name: "서스펜션 시스템", depreciationMethod: "정액법", assetAccountCode: "18107201", assetAccountName: "부품-서스펜션", accumDepAccountCode: "18107301", accumDepAccountName: "감가상각누계액-서스펜션", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "S410", name: "쇼크 업소버", depreciationMethod: "정액법", assetAccountCode: "18107202", assetAccountName: "부품-쇼크업소버", accumDepAccountCode: "18107302", accumDepAccountName: "감가상각누계액-쇼크업소버", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "S420", name: "코일 스프링", depreciationMethod: "정액법", assetAccountCode: "18107203", assetAccountName: "부품-코일스프링", accumDepAccountCode: "18107303", accumDepAccountName: "감가상각누계액-코일스프링", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "S430", name: "스태빌라이저 바", depreciationMethod: "정액법", assetAccountCode: "18107204", assetAccountName: "부품-스태빌라이저", accumDepAccountCode: "18107304", accumDepAccountName: "감가상각누계액-스태빌라이저", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "S440", name: "컨트롤 암", depreciationMethod: "정액법", assetAccountCode: "18107205", assetAccountName: "부품-컨트롤암", accumDepAccountCode: "18107305", accumDepAccountName: "감가상각누계액-컨트롤암", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "S450", name: "볼 조인트", depreciationMethod: "정률법", assetAccountCode: "18107206", assetAccountName: "부품-볼조인트", accumDepAccountCode: "18107306", accumDepAccountName: "감가상각누계액-볼조인트", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "S460", name: "부시(Bushing)", depreciationMethod: "정률법", assetAccountCode: "18107207", assetAccountName: "부품-부시", accumDepAccountCode: "18107307", accumDepAccountName: "감가상각누계액-부시", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "S470", name: "에어 서스펜션", depreciationMethod: "정액법", assetAccountCode: "18107208", assetAccountName: "부품-에어서스펜션", accumDepAccountCode: "18107308", accumDepAccountName: "감가상각누계액-에어서스펜션", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  // ── 전장부품 계열 (EL) ──
  { code: "EL500", name: "전장부품(ECU)", depreciationMethod: "정액법", assetAccountCode: "18107301", assetAccountName: "전자장비-ECU", accumDepAccountCode: "18107401", accumDepAccountName: "감가상각누계액-ECU", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EL510", name: "와이어링 하네스", depreciationMethod: "정액법", assetAccountCode: "18107302", assetAccountName: "전자장비-하네스", accumDepAccountCode: "18107402", accumDepAccountName: "감가상각누계액-하네스", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "EL520", name: "배터리(고전압)", depreciationMethod: "정액법", assetAccountCode: "18107303", assetAccountName: "전자장비-고전압배터리", accumDepAccountCode: "18107403", accumDepAccountName: "감가상각누계액-고전압배터리", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EL530", name: "스타터 모터", depreciationMethod: "정액법", assetAccountCode: "18107304", assetAccountName: "전자장비-스타터모터", accumDepAccountCode: "18107404", accumDepAccountName: "감가상각누계액-스타터모터", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EL540", name: "올터네이터(발전기)", depreciationMethod: "정액법", assetAccountCode: "18107305", assetAccountName: "전자장비-올터네이터", accumDepAccountCode: "18107405", accumDepAccountName: "감가상각누계액-올터네이터", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EL550", name: "점화 코일", depreciationMethod: "정률법", assetAccountCode: "18107306", assetAccountName: "전자장비-점화코일", accumDepAccountCode: "18107406", accumDepAccountName: "감가상각누계액-점화코일", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "EL560", name: "인버터", depreciationMethod: "정액법", assetAccountCode: "18107307", assetAccountName: "전자장비-인버터", accumDepAccountCode: "18107407", accumDepAccountName: "감가상각누계액-인버터", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EL570", name: "DC-DC 컨버터", depreciationMethod: "정액법", assetAccountCode: "18107308", assetAccountName: "전자장비-DC컨버터", accumDepAccountCode: "18107408", accumDepAccountName: "감가상각누계액-DC컨버터", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EL580", name: "BMS(배터리관리)", depreciationMethod: "정액법", assetAccountCode: "18107309", assetAccountName: "전자장비-BMS", accumDepAccountCode: "18107409", accumDepAccountName: "감가상각누계액-BMS", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EL590", name: "OBD 진단모듈", depreciationMethod: "정률법", assetAccountCode: "18107310", assetAccountName: "전자장비-OBD", accumDepAccountCode: "18107410", accumDepAccountName: "감가상각누계액-OBD", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  // ── 차체/바디 계열 (BD) ──
  { code: "BD600", name: "차체(바디) 프레임", depreciationMethod: "정액법", assetAccountCode: "18106101", assetAccountName: "차량운반구-바디", accumDepAccountCode: "18106201", accumDepAccountName: "감가상각누계액-바디", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "BD610", name: "도어 패널", depreciationMethod: "정액법", assetAccountCode: "18106102", assetAccountName: "차량운반구-도어", accumDepAccountCode: "18106202", accumDepAccountName: "감가상각누계액-도어", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "BD620", name: "후드(본넷)", depreciationMethod: "정액법", assetAccountCode: "18106103", assetAccountName: "차량운반구-후드", accumDepAccountCode: "18106203", accumDepAccountName: "감가상각누계액-후드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "BD630", name: "트렁크 리드", depreciationMethod: "정액법", assetAccountCode: "18106104", assetAccountName: "차량운반구-트렁크", accumDepAccountCode: "18106204", accumDepAccountName: "감가상각누계액-트렁크", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "BD640", name: "펜더", depreciationMethod: "정액법", assetAccountCode: "18106105", assetAccountName: "차량운반구-펜더", accumDepAccountCode: "18106205", accumDepAccountName: "감가상각누계액-펜더", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "BD650", name: "범퍼(프론트)", depreciationMethod: "정률법", assetAccountCode: "18106106", assetAccountName: "차량운반구-프론트범퍼", accumDepAccountCode: "18106206", accumDepAccountName: "감가상각누계액-프론트범퍼", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "BD660", name: "범퍼(리어)", depreciationMethod: "정률법", assetAccountCode: "18106107", assetAccountName: "차량운반구-리어범퍼", accumDepAccountCode: "18106207", accumDepAccountName: "감가상각누계액-리어범퍼", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "BD670", name: "루프 패널", depreciationMethod: "정액법", assetAccountCode: "18106108", assetAccountName: "차량운반구-루프", accumDepAccountCode: "18106208", accumDepAccountName: "감가상각누계액-루프", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "BD680", name: "사이드 미러", depreciationMethod: "정률법", assetAccountCode: "18106109", assetAccountName: "차량운반구-사이드미러", accumDepAccountCode: "18106209", accumDepAccountName: "감가상각누계액-사이드미러", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "BD690", name: "윈드실드 글래스", depreciationMethod: "정률법", assetAccountCode: "18106110", assetAccountName: "차량운반구-윈드실드", accumDepAccountCode: "18106210", accumDepAccountName: "감가상각누계액-윈드실드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  // ── 스티어링 계열 (ST) ──
  { code: "ST700", name: "스티어링 시스템", depreciationMethod: "정률법", assetAccountCode: "18107401", assetAccountName: "부품-스티어링", accumDepAccountCode: "18107501", accumDepAccountName: "감가상각누계액-스티어링", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "ST710", name: "파워 스티어링 펌프", depreciationMethod: "정률법", assetAccountCode: "18107402", assetAccountName: "부품-파워스티어링펌프", accumDepAccountCode: "18107502", accumDepAccountName: "감가상각누계액-파워스티어링", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "ST720", name: "스티어링 랙", depreciationMethod: "정률법", assetAccountCode: "18107403", assetAccountName: "부품-스티어링랙", accumDepAccountCode: "18107503", accumDepAccountName: "감가상각누계액-스티어링랙", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "ST730", name: "타이로드 엔드", depreciationMethod: "정률법", assetAccountCode: "18107404", assetAccountName: "부품-타이로드", accumDepAccountCode: "18107504", accumDepAccountName: "감가상각누계액-타이로드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "ST740", name: "스티어링 칼럼", depreciationMethod: "정액법", assetAccountCode: "18107405", assetAccountName: "부품-스티어링칼럼", accumDepAccountCode: "18107505", accumDepAccountName: "감가상각누계액-스티어링칼럼", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  // ── 배기 계열 (EX) ──
  { code: "EX800", name: "배기 시스템(머플러)", depreciationMethod: "정률법", assetAccountCode: "18107501", assetAccountName: "부품-배기시스템", accumDepAccountCode: "18107601", accumDepAccountName: "감가상각누계액-배기시스템", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EX810", name: "촉매 변환기", depreciationMethod: "정률법", assetAccountCode: "18107502", assetAccountName: "부품-촉매변환기", accumDepAccountCode: "18107602", accumDepAccountName: "감가상각누계액-촉매변환기", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EX820", name: "배기 매니폴드", depreciationMethod: "정률법", assetAccountCode: "18107503", assetAccountName: "부품-배기매니폴드", accumDepAccountCode: "18107603", accumDepAccountName: "감가상각누계액-배기매니폴드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "EX830", name: "DPF(디젤미립자필터)", depreciationMethod: "정액법", assetAccountCode: "18107504", assetAccountName: "부품-DPF", accumDepAccountCode: "18107604", accumDepAccountName: "감가상각누계액-DPF", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EX840", name: "EGR 밸브", depreciationMethod: "정률법", assetAccountCode: "18107505", assetAccountName: "부품-EGR밸브", accumDepAccountCode: "18107605", accumDepAccountName: "감가상각누계액-EGR", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "EX850", name: "산소 센서", depreciationMethod: "정률법", assetAccountCode: "18107506", assetAccountName: "부품-산소센서", accumDepAccountCode: "18107606", accumDepAccountName: "감가상각누계액-산소센서", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  // ── 냉각 계열 (CL) ──
  { code: "CL900", name: "냉각 시스템(라디에이터)", depreciationMethod: "정액법", assetAccountCode: "18107601", assetAccountName: "부품-냉각시스템", accumDepAccountCode: "18107701", accumDepAccountName: "감가상각누계액-냉각시스템", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "CL910", name: "워터 펌프", depreciationMethod: "정액법", assetAccountCode: "18107602", assetAccountName: "부품-워터펌프", accumDepAccountCode: "18107702", accumDepAccountName: "감가상각누계액-워터펌프", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "CL920", name: "서모스탯", depreciationMethod: "정률법", assetAccountCode: "18107603", assetAccountName: "부품-서모스탯", accumDepAccountCode: "18107703", accumDepAccountName: "감가상각누계액-서모스탯", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "CL930", name: "냉각팬 모터", depreciationMethod: "정액법", assetAccountCode: "18107604", assetAccountName: "부품-냉각팬", accumDepAccountCode: "18107704", accumDepAccountName: "감가상각누계액-냉각팬", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "CL940", name: "인터쿨러", depreciationMethod: "정액법", assetAccountCode: "18107605", assetAccountName: "부품-인터쿨러", accumDepAccountCode: "18107705", accumDepAccountName: "감가상각누계액-인터쿨러", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "CL950", name: "히터 코어", depreciationMethod: "정액법", assetAccountCode: "18107606", assetAccountName: "부품-히터코어", accumDepAccountCode: "18107706", accumDepAccountName: "감가상각누계액-히터코어", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  // ── 흡기/연료 계열 (FU) ──
  { code: "FU1000", name: "연료 펌프", depreciationMethod: "정률법", assetAccountCode: "18108101", assetAccountName: "부품-연료펌프", accumDepAccountCode: "18108201", accumDepAccountName: "감가상각누계액-연료펌프", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "FU1010", name: "인젝터", depreciationMethod: "정률법", assetAccountCode: "18108102", assetAccountName: "부품-인젝터", accumDepAccountCode: "18108202", accumDepAccountName: "감가상각누계액-인젝터", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "FU1020", name: "연료 탱크", depreciationMethod: "정액법", assetAccountCode: "18108103", assetAccountName: "부품-연료탱크", accumDepAccountCode: "18108203", accumDepAccountName: "감가상각누계액-연료탱크", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "FU1030", name: "에어필터 하우징", depreciationMethod: "정액법", assetAccountCode: "18108104", assetAccountName: "부품-에어필터", accumDepAccountCode: "18108204", accumDepAccountName: "감가상각누계액-에어필터", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "FU1040", name: "스로틀 바디", depreciationMethod: "정률법", assetAccountCode: "18108105", assetAccountName: "부품-스로틀바디", accumDepAccountCode: "18108205", accumDepAccountName: "감가상각누계액-스로틀바디", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "FU1050", name: "흡기 매니폴드", depreciationMethod: "정액법", assetAccountCode: "18108106", assetAccountName: "부품-흡기매니폴드", accumDepAccountCode: "18108206", accumDepAccountName: "감가상각누계액-흡기매니폴드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "FU1060", name: "터보차저", depreciationMethod: "정액법", assetAccountCode: "18108107", assetAccountName: "부품-터보차저", accumDepAccountCode: "18108207", accumDepAccountName: "감가상각누계액-터보차저", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "FU1070", name: "슈퍼차저", depreciationMethod: "정액법", assetAccountCode: "18108108", assetAccountName: "부품-슈퍼차저", accumDepAccountCode: "18108208", accumDepAccountName: "감가상각누계액-슈퍼차저", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  // ── 조명/등화 계열 (LT) ──
  { code: "LT1100", name: "헤드라이트(LED)", depreciationMethod: "정률법", assetAccountCode: "18108201", assetAccountName: "부품-헤드라이트", accumDepAccountCode: "18108301", accumDepAccountName: "감가상각누계액-헤드라이트", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "LT1110", name: "테일 램프", depreciationMethod: "정률법", assetAccountCode: "18108202", assetAccountName: "부품-테일램프", accumDepAccountCode: "18108302", accumDepAccountName: "감가상각누계액-테일램프", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "LT1120", name: "포그 램프", depreciationMethod: "정률법", assetAccountCode: "18108203", assetAccountName: "부품-포그램프", accumDepAccountCode: "18108303", accumDepAccountName: "감가상각누계액-포그램프", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "LT1130", name: "방향지시등", depreciationMethod: "정률법", assetAccountCode: "18108204", assetAccountName: "부품-방향지시등", accumDepAccountCode: "18108304", accumDepAccountName: "감가상각누계액-방향지시등", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "LT1140", name: "DRL(주간주행등)", depreciationMethod: "정액법", assetAccountCode: "18108205", assetAccountName: "부품-DRL", accumDepAccountCode: "18108305", accumDepAccountName: "감가상각누계액-DRL", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  // ── 휠/타이어 계열 (WH) ──
  { code: "WH1200", name: "알루미늄 휠", depreciationMethod: "정률법", assetAccountCode: "18108301", assetAccountName: "부품-알루미늄휠", accumDepAccountCode: "18108401", accumDepAccountName: "감가상각누계액-알루미늄휠", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "WH1210", name: "타이어", depreciationMethod: "정률법", assetAccountCode: "18108302", assetAccountName: "부품-타이어", accumDepAccountCode: "18108402", accumDepAccountName: "감가상각누계액-타이어", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "WH1220", name: "허브 베어링", depreciationMethod: "정률법", assetAccountCode: "18108303", assetAccountName: "부품-허브베어링", accumDepAccountCode: "18108403", accumDepAccountName: "감가상각누계액-허브베어링", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "WH1230", name: "TPMS 센서", depreciationMethod: "정액법", assetAccountCode: "18108304", assetAccountName: "부품-TPMS", accumDepAccountCode: "18108404", accumDepAccountName: "감가상각누계액-TPMS", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "WH1240", name: "스페어 타이어", depreciationMethod: "정률법", assetAccountCode: "18108305", assetAccountName: "부품-스페어타이어", accumDepAccountCode: "18108405", accumDepAccountName: "감가상각누계액-스페어타이어", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  // ── 내장/편의 계열 (IN) ──
  { code: "IN1300", name: "시트 어셈블리", depreciationMethod: "정액법", assetAccountCode: "18108401", assetAccountName: "부품-시트", accumDepAccountCode: "18108501", accumDepAccountName: "감가상각누계액-시트", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "IN1310", name: "대시보드", depreciationMethod: "정액법", assetAccountCode: "18108402", assetAccountName: "부품-대시보드", accumDepAccountCode: "18108502", accumDepAccountName: "감가상각누계액-대시보드", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "IN1320", name: "스티어링 휠", depreciationMethod: "정액법", assetAccountCode: "18108403", assetAccountName: "부품-스티어링휠", accumDepAccountCode: "18108503", accumDepAccountName: "감가상각누계액-스티어링휠", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "IN1330", name: "에어컨 컴프레서", depreciationMethod: "정액법", assetAccountCode: "18108404", assetAccountName: "부품-에어컨", accumDepAccountCode: "18108504", accumDepAccountName: "감가상각누계액-에어컨", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "IN1340", name: "인포테인먼트 시스템", depreciationMethod: "정액법", assetAccountCode: "18108405", assetAccountName: "부품-인포테인먼트", accumDepAccountCode: "18108505", accumDepAccountName: "감가상각누계액-인포테인먼트", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "IN1350", name: "에어백 모듈", depreciationMethod: "정액법", assetAccountCode: "18108406", assetAccountName: "부품-에어백", accumDepAccountCode: "18108506", accumDepAccountName: "감가상각누계액-에어백", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "IN1360", name: "안전벨트 리트랙터", depreciationMethod: "정률법", assetAccountCode: "18108407", assetAccountName: "부품-안전벨트", accumDepAccountCode: "18108507", accumDepAccountName: "감가상각누계액-안전벨트", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  // ── 센서/ADAS 계열 (AD) ──
  { code: "AD1400", name: "전방 카메라(ADAS)", depreciationMethod: "정액법", assetAccountCode: "18108501", assetAccountName: "전자장비-전방카메라", accumDepAccountCode: "18108601", accumDepAccountName: "감가상각누계액-전방카메라", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "AD1410", name: "레이더 센서", depreciationMethod: "정액법", assetAccountCode: "18108502", assetAccountName: "전자장비-레이더", accumDepAccountCode: "18108602", accumDepAccountName: "감가상각누계액-레이더", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "AD1420", name: "LiDAR 센서", depreciationMethod: "정액법", assetAccountCode: "18108503", assetAccountName: "전자장비-LiDAR", accumDepAccountCode: "18108603", accumDepAccountName: "감가상각누계액-LiDAR", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
  { code: "AD1430", name: "초음파 센서", depreciationMethod: "정률법", assetAccountCode: "18108504", assetAccountName: "전자장비-초음파센서", accumDepAccountCode: "18108604", accumDepAccountName: "감가상각누계액-초음파센서", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "", impairLossAccountName: "", impairReversalAccountCode: "", impairReversalAccountName: "" },
  { code: "AD1440", name: "후방 카메라", depreciationMethod: "정액법", assetAccountCode: "18108505", assetAccountName: "전자장비-후방카메라", accumDepAccountCode: "18108605", accumDepAccountName: "감가상각누계액-후방카메라", depExpAccountCode: "4101", depExpAccountName: "유형자산감가상각비", impairLossAccountCode: "72002900", impairLossAccountName: "자산손상차손", impairReversalAccountCode: "70003000", impairReversalAccountName: "자산손상차손환입" },
]

// ── 자산품목 팝업 데이터 ──
interface AssetItemRow {
  assetCode: string
  assetName: string
  itemCode: string
  itemName: string
  remark: string
  inUse: boolean
}

const assetItemData: AssetItemRow[] = [
  // 엔진 계열
  { assetCode: "E100", assetName: "엔진 어셈블리", itemCode: "E100-01", itemName: "실린더 블록 본체", remark: "주철/알루미늄 합금", inUse: true },
  { assetCode: "E100", assetName: "엔진 어셈블리", itemCode: "E100-02", itemName: "크랭크샤프트 단조품", remark: "고강도 단조강", inUse: true },
  { assetCode: "E100", assetName: "엔진 어셈블리", itemCode: "E100-03", itemName: "피스톤 링 세트", remark: "압축/오일링 포함", inUse: true },
  { assetCode: "E100", assetName: "엔진 어셈블리", itemCode: "E100-04", itemName: "캠샤프트 DOHC", remark: "흡기/배기 독립", inUse: false },
  { assetCode: "E100", assetName: "엔진 어셈블리", itemCode: "E100-05", itemName: "타이밍 체인 키트", remark: "체인+텐셔너+가이드", inUse: true },
  // 변속기 계열
  { assetCode: "T200", assetName: "변속기(트랜스미션)", itemCode: "T200-01", itemName: "토크 컨버터", remark: "자동변속기용", inUse: true },
  { assetCode: "T200", assetName: "변속기(트랜스미션)", itemCode: "T200-02", itemName: "클러치 디스크", remark: "수동변속기용", inUse: true },
  { assetCode: "T200", assetName: "변속기(트랜스미션)", itemCode: "T200-03", itemName: "기어 세트(1~6단)", remark: "헬리컬 기어", inUse: true },
  { assetCode: "T200", assetName: "변속기(트랜스미션)", itemCode: "T200-04", itemName: "싱크로나이저 링", remark: "동기치합 장치", inUse: false },
  // 브레이크 계열
  { assetCode: "B300", assetName: "브레이크 시스템", itemCode: "B300-01", itemName: "디스크 로터(전륜)", remark: "벤틸레이티드 타입", inUse: true },
  { assetCode: "B300", assetName: "브레이크 시스템", itemCode: "B300-02", itemName: "브레이크 패드(세라믹)", remark: "저소음/저분진", inUse: true },
  { assetCode: "B300", assetName: "브레이크 시스템", itemCode: "B300-03", itemName: "캘리퍼 어셈블리", remark: "4피스톤 대향", inUse: true },
  { assetCode: "B300", assetName: "브레이크 시스템", itemCode: "B300-04", itemName: "ABS 휠 스피드 센서", remark: "홀 효과 센서", inUse: true },
  // 서스펜션 계열
  { assetCode: "S400", assetName: "서스펜션 시스템", itemCode: "S400-01", itemName: "맥퍼슨 스트럿", remark: "전륜 독립현가", inUse: true },
  { assetCode: "S400", assetName: "서스펜션 시스템", itemCode: "S400-02", itemName: "코일 스프링(전륜)", remark: "가변 피치", inUse: true },
  { assetCode: "S400", assetName: "서스펜션 시스템", itemCode: "S400-03", itemName: "스태빌라이저 링크", remark: "좌/우 세트", inUse: false },
  // 전장부품 계열
  { assetCode: "EL500", assetName: "전장부품(ECU)", itemCode: "EL500-01", itemName: "엔진 ECU 모듈", remark: "32bit MCU 기반", inUse: true },
  { assetCode: "EL500", assetName: "전장부품(ECU)", itemCode: "EL500-02", itemName: "TCU(변속기 제어)", remark: "CAN 통신 연동", inUse: true },
  { assetCode: "EL500", assetName: "전장부품(ECU)", itemCode: "EL500-03", itemName: "고전압 배터리 팩", remark: "리튬이온 72kWh", inUse: true },
  { assetCode: "EL500", assetName: "전장부품(ECU)", itemCode: "EL500-04", itemName: "BMS 제어보드", remark: "셀 밸런싱 포함", inUse: true },
  // 차체 계열
  { assetCode: "BD600", assetName: "차체(바디) 프레임", itemCode: "BD600-01", itemName: "모노코크 바디셸", remark: "고장력 강판", inUse: true },
  { assetCode: "BD600", assetName: "차체(바디) 프레임", itemCode: "BD600-02", itemName: "도어 힌지 어셈블리", remark: "좌/우 4개 세트", inUse: true },
  { assetCode: "BD600", assetName: "차체(바디) 프레임", itemCode: "BD600-03", itemName: "윈드실드 접합유리", remark: "HUD 코팅 적용", inUse: false },
  // 스티어링 계열
  { assetCode: "ST700", assetName: "스티어링 시스템", itemCode: "ST700-01", itemName: "MDPS 모터", remark: "칼럼타입 전동식", inUse: true },
  { assetCode: "ST700", assetName: "스티어링 시스템", itemCode: "ST700-02", itemName: "랙 앤 피니언", remark: "가변 기어비", inUse: true },
  // 센서/ADAS 계열
  { assetCode: "AD1400", assetName: "전방 카메라(ADAS)", itemCode: "AD1400-01", itemName: "전방 스테레오 카메라", remark: "800만 화소", inUse: true },
  { assetCode: "AD1400", assetName: "전방 카메라(ADAS)", itemCode: "AD1400-02", itemName: "77GHz 레이더 모듈", remark: "장거리 감지", inUse: true },
  { assetCode: "AD1400", assetName: "전방 카메라(ADAS)", itemCode: "AD1400-03", itemName: "LiDAR 스캐너", remark: "360° 회전식", inUse: true },
  { assetCode: "AD1400", assetName: "전방 카메라(ADAS)", itemCode: "AD1400-04", itemName: "초음파 센서(12ch)", remark: "근거리 장애물 감지", inUse: false },
]

export default function AssetBaseRegisterPage() {
  const [companyCode, setCompanyCode] = useState("A101")
  const [companyName] = useState("IYCNC 자동차부품")
  const [assetCode, setAssetCode] = useState("")
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [showItemPopup, setShowItemPopup] = useState(false)
  const [popupSearchAssetCode, setPopupSearchAssetCode] = useState("")
  const [popupSearchAssetName, setPopupSearchAssetName] = useState("")
  const [popupDisplayCount, setPopupDisplayCount] = useState(POPUP_PAGE_SIZE)

  // ── 팝업용 컬럼 정의 ──
  const popupColumnDefs = useMemo<ColDef<AssetItemRow>[]>(
    () => [
      {
        headerName: "자산코드",
        field: "assetCode",
        width: 100,
        cellClass: "font-medium",
      },
      {
        headerName: "자산명",
        field: "assetName",
        width: 160,
      },
      {
        headerName: "자산품목코드",
        field: "itemCode",
        minWidth: 120,
        flex: 1,
      },
      {
        headerName: "자산품목명",
        field: "itemName",
        minWidth: 160,
        flex: 1.5,
      },
      {
        headerName: "비고",
        field: "remark",
        minWidth: 140,
        flex: 1.2,
      },
      {
        headerName: "사용여부",
        field: "inUse",
        width: 90,
        cellRenderer: (params: { value: boolean }) => {
          return params.value ? "✔" : ""
        },
        cellClass: "text-center",
        headerClass: "ag-header-center",
      },
    ],
    []
  )

  // ── 팝업 검색 필터 ──
  const filteredPopupData = useMemo(() => {
    return assetItemData.filter((row) => {
      const matchCode =
        !popupSearchAssetCode ||
        row.assetCode.toLowerCase().includes(popupSearchAssetCode.toLowerCase())
      const matchName =
        !popupSearchAssetName ||
        row.assetName.toLowerCase().includes(popupSearchAssetName.toLowerCase()) ||
        row.itemName.toLowerCase().includes(popupSearchAssetName.toLowerCase())
      return matchCode && matchName
    })
  }, [popupSearchAssetCode, popupSearchAssetName])

  // ── 팝업 표시 데이터 (페이지네이션) ──
  const visiblePopupData = useMemo(
    () => filteredPopupData.slice(0, popupDisplayCount),
    [filteredPopupData, popupDisplayCount]
  )

  const hasMorePopupData = popupDisplayCount < filteredPopupData.length

  const handlePopupLoadMore = useCallback(() => {
    setPopupDisplayCount((prev) => Math.min(prev + POPUP_PAGE_SIZE, filteredPopupData.length))
  }, [filteredPopupData.length])

  const visibleData = useMemo(
    () => sampleData.slice(0, displayCount),
    [displayCount]
  )

  const hasMore = displayCount < sampleData.length

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, sampleData.length))
  }, [])

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
    () => [
      {
        headerName: "자산코드",
        children: [
          {
            headerName: "코드",
            field: "code",
            width: 80,
            pinned: "left",
            cellClass: "font-medium",
          },
          {
            headerName: "명칭",
            field: "name",
            width: 160,
            pinned: "left",
          },
        ],
      },
      {
        headerName: "상각방법",
        field: "depreciationMethod",
        minWidth: 90,
        flex: 0.8,
      },
      {
        headerName: "자산계정",
        children: [
          {
            headerName: "코드",
            field: "assetAccountCode",
            minWidth: 100,
            flex: 1,
          },
          {
            headerName: "명칭",
            field: "assetAccountName",
            minWidth: 140,
            flex: 1.5,
          },
        ],
      },
      {
        headerName: "상각(누계액)계정",
        children: [
          {
            headerName: "코드",
            field: "accumDepAccountCode",
            minWidth: 100,
            flex: 1,
          },
          {
            headerName: "명칭",
            field: "accumDepAccountName",
            minWidth: 160,
            flex: 1.8,
          },
        ],
      },
      {
        headerName: "상각(비용)계정",
        children: [
          {
            headerName: "코드",
            field: "depExpAccountCode",
            minWidth: 80,
            flex: 0.8,
          },
          {
            headerName: "명칭",
            field: "depExpAccountName",
            minWidth: 130,
            flex: 1.3,
          },
        ],
      },
      {
        headerName: "손상자손계정",
        children: [
          {
            headerName: "코드",
            field: "impairLossAccountCode",
            minWidth: 100,
            flex: 1,
          },
          {
            headerName: "명칭",
            field: "impairLossAccountName",
            minWidth: 120,
            flex: 1.2,
          },
        ],
      },
      {
        headerName: "손상자손환입계정",
        children: [
          {
            headerName: "코드",
            field: "impairReversalAccountCode",
            minWidth: 100,
            flex: 1,
          },
          {
            headerName: "명칭",
            field: "impairReversalAccountName",
            minWidth: 120,
            flex: 1.3,
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

  const onGridReady = useCallback(() => {
    // 그리드 초기화 시 필요한 로직
  }, [])

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 상단 검색 영역 */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card p-3">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">
            법인코드
          </label>
          <Input
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value)}
            className="h-8 w-20"
          />
          <Button variant="outline" size="icon" className="h-8 w-8">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{companyName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">
            자산코드
          </label>
          <Input
            value={assetCode}
            onChange={(e) => setAssetCode(e.target.value)}
            className="h-8 w-24"
          />
          <Button variant="outline" size="icon" className="h-8 w-8">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 툴바 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="h-4 w-4" />
            조회
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} className="h-4 w-4" />
            저장
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="h-4 w-4" />
            추가
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="h-4 w-4" />
            삭제
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <HugeiconsIcon icon={PrinterIcon} strokeWidth={2} className="h-4 w-4" />
            인쇄
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <HugeiconsIcon icon={FileExportIcon} strokeWidth={2} className="h-4 w-4" />
            내보내기
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="sm" className="h-8" onClick={() => setShowItemPopup(true)}>
            <span className="flex items-center gap-1.5">
              자산품목관리
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
            </span>
          </Button>
          <Button variant="secondary" size="sm" className="h-8">
            자산세목관리
          </Button>
          <Button variant="secondary" size="sm" className="h-8">
            상각율표관리
          </Button>
        </div>
      </div>

      {/* 데이터 그리드 */}
      <div className="ag-theme-alpine flex-1" style={{ minHeight: 500 }}>
        <AgGridReact
          rowData={visibleData}
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

      {/* 자산품목 팝업 모달 */}
      <Dialog open={showItemPopup} onOpenChange={setShowItemPopup}>
        <DialogContent className="max-w-[1500px] w-[95vw] h-[900px] flex flex-col p-0 gap-0" showCloseButton={false}>
          <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3 shrink-0">
            <DialogTitle className="text-base font-semibold">자산품목관리</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowItemPopup(false)}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* 팝업 검색 영역 */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-medium whitespace-nowrap">자산코드</label>
              <Input
                value={popupSearchAssetCode}
                onChange={(e) => setPopupSearchAssetCode(e.target.value)}
                className="h-8 w-24"
                placeholder="코드"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-medium whitespace-nowrap">자산명</label>
              <Input
                value={popupSearchAssetName}
                onChange={(e) => setPopupSearchAssetName(e.target.value)}
                className="h-8 w-36"
                placeholder="명칭"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => {
                setPopupSearchAssetCode("")
                setPopupSearchAssetName("")
              }}
            >
              초기화
            </Button>
          </div>

          {/* 팝업 툴바 */}
          <div className="flex items-center gap-1 px-4 py-2 shrink-0">
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="h-3.5 w-3.5" />
              추가
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} className="h-3.5 w-3.5" />
              저장
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <HugeiconsIcon icon={FileExportIcon} strokeWidth={2} className="h-3.5 w-3.5" />
              내보내기
            </Button>
          </div>

          {/* 팝업 그리드 */}
          <div className="ag-theme-alpine flex-1 px-4 py-2 overflow-auto">
            <AgGridReact
              rowData={visiblePopupData}
              columnDefs={popupColumnDefs}
              defaultColDef={defaultColDef}
              rowSelection="single"
              headerHeight={34}
              rowHeight={30}
              domLayout="autoHeight"
              suppressCellFocus={false}
            />
          </div>

          {/* 팝업 하단 정보 및 더보기 */}
          <div className="flex items-center justify-between border-t px-4 py-1.5 shrink-0">
            <span className="text-sm text-muted-foreground">
              {visiblePopupData.length}건 / 전체 {filteredPopupData.length}건
            </span>
            <div className="flex items-center gap-2">
              {hasMorePopupData && (
                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handlePopupLoadMore}>
                  더보기 ({filteredPopupData.length - popupDisplayCount}건 남음)
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-8" onClick={() => {
                setShowItemPopup(false)
                setPopupDisplayCount(POPUP_PAGE_SIZE)
              }}>
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 더보기 영역 */}
      <div className="flex items-center justify-between rounded-md border bg-card px-4 py-2.5">
        <span className="text-sm text-muted-foreground">
          {Math.min(displayCount, sampleData.length)}건 / 전체 {sampleData.length}건
        </span>
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleLoadMore}
          >
            더보기 ({sampleData.length - displayCount}건 남음)
          </Button>
        )}
        {!hasMore && (
          <span className="text-sm text-muted-foreground">모든 데이터를 표시하고 있습니다</span>
        )}
      </div>
    </div>
  )
}
