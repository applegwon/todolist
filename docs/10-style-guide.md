# 프론트엔드 스타일 가이드

**버전:** 1.1  
**작성일:** 2026-05-28  
**작성자:** Naejune Gwon  
**참조 이미지:** Google Calendar 이벤트 추가 UI  
**참조 문서:** `docs/8-wireframes.md`, `docs/9-frontend-integration-guide.md`

---

## 변경 이력

| 버전 | 작성일 | 변경자 | 변경 내용 |
|------|--------|--------|----------|
| 1.0 | 2026-05-28 | Naejune Gwon | 최초 작성 |
| 1.1 | 2026-05-29 | Naejune Gwon | 일본어(ja) 언어 지원 추가 — 폰트 패밀리에 Noto Sans JP 추가 |

---

## 1. 디자인 원칙

이 앱의 UI는 Google Calendar의 이벤트 추가 모달을 레퍼런스로 삼아 아래 원칙을 따른다.

- **명확함**: 각 요소의 역할이 한눈에 파악되어야 한다
- **여백 우선**: 빽빽하게 채우지 않고 충분한 여백으로 가독성을 확보한다
- **계층 강조**: 주요 액션(파란색), 보조 액션(텍스트), 비활성 상태를 명확히 구분한다
- **일관성**: 동일한 컴포넌트는 앱 전체에서 동일한 형태로 사용한다

---

## 2. 색상 팔레트

### 2.1 기본 색상 (Light Mode)

```css
:root {
  /* 배경 */
  --color-bg-page:       #f0f4f9;  /* 전체 페이지 배경 — 연한 파란회색 */
  --color-bg-surface:    #ffffff;  /* 카드, 모달, 폼 배경 — 흰색 */
  --color-bg-chip-active: #d2e3fc; /* 활성 탭/칩 배경 */

  /* 텍스트 */
  --color-text-primary:  #202124;  /* 제목, 주요 본문 */
  --color-text-secondary: #5f6368; /* 보조 텍스트, 힌트, 날짜 서브텍스트 */
  --color-text-placeholder: #80868b; /* 입력 필드 placeholder */
  --color-text-disabled:  #bdc1c6; /* 비활성 텍스트 */

  /* 액센트 — Google Blue */
  --color-primary:       #1a73e8;  /* 주요 버튼, 링크, 포커스 표시, 활성 탭 텍스트 */
  --color-primary-hover: #1765cc;  /* 주요 버튼 hover */
  --color-primary-light: #e8f0fe;  /* 주요 색 연한 배경 (뱃지, hover 효과) */

  /* 상태 색상 */
  --color-success:       #34a853;  /* 완료 상태 */
  --color-warning:       #fbbc04;  /* 기한초과 경고 뱃지 */
  --color-error:         #d93025;  /* 오류 메시지, 삭제 버튼 hover */

  /* 테두리 / 구분선 */
  --color-border:        #e0e0e0;  /* 카드, 목록 구분선 */
  --color-border-focus:  #1a73e8;  /* 포커스 underline */
  --color-divider:       #f1f3f4;  /* 섹션 구분 */

  /* 아이콘 */
  --color-icon:          #5f6368;  /* 일반 아이콘 */
  --color-icon-active:   #1a73e8;  /* 활성 상태 아이콘 */
}
```

### 2.2 Dark Mode

```css
[data-theme="dark"] {
  --color-bg-page:       #1e1e2e;
  --color-bg-surface:    #2d2d3f;
  --color-bg-chip-active: #1e3a5f;

  --color-text-primary:  #e8eaed;
  --color-text-secondary: #9aa0a6;
  --color-text-placeholder: #5f6368;
  --color-text-disabled:  #3c4043;

  --color-primary:       #8ab4f8;  /* 다크모드에서 밝게 조정 */
  --color-primary-hover: #aecbfa;
  --color-primary-light: #1a3a5c;

  --color-success:       #81c995;
  --color-warning:       #fdd663;
  --color-error:         #f28b82;

  --color-border:        #3c4043;
  --color-border-focus:  #8ab4f8;
  --color-divider:       #3c4043;

  --color-icon:          #9aa0a6;
  --color-icon-active:   #8ab4f8;
}
```

### 2.3 색상 사용 가이드

| 색상 변수 | 사용 위치 |
|-----------|----------|
| `--color-primary` | 저장 버튼, 활성 탭 텍스트, 포커스 underline, 텍스트 링크 |
| `--color-bg-chip-active` | 활성 탭/필터 칩 배경 |
| `--color-warning` | 기한초과(`is_overdue`) 배지 배경 |
| `--color-success` | 완료 상태 배지, 완료 체크 아이콘 |
| `--color-error` | 오류 메시지, 삭제 버튼 활성 색 |
| `--color-text-secondary` | 날짜, 힌트 문구, 서브 설명 |

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

```css
:root {
  --font-family: 'Google Sans', 'Noto Sans KR', 'Noto Sans JP', -apple-system, BlinkMacSystemFont,
    'Segoe UI', sans-serif;
  --font-family-mono: 'Roboto Mono', 'Nanum Gothic Coding', monospace;
}

body {
  font-family: var(--font-family);
  color: var(--color-text-primary);
}
```

> Google Sans가 없는 환경에서는 Noto Sans KR → 시스템 기본 폰트 순으로 적용된다.

### 3.2 텍스트 크기 및 스케일

```css
:root {
  --text-xs:   12px;  /* 서브 설명, 힌트, 날짜 서브텍스트 */
  --text-sm:   14px;  /* 일반 본문, 버튼, 탭, 입력값 */
  --text-base: 16px;  /* 카드 제목, 폼 라벨 */
  --text-lg:   20px;  /* 페이지 섹션 제목 */
  --text-xl:   24px;  /* 모달 입력 필드 placeholder ("제목 추가" 크기) */
  --text-2xl:  28px;  /* 페이지 헤더 제목 */
}
```

### 3.3 폰트 웨이트

```css
:root {
  --font-regular: 400;
  --font-medium:  500;  /* 탭 라벨, 버튼, 뱃지 */
  --font-bold:    700;  /* 페이지 제목, 강조 텍스트 */
}
```

### 3.4 적용 예시

| 요소 | 크기 | 웨이트 | 색상 |
|------|------|--------|------|
| 페이지 타이틀 | `--text-2xl` | bold | `--color-text-primary` |
| 모달/폼 대제목 입력 | `--text-xl` | regular | `--color-text-primary` |
| 카드 제목 | `--text-base` | medium | `--color-text-primary` |
| 일반 본문 | `--text-sm` | regular | `--color-text-primary` |
| 서브 텍스트 (날짜, 힌트) | `--text-xs` | regular | `--color-text-secondary` |
| 버튼 라벨 | `--text-sm` | medium | — |
| 탭/칩 라벨 | `--text-sm` | medium | — |

---

## 4. 간격 및 레이아웃

### 4.1 간격 스케일

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

### 4.2 모서리 반경

```css
:root {
  --radius-sm:   4px;   /* 작은 뱃지, 입력 필드 */
  --radius-md:   8px;   /* 카드, 드롭다운 */
  --radius-lg:   16px;  /* 모달, 패널 */
  --radius-full: 9999px; /* 탭 칩, pill 버튼, 아바타 */
}
```

### 4.3 그림자

```css
:root {
  --shadow-sm: 0 1px 2px rgba(60, 64, 67, 0.1),
               0 1px 3px 1px rgba(60, 64, 67, 0.08);   /* 카드 기본 */
  --shadow-md: 0 1px 3px rgba(60, 64, 67, 0.15),
               0 4px 8px 3px rgba(60, 64, 67, 0.1);    /* 모달, hover 카드 */
  --shadow-lg: 0 2px 6px rgba(60, 64, 67, 0.15),
               0 8px 24px 4px rgba(60, 64, 67, 0.15);  /* 드롭다운 메뉴 */
}
```

### 4.4 반응형 브레이크포인트

```css
/* 모바일 우선 (Mobile-First) */
/* 기본: 320px ~ 767px (모바일) */
/* @media (min-width: 768px)  — 태블릿  */
/* @media (min-width: 1024px) — 데스크톱 */
/* @media (min-width: 1280px) — 와이드 데스크톱 */
```

---

## 5. 컴포넌트

### 5.1 버튼 (Button)

레퍼런스 이미지에서 두 가지 버튼 유형이 사용된다.

#### Primary 버튼 — "저장" 버튼

```css
.btn-primary {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-full); /* pill 형태 */
  padding: var(--space-2) var(--space-6);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  height: 40px;
  min-width: 72px;
  transition: background-color 0.15s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
}

.btn-primary:disabled {
  background-color: var(--color-text-disabled);
  cursor: not-allowed;
}
```

#### Ghost 버튼 — "옵션 더보기" 버튼

```css
.btn-ghost {
  background-color: transparent;
  color: var(--color-primary);
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  height: 40px;
  transition: background-color 0.15s ease;
}

.btn-ghost:hover {
  background-color: var(--color-primary-light);
}
```

#### Danger 버튼 — 삭제 확인

```css
.btn-danger {
  background-color: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  height: 36px;
}

.btn-danger:hover {
  background-color: #fce8e6;
}
```

---

### 5.2 탭 / 필터 칩 (Tab / Chip)

레퍼런스 이미지의 "일정 | 할 일 | 약속 일정" 탭을 참조한다.

```css
.chip-group {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-1);
  background-color: var(--color-bg-page);
  border-radius: var(--radius-full);
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  border: none;
  background: transparent;
  transition: background-color 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.chip:hover {
  background-color: var(--color-bg-chip-active);
}

.chip.active {
  background-color: var(--color-bg-chip-active);
  color: var(--color-primary);
}
```

**TodoList 앱 사용 위치:** 할일 목록 화면(S-03)의 상태 필터 (전체 / 미시작 / 진행중 / 완료)

---

### 5.3 뱃지 (Badge)

레퍼런스 이미지의 "New" 뱃지를 참조한다.

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

/* 기본 — New 뱃지 등 */
.badge-primary {
  background-color: var(--color-primary);
  color: #ffffff;
}

/* 기한초과 */
.badge-overdue {
  background-color: var(--color-warning);
  color: #202124;
}

/* 완료 상태 */
.badge-success {
  background-color: var(--color-success);
  color: #ffffff;
}

/* 미시작 */
.badge-default {
  background-color: var(--color-bg-page);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

/* 진행중 */
.badge-progress {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
```

---

### 5.4 입력 필드 (Input)

레퍼런스 이미지의 "제목 추가" 입력 필드 스타일을 참조한다.  
하단 border만 있는 **underline 스타일**을 사용한다.

```css
/* Underline Input (모달/폼 대제목용) */
.input-underline {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--color-border);
  background: transparent;
  padding: var(--space-2) 0;
  font-size: var(--text-xl);
  font-family: var(--font-family);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.2s ease;
}

.input-underline::placeholder {
  color: var(--color-text-placeholder);
}

.input-underline:focus {
  border-bottom-color: var(--color-border-focus);
}

/* 일반 Outlined Input (폼 필드용) */
.input-outlined {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  color: var(--color-text-primary);
  outline: none;
  height: 40px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-outlined:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.input-outlined.error {
  border-color: var(--color-error);
}

/* Textarea */
.input-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  color: var(--color-text-primary);
  outline: none;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.input-textarea:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}
```

---

### 5.5 셀렉트 / 드롭다운 (Select)

```css
.select {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  color: var(--color-text-primary);
  height: 40px;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* 화살표 아이콘 */
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
}

.select:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}
```

---

### 5.6 아이콘 + 텍스트 행 (Icon Row)

레퍼런스 이미지의 "시계 아이콘 + 날짜/시간 텍스트" 행 패턴을 참조한다.  
TodoList에서는 할일 카드의 날짜, 카테고리, 상태 표시에 활용한다.

```css
.icon-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  min-height: 48px;
}

.icon-row__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--color-icon);
  margin-top: 2px; /* 텍스트 첫 줄과 수직 정렬 */
}

.icon-row__content {
  flex: 1;
  min-width: 0;
}

.icon-row__primary {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.icon-row__secondary {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}
```

---

### 5.7 카드 (Card)

```css
.card {
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
  transition: box-shadow 0.15s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* 기한초과 카드 — 왼쪽 border 강조 */
.card.overdue {
  border-left: 3px solid var(--color-warning);
}

/* 완료 카드 — 흐리게 처리 */
.card.completed {
  opacity: 0.65;
}
```

---

### 5.8 모달 (Modal)

레퍼런스 이미지의 이벤트 추가 팝업 전체 스타일을 참조한다.

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
  position: relative;
}

/* 모달 닫기 버튼 (×) */
.modal__close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: transparent;
  border: none;
  color: var(--color-icon);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__close:hover {
  background: var(--color-bg-page);
}

/* 모달 하단 액션 영역 */
.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-divider);
}
```

---

### 5.9 폼 레이아웃

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}

.form-label.required::after {
  content: ' *';
  color: var(--color-error);
}

.form-error {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin-top: var(--space-1);
}

/* 날짜 두 칸 나란히 (시작일 ~ 종료일) */
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
```

---

### 5.10 헤더 (Header)

```css
.header {
  height: 56px;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header__logo {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  text-decoration: none;
  margin-right: auto;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header__nav-link {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  transition: background-color 0.15s, color 0.15s;
}

.header__nav-link:hover,
.header__nav-link.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
```

---

### 5.11 빈 상태 (Empty State)

할일이 없거나 필터 결과가 없을 때 표시한다.

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state__icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-disabled);
  margin-bottom: var(--space-4);
}

.empty-state__message {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}
```

---

### 5.12 오류 메시지 (Error Alert)

```css
.error-alert {
  background-color: #fce8e6;
  border: 1px solid #f5c6c2;
  border-radius: var(--radius-sm);
  color: var(--color-error);
  font-size: var(--text-sm);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
}

[data-theme="dark"] .error-alert {
  background-color: #3b1f1f;
  border-color: #5c2b29;
}
```

---

## 6. 아이콘 사용 가이드

아이콘은 **Google Material Icons** (`outlined` 계열)을 사용한다.

```html
<!-- CDN 설치 (index.html) -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
```

| 위치 | 아이콘 이름 | 설명 |
|------|------------|------|
| 시간/날짜 | `schedule`, `calendar_today` | 할일 날짜 아이콘 |
| 카테고리 | `label`, `folder` | 카테고리 아이콘 |
| 상태 | `radio_button_unchecked`, `timelapse`, `check_circle` | 미시작/진행중/완료 |
| 기한초과 | `warning` | 기한초과 경고 |
| 삭제 | `delete` | 삭제 버튼 |
| 수정 | `edit` | 수정 버튼 |
| 닫기 | `close` | 모달 닫기 (×) |
| 메뉴 | `menu` | 모바일 햄버거 메뉴 |
| 추가 | `add` | 할일/카테고리 추가 |
| 사용자 | `person` | 내 정보 |
| 로그아웃 | `logout` | 로그아웃 |

```css
.icon {
  font-family: 'Material Icons Outlined';
  font-size: 20px;
  color: var(--color-icon);
  display: inline-flex;
  align-items: center;
  user-select: none;
}

.icon.primary { color: var(--color-primary); }
.icon.sm { font-size: 16px; }
.icon.lg { font-size: 24px; }
```

---

## 7. 페이지 레이아웃

```css
/* 전체 앱 래퍼 */
.app {
  min-height: 100vh;
  background-color: var(--color-bg-page);
}

/* 컨텐츠 영역 */
.page-content {
  max-width: 768px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

/* 모바일 (320~767px) */
@media (max-width: 767px) {
  .page-content {
    padding: var(--space-4) var(--space-3);
  }
}
```

---

## 8. 상태별 시각적 표현

### 할일 상태

| 상태 | 배지 색상 | 텍스트 색 | 아이콘 |
|------|-----------|----------|--------|
| 미시작 | `--color-bg-page` + `--color-border` | `--color-text-secondary` | `radio_button_unchecked` |
| 진행중 | `--color-primary-light` | `--color-primary` | `timelapse` |
| 완료 | `--color-success` (연하게) | `--color-success` | `check_circle` |

### 기한초과

- 할일 카드 왼쪽에 `3px solid var(--color-warning)` 세로선 표시
- 배지: `badge-overdue` (노란 배경)
- 종료일 텍스트: `--color-error` 색상

```css
/* 완료 상태 할일 — 취소선 효과 */
.todo-title.completed {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}
```

---

## 9. 트랜지션 및 애니메이션

```css
:root {
  --transition-fast:   0.1s ease;
  --transition-base:   0.2s ease;
  --transition-slow:   0.3s ease;
}

/* 모달 등장 */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.modal {
  animation: fade-in 0.2s ease;
}

/* 카드 목록 등장 */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card {
  animation: slide-up 0.15s ease;
}
```

---

## 10. CSS 변수 전체 선언 예시

`src/styles/variables.css`에 아래 내용을 그대로 사용한다.

```css
/* src/styles/variables.css */
:root {
  /* === 색상 === */
  --color-bg-page:        #f0f4f9;
  --color-bg-surface:     #ffffff;
  --color-bg-chip-active: #d2e3fc;
  --color-text-primary:   #202124;
  --color-text-secondary: #5f6368;
  --color-text-placeholder: #80868b;
  --color-text-disabled:  #bdc1c6;
  --color-primary:        #1a73e8;
  --color-primary-hover:  #1765cc;
  --color-primary-light:  #e8f0fe;
  --color-success:        #34a853;
  --color-warning:        #fbbc04;
  --color-error:          #d93025;
  --color-border:         #e0e0e0;
  --color-border-focus:   #1a73e8;
  --color-divider:        #f1f3f4;
  --color-icon:           #5f6368;
  --color-icon-active:    #1a73e8;

  /* === 타이포그래피 === */
  --font-family: 'Google Sans', 'Noto Sans KR', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --text-xs:   12px;
  --text-sm:   14px;
  --text-base: 16px;
  --text-lg:   20px;
  --text-xl:   24px;
  --text-2xl:  28px;
  --font-regular: 400;
  --font-medium:  500;
  --font-bold:    700;

  /* === 간격 === */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* === 기타 === */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(60,64,67,0.1), 0 1px 3px 1px rgba(60,64,67,0.08);
  --shadow-md: 0 1px 3px rgba(60,64,67,0.15), 0 4px 8px 3px rgba(60,64,67,0.1);
  --shadow-lg: 0 2px 6px rgba(60,64,67,0.15), 0 8px 24px 4px rgba(60,64,67,0.15);
  --transition-fast: 0.1s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}

[data-theme="dark"] {
  --color-bg-page:        #1e1e2e;
  --color-bg-surface:     #2d2d3f;
  --color-bg-chip-active: #1e3a5f;
  --color-text-primary:   #e8eaed;
  --color-text-secondary: #9aa0a6;
  --color-text-placeholder: #5f6368;
  --color-text-disabled:  #3c4043;
  --color-primary:        #8ab4f8;
  --color-primary-hover:  #aecbfa;
  --color-primary-light:  #1a3a5c;
  --color-success:        #81c995;
  --color-warning:        #fdd663;
  --color-error:          #f28b82;
  --color-border:         #3c4043;
  --color-border-focus:   #8ab4f8;
  --color-divider:        #3c4043;
  --color-icon:           #9aa0a6;
  --color-icon-active:    #8ab4f8;
}
```
