# IYCNC 프로젝트 개발 규칙

## 아이콘 사용 규칙

### 필수 사용: Hugeicons
- **MANDATORY**: 모든 아이콘은 반드시 Hugeicons 라이브러리만 사용
- **패키지**: `@hugeicons/react`, `@hugeicons/core-free-icons`

### 사용 금지: Lucide Icons
- **PROHIBITED**: `lucide-react` 패키지 사용 절대 금지
- 기존 lucide-react 아이콘 발견 시 즉시 Hugeicons로 교체

### 사용 패턴
```tsx
// ✅ 올바른 사용법
import { HugeiconsIcon } from "@hugeicons/react"
import { IconName } from "@hugeicons/core-free-icons"

<HugeiconsIcon icon={IconName} strokeWidth={2} className="h-5 w-5" />

// ❌ 금지된 사용법
import { X, Search, Menu } from "lucide-react"
```

### 자주 사용하는 아이콘 매핑
| 용도 | Hugeicons 아이콘 |
|------|------------------|
| 닫기 (X) | `Cancel01Icon` |
| 메뉴 | `Menu01Icon` |
| 검색 | `Search01Icon` |
| 사이드바 토글 | `SidebarLeft01Icon` |
| 설정 | `Settings01Icon` |
| 사용자 | `User01Icon` |
| 로그아웃 | `Logout01Icon` |
| 홈 | `Home01Icon` |
| 화살표 | `ArrowLeft01Icon`, `ArrowRight01Icon`, `ArrowUp01Icon`, `ArrowDown01Icon` |
| 체크 | `Tick01Icon` |
| 추가 | `Add01Icon` |
| 삭제 | `Delete01Icon` |
| 편집 | `Edit01Icon` |
| 저장 | `Save01Icon` |
| 다운로드 | `Download01Icon` |
| 업로드 | `Upload01Icon` |
| 새로고침 | `Refresh01Icon` |
| 필터 | `Filter01Icon` |
| 정렬 | `SortingAZ01Icon` |
| 달력 | `Calendar01Icon` |
| 시간 | `Clock01Icon` |
| 알림 | `Notification01Icon` |
| 이메일 | `Mail01Icon` |
| 전화 | `Call01Icon` |
| 위치 | `Location01Icon` |
| 파일 | `File01Icon` |
| 폴더 | `Folder01Icon` |
| 링크 | `Link01Icon` |
| 공유 | `Share01Icon` |
| 복사 | `Copy01Icon` |
| 잠금 | `Lock01Icon` |
| 잠금해제 | `Unlock01Icon` |
| 눈 (보기) | `View01Icon` |
| 눈 감기 (숨기기) | `ViewOff01Icon` |
| 정보 | `InformationCircleIcon` |
| 경고 | `Alert01Icon` |
| 성공 | `CheckmarkCircle01Icon` |
| 오류 | `Cancel01Icon` (원형), `AlertCircleIcon` |

### 에이전트 행동 지침
1. 새로운 아이콘 추가 시 반드시 Hugeicons에서 검색
2. lucide-react import 발견 시 즉시 Hugeicons로 교체
3. 아이콘 이름은 보통 `기능명 + 01 + Icon` 패턴 (예: `Search01Icon`, `Menu01Icon`)
4. strokeWidth는 기본 2 사용
5. 크기는 Tailwind CSS 클래스로 지정 (예: `h-4 w-4`, `h-5 w-5`)

---

## 팝업(Dialog) 스타일 규칙

### 기준: 자산품목관리 팝업 스타일
- **MANDATORY**: 모든 팝업은 아래 표준 스타일을 따라야 함

### 팝업 구조
```
┌─────────────────────────────────────────────────┐
│ [제목]                                      [X] │  ← 헤더 (흰색 배경, border-b)
├─────────────────────────────────────────────────┤
│ [검색 필터 영역] (선택)              [초기화]   │  ← 검색 영역 (border-b)
├─────────────────────────────────────────────────┤
│ [+ 추가] [저장] [내보내기] (선택)               │  ← 액션 버튼 영역 (border-b)
├─────────────────────────────────────────────────┤
│                                                 │
│  [테이블 영역]                                  │  ← 메인 콘텐츠
│                                                 │
├─────────────────────────────────────────────────┤
│ 20건 / 전체 29건          [더보기] [닫기]      │  ← 하단 (border-t)
└─────────────────────────────────────────────────┘
```

### DialogContent 필수 설정
```tsx
// ✅ 반드시 [&>button]:hidden 추가하여 기본 닫기 버튼 숨김
<DialogContent className="max-w-2xl p-0 [&>button]:hidden">
  {/* 팝업 내용 */}
</DialogContent>
```
- **MANDATORY**: DialogContent에 `[&>button]:hidden` 클래스 필수 추가
- 이유: shadcn Dialog의 기본 닫기 버튼과 커스텀 헤더 닫기 버튼이 중복되는 것을 방지

### 세부 스타일 규격

#### 1. 헤더 영역
```tsx
<div className="flex items-center justify-between border-b px-4 py-3">
  <DialogTitle className="text-lg font-semibold">팝업 제목</DialogTitle>
  <button onClick={onClose}>
    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
  </button>
</div>
```
- 배경색: 흰색 (기본)
- 하단 테두리: `border-b`
- 패딩: `px-4 py-3`

#### 2. 검색/필터 영역 (선택적)
```tsx
<div className="flex items-center gap-3 border-b px-4 py-3">
  <Input placeholder="코드" className="w-[120px]" />
  <Input placeholder="명칭" className="w-[150px]" />
  <Button variant="outline" size="sm">초기화</Button>
</div>
```
- 하단 테두리: `border-b`
- 패딩: `px-4 py-3`

#### 3. 액션 버튼 영역 (선택적)
```tsx
<div className="flex items-center gap-2 border-b px-4 py-2">
  <Button variant="outline" size="sm">
    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="mr-1 h-4 w-4" />
    추가
  </Button>
  <Button variant="outline" size="sm">저장</Button>
  <Button variant="outline" size="sm">내보내기</Button>
</div>
```
- 하단 테두리: `border-b`
- 패딩: `px-4 py-2`

#### 4. 테이블 스타일
```tsx
<table className="w-full">
  <thead>
    <tr className="border-b text-sm text-muted-foreground">
      <th className="px-4 py-2 text-left font-medium">컬럼1</th>
      <th className="border-l px-4 py-2 text-left font-medium">컬럼2</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b hover:bg-muted/30">
      <td className="px-4 py-2 text-sm">값1</td>
      <td className="border-l px-4 py-2 text-sm">값2</td>
    </tr>
  </tbody>
</table>
```
- 헤더 배경: 없음 (배경색 제거)
- 구분선: 가로(`border-b`) + 세로(`border-l`)
- 호버: `hover:bg-muted/30`

#### 5. 하단 영역
```tsx
<div className="flex items-center justify-between border-t px-4 py-3">
  <span className="text-sm text-muted-foreground">
    {displayCount}건 / 전체 {totalCount}건
  </span>
  <div className="flex items-center gap-2">
    {hasMore && (
      <Button variant="outline" size="sm">
        더보기 ({remainCount}건 남음)
      </Button>
    )}
    <Button variant="outline" size="sm" onClick={onClose}>
      닫기
    </Button>
  </div>
</div>
```
- 상단 테두리: `border-t`
- 좌측: 페이징 정보
- 우측: 더보기 + 닫기 버튼

### 금지 사항
- ❌ 컬러 배경 헤더 (녹색, 파란색 등) 사용 금지
- ❌ 테이블 헤더에 `bg-muted/50` 등 배경색 사용 금지
- ❌ 하단에 닫기 버튼만 단독 배치 금지 (페이징 정보 포함)
- ❌ DialogContent에 `[&>button]:hidden` 없이 사용 금지 (중복 닫기 버튼 발생)

### 에이전트 행동 지침
1. 새로운 팝업 생성 시 반드시 자산품목관리 스타일 참조
2. 기존 팝업 수정 요청 시 위 규격에 맞게 통일
3. 검색/액션버튼 영역은 팝업 기능에 따라 선택적 적용
4. 테이블이 있는 팝업은 반드시 하단에 페이징 정보 표시
